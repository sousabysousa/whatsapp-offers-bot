import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { wahaService } from "../services/waha.service";
import { getDb } from "../db";
import { whatsappSessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const whatsappRouter = router({
  /**
   * Criar nova sessão WhatsApp
   */
  createSession: protectedProcedure
    .input(z.object({ sessionName: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await wahaService.createSession(input.sessionName);

        const session = await db.insert(whatsappSessions).values({
          userId: ctx.user.id,
          sessionName: input.sessionName,
          status: "connecting",
        });

        return {
          success: true,
          sessionName: input.sessionName,
          status: "connecting",
        };
      } catch (error) {
        console.error("[WhatsApp Router] Erro ao criar sessão:", error);
        throw error;
      }
    }),

  /**
   * Obter informações da sessão (incluindo QR code)
   */
  getSessionInfo: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const session = await db
          .select()
          .from(whatsappSessions)
          .where(eq(whatsappSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new Error("Sessão não encontrada");
        }

        const wahaInfo = await wahaService.getSessionInfo(session[0].sessionName);

        await db
          .update(whatsappSessions)
          .set({
            status: wahaInfo.status as any,
            qrCode: wahaInfo.qr || null,
            phoneNumber: wahaInfo.me?.id || null,
          })
          .where(eq(whatsappSessions.id, input.sessionId));

        return {
          ...session[0],
          qrCode: wahaInfo.qr,
          status: wahaInfo.status,
        };
      } catch (error) {
        console.error("[WhatsApp Router] Erro ao obter info da sessão:", error);
        throw error;
      }
    }),

  /**
   * Listar todas as sessões do usuário
   */
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(whatsappSessions).where(eq(whatsappSessions.userId, ctx.user.id));
    } catch (error) {
      console.error("[WhatsApp Router] Erro ao listar sessões:", error);
      throw error;
    }
  }),

  /**
   * Desconectar sessão
   */
  disconnectSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const session = await db
          .select()
          .from(whatsappSessions)
          .where(eq(whatsappSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new Error("Sessão não encontrada");
        }

        await wahaService.disconnectSession(session[0].sessionName);

        await db
          .update(whatsappSessions)
          .set({ status: "disconnected" })
          .where(eq(whatsappSessions.id, input.sessionId));

        return { success: true };
      } catch (error) {
        console.error("[WhatsApp Router] Erro ao desconectar:", error);
        throw error;
      }
    }),

  /**
   * Testar envio de mensagem para um grupo
   */
  testSendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        groupId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const session = await db
          .select()
          .from(whatsappSessions)
          .where(eq(whatsappSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new Error("Sessão não encontrada");
        }

        const result = await wahaService.sendMessage(session[0].sessionName, input.groupId, input.message);

        return {
          success: true,
          messageId: result.messageId,
        };
      } catch (error) {
        console.error("[WhatsApp Router] Erro ao enviar mensagem de teste:", error);
        throw error;
      }
    }),

  /**
   * Obter lista de grupos da sessão
   */
  getGroups: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const session = await db
          .select()
          .from(whatsappSessions)
          .where(eq(whatsappSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new Error("Sessão não encontrada");
        }

        return await wahaService.getGroups(session[0].sessionName);
      } catch (error) {
        console.error("[WhatsApp Router] Erro ao obter grupos:", error);
        throw error;
      }
    }),

  /**
   * Testar conexão com WAHA
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      const isConnected = await wahaService.testConnection();
      return { connected: isConnected };
    } catch (error) {
      console.error("[WhatsApp Router] Erro ao testar conexão:", error);
      return { connected: false };
    }
  }),
});
