/**
 * Worker de Processamento de Mensagens
 * Processa jobs da fila Redis e envia mensagens via WAHA
 */

import { queueService } from "../services/queue.service";
import { wahaService } from "../services/waha.service";
import { getDb } from "../db";
import { messageHistory, offers, whatsappSessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface SendOfferJob {
  offerId: number;
  sessionId: number;
  groupIds: number[];
  productData: {
    title: string;
    description: string;
    imageUrl?: string;
    productLink: string;
    price?: string;
    emoji: string;
  };
}

interface SendMessageJob {
  sessionId: number;
  groupId: string;
  message: string;
}

export class MessageWorker {
  private isRunning = false;
  private processInterval: NodeJS.Timeout | null = null;

  /**
   * Iniciar worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[MessageWorker] Worker já está em execução");
      return;
    }

    this.isRunning = true;
    console.log("[MessageWorker] Worker iniciado");

    // Processar jobs a cada 5 segundos
    this.processInterval = setInterval(() => {
      this.processJobs();
    }, 5000);

    // Processar jobs agendados a cada 10 segundos
    setInterval(() => {
      this.processScheduledJobs();
    }, 10000);
  }

  /**
   * Parar worker
   */
  async stop(): Promise<void> {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    this.isRunning = false;
    console.log("[MessageWorker] Worker parado");
  }

  /**
   * Processar jobs da fila
   */
  private async processJobs(): Promise<void> {
    try {
      const job = await queueService.getNextJob();
      if (!job) return;

      console.log(`[MessageWorker] Processando job: ${job.id}`);

      try {
        if (job.type === "send_offer") {
          await this.processSendOfferJob(job.data);
        } else if (job.type === "send_message") {
          await this.processSendMessageJob(job.data);
        }

        await queueService.markJobCompleted(job.id);
        console.log(`[MessageWorker] Job completado: ${job.id}`);
      } catch (error) {
        console.error(`[MessageWorker] Erro ao processar job ${job.id}:`, error);

        job.retries++;
        if (job.retries < 3) {
          // Re-adicionar à fila para retry
          await queueService.addJob(job.type, job.data);
          console.log(`[MessageWorker] Job re-adicionado à fila (tentativa ${job.retries})`);
        } else {
          await queueService.markJobFailed(job.id, error instanceof Error ? error.message : "Erro desconhecido");
          console.log(`[MessageWorker] Job falhou após 3 tentativas: ${job.id}`);
        }
      }
    } catch (error) {
      console.error("[MessageWorker] Erro ao processar jobs:", error);
    }
  }

  /**
   * Processar jobs agendados
   */
  private async processScheduledJobs(): Promise<void> {
    try {
      const readyJobs = await queueService.getReadyScheduledJobs();
      console.log(`[MessageWorker] ${readyJobs.length} jobs agendados prontos para executar`);
    } catch (error) {
      console.error("[MessageWorker] Erro ao processar jobs agendados:", error);
    }
  }

  /**
   * Processar job de envio de oferta
   */
  private async processSendOfferJob(data: SendOfferJob): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const session = await db
      .select()
      .from(whatsappSessions)
      .where(eq(whatsappSessions.id, data.sessionId))
      .limit(1);

    if (!session.length) {
      throw new Error(`Sessão não encontrada: ${data.sessionId}`);
    }

    const sessionName = session[0].sessionName;

    // Enviar para cada grupo
    for (const groupId of data.groupIds) {
      try {
        // Verificar rate limiting
        const canSend = await queueService.canSendMessage(data.sessionId);
        if (!canSend) {
          console.log("[MessageWorker] Rate limit atingido, aguardando...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        // Enviar oferta formatada
        await wahaService.sendFormattedOffer(
          sessionName,
          `${groupId}@g.us`, // Adicionar sufixo de grupo
          data.productData.imageUrl,
          data.productData.title,
          data.productData.description,
          data.productData.price,
          data.productData.productLink,
          data.productData.emoji
        );

        // Registrar no histórico
        await db.insert(messageHistory).values({
          userId: session[0].userId,
          offerId: data.offerId,
          groupId: groupId,
          status: "sent",
          sentAt: new Date(),
        });

        // Atualizar contagem de envios
        const offer = await db.select().from(offers).where(eq(offers.id, data.offerId)).limit(1);
        if (offer.length) {
          await db
            .update(offers)
            .set({ sentCount: (offer[0].sentCount || 0) + 1 })
            .where(eq(offers.id, data.offerId));
        }

        // Delay entre mensagens
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`[MessageWorker] Erro ao enviar para grupo ${groupId}:`, error);

        // Registrar falha no histórico
        await db.insert(messageHistory).values({
          userId: session[0].userId,
          offerId: data.offerId,
          groupId: groupId,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
        });

        // Atualizar contagem de falhas
        const offer = await db.select().from(offers).where(eq(offers.id, data.offerId)).limit(1);
        if (offer.length) {
          await db
            .update(offers)
            .set({ failedCount: (offer[0].failedCount || 0) + 1 })
            .where(eq(offers.id, data.offerId));
        }
      }
    }
  }

  /**
   * Processar job de envio de mensagem simples
   */
  private async processSendMessageJob(data: SendMessageJob): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const session = await db
      .select()
      .from(whatsappSessions)
      .where(eq(whatsappSessions.id, data.sessionId))
      .limit(1);

    if (!session.length) {
      throw new Error(`Sessão não encontrada: ${data.sessionId}`);
    }

    const sessionName = session[0].sessionName;

    // Verificar rate limiting
    const canSend = await queueService.canSendMessage(data.sessionId);
    if (!canSend) {
      throw new Error("Rate limit atingido");
    }

    await wahaService.sendMessage(sessionName, data.groupId, data.message);
  }
}

export const messageWorker = new MessageWorker();
