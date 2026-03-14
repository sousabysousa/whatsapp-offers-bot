import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { offers, messageHistory } from "../../drizzle/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export const offersRouter = router({
  /**
   * Criar novo agendamento de oferta
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        scheduledAt: z.date(),
        groupIds: z.array(z.number()).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(offers).values({
          userId: ctx.user.id,
          productId: input.productId,
          scheduledAt: input.scheduledAt,
          groupIds: input.groupIds,
          status: "pending",
        });

        return { success: true };
      } catch (error) {
        console.error("[Offers Router] Erro ao criar oferta:", error);
        throw error;
      }
    }),

  /**
   * Listar ofertas do usuário
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(offers).where(eq(offers.userId, ctx.user.id));
    } catch (error) {
      console.error("[Offers Router] Erro ao listar ofertas:", error);
      throw error;
    }
  }),

  /**
   * Listar ofertas agendadas (futuras)
   */
  listScheduled: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const now = new Date();
      return await db
        .select()
        .from(offers)
        .where(and(eq(offers.userId, ctx.user.id), gte(offers.scheduledAt, now), eq(offers.status, "pending")));
    } catch (error) {
      console.error("[Offers Router] Erro ao listar ofertas agendadas:", error);
      throw error;
    }
  }),

  /**
   * Obter oferta por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db
          .select()
          .from(offers)
          .where(and(eq(offers.id, input.id), eq(offers.userId, ctx.user.id)))
          .limit(1);

        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error("[Offers Router] Erro ao obter oferta:", error);
        throw error;
      }
    }),

  /**
   * Atualizar oferta
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        scheduledAt: z.date().optional(),
        groupIds: z.array(z.number()).optional(),
        status: z.enum(["pending", "sent", "failed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...updateData } = input;

        await db
          .update(offers)
          .set(updateData)
          .where(and(eq(offers.id, id), eq(offers.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Offers Router] Erro ao atualizar oferta:", error);
        throw error;
      }
    }),

  /**
   * Deletar oferta
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .delete(offers)
          .where(and(eq(offers.id, input.id), eq(offers.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Offers Router] Erro ao deletar oferta:", error);
        throw error;
      }
    }),

  /**
   * Obter histórico de mensagens de uma oferta
   */
  getHistory: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        return await db
          .select()
          .from(messageHistory)
          .where(and(eq(messageHistory.userId, ctx.user.id), eq(messageHistory.offerId, input.offerId)));
      } catch (error) {
        console.error("[Offers Router] Erro ao obter histórico:", error);
        throw error;
      }
    }),

  /**
   * Obter estatísticas de envios
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userOffers = await db.select().from(offers).where(eq(offers.userId, ctx.user.id));

      const totalSent = userOffers.reduce((acc, offer) => acc + (offer.sentCount || 0), 0);
      const totalFailed = userOffers.reduce((acc, offer) => acc + (offer.failedCount || 0), 0);
      const successRate = totalSent + totalFailed > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0;

      return {
        totalOffers: userOffers.length,
        totalSent,
        totalFailed,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      console.error("[Offers Router] Erro ao obter estatísticas:", error);
      throw error;
    }
  }),
});
