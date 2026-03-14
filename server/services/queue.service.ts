/**
 * Serviço de Fila Redis - Processamento assíncrono de envios
 * Gerencia fila de mensagens, agendamentos e rate limiting
 */

import Redis from "ioredis";

type RedisError = Error | null;

interface QueueJob {
  id: string;
  type: "send_offer" | "send_message";
  data: any;
  status: "pending" | "processing" | "completed" | "failed";
  retries: number;
  createdAt: number;
  processedAt?: number;
}

class QueueService {
  private redis: Redis;
  private readonly MAX_RETRIES = 3;
  private readonly MESSAGES_PER_MINUTE = 20;
  private readonly DELAY_BETWEEN_MESSAGES = 3000; // 3 segundos

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    this.redis = new Redis(redisUrl);

    this.redis.on("error", (error: Error) => {
      console.error("[Queue] Redis error:", error);
    });

    this.redis.on("connect", () => {
      console.log("[Queue] Redis connected");
    });
  }

  /**
   * Adicionar job à fila
   */
  async addJob(type: "send_offer" | "send_message", data: any): Promise<string> {
    try {
      const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const job: QueueJob = {
        id: jobId,
        type,
        data,
        status: "pending",
        retries: 0,
        createdAt: Date.now(),
      };

      await this.redis.lpush("queue:jobs", JSON.stringify(job));
      console.log(`[Queue] Job adicionado: ${jobId}`);

      return jobId;
    } catch (error) {
      console.error("[Queue] Erro ao adicionar job:", error);
      throw error;
    }
  }

  /**
   * Obter próximo job da fila
   */
  async getNextJob(): Promise<QueueJob | null> {
    try {
      const jobData = await this.redis.rpop("queue:jobs");
      if (!jobData) return null;

      return JSON.parse(jobData) as QueueJob;
    } catch (error) {
      console.error("[Queue] Erro ao obter próximo job:", error);
      return null;
    }
  }

  /**
   * Marcar job como processado
   */
  async markJobCompleted(jobId: string): Promise<void> {
    try {
      await this.redis.hset(`job:${jobId}`, "status", "completed", "processedAt", Date.now().toString());
    } catch (error) {
      console.error("[Queue] Erro ao marcar job como completo:", error);
    }
  }

  /**
   * Marcar job como falho
   */
  async markJobFailed(jobId: string, error: string): Promise<void> {
    try {
      await this.redis.hset(
        `job:${jobId}`,
        "status",
        "failed",
        "error",
        error,
        "failedAt",
        Date.now().toString()
      );
    } catch (error) {
      console.error("[Queue] Erro ao marcar job como falho:", error);
    }
  }

  /**
   * Obter status do job
   */
  async getJobStatus(jobId: string): Promise<QueueJob | null> {
    try {
      const jobData = await this.redis.hgetall(`job:${jobId}`);
      if (!jobData || Object.keys(jobData).length === 0) return null;

      return jobData as any;
    } catch (error) {
      console.error("[Queue] Erro ao obter status do job:", error);
      return null;
    }
  }

  /**
   * Controlar rate limiting - verificar se pode enviar mensagem
   */
  async canSendMessage(sessionId: number): Promise<boolean> {
    try {
      const key = `rate_limit:${sessionId}`;
      const count = await this.redis.incr(key);

      if (count === 1) {
        await this.redis.expire(key, 60); // Reset a cada minuto
      }

      return count <= this.MESSAGES_PER_MINUTE;
    } catch (error) {
      console.error("[Queue] Erro ao verificar rate limit:", error);
      return true; // Permitir em caso de erro
    }
  }

  /**
   * Obter número de mensagens enviadas no minuto
   */
  async getMessageCount(sessionId: number): Promise<number> {
    try {
      const key = `rate_limit:${sessionId}`;
      const count = await this.redis.get(key);
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error("[Queue] Erro ao obter contagem de mensagens:", error);
      return 0;
    }
  }

  /**
   * Agendar job para executar em tempo específico
   */
  async scheduleJob(type: "send_offer" | "send_message", data: any, executeAt: Date): Promise<string> {
    try {
      const jobId = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const job = {
        id: jobId,
        type,
        data,
        status: "pending",
        retries: 0,
        createdAt: Date.now(),
        executeAt: executeAt.getTime(),
      };

      const score = executeAt.getTime();
      await this.redis.zadd("queue:scheduled", score, JSON.stringify(job));
      console.log(`[Queue] Job agendado: ${jobId} para ${executeAt.toISOString()}`);

      return jobId;
    } catch (error) {
      console.error("[Queue] Erro ao agendar job:", error);
      throw error;
    }
  }

  /**
   * Obter jobs agendados prontos para executar
   */
  async getReadyScheduledJobs(): Promise<QueueJob[]> {
    try {
      const now = Date.now();
      const jobs = await this.redis.zrangebyscore("queue:scheduled", "-inf", now);

      const readyJobs: QueueJob[] = [];
      for (const jobData of jobs) {
        const job = JSON.parse(jobData) as QueueJob;
        readyJobs.push(job);
        // Remover da fila de agendados
        await this.redis.zrem("queue:scheduled", jobData);
        // Adicionar à fila normal
        await this.redis.lpush("queue:jobs", jobData);
      }

      return readyJobs;
    } catch (error) {
      console.error("[Queue] Erro ao obter jobs agendados:", error);
      return [];
    }
  }

  /**
   * Obter estatísticas da fila
   */
  async getQueueStats(): Promise<{
    pendingJobs: number;
    scheduledJobs: number;
  }> {
    try {
      const pendingJobs = await this.redis.llen("queue:jobs");
      const scheduledJobs = await this.redis.zcard("queue:scheduled");

      return {
        pendingJobs,
        scheduledJobs,
      };
    } catch (error) {
      console.error("[Queue] Erro ao obter estatísticas:", error);
      return { pendingJobs: 0, scheduledJobs: 0 };
    }
  }

  /**
   * Limpar fila (apenas para desenvolvimento)
   */
  async clearQueue(): Promise<void> {
    try {
      await this.redis.del("queue:jobs");
      await this.redis.del("queue:scheduled");
      console.log("[Queue] Fila limpa");
    } catch (error) {
      console.error("[Queue] Erro ao limpar fila:", error);
    }
  }

  /**
   * Fechar conexão Redis
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      console.log("[Queue] Conexão Redis fechada");
    } catch (error) {
      console.error("[Queue] Erro ao fechar Redis:", error);
    }
  }
}

export const queueService = new QueueService();
