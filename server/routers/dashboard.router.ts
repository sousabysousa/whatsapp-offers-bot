import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { groups, products, offers, messageHistory } from "../../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";

export const dashboardRouter = router({
  /**
   * Obter estatísticas do dashboard
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          totalGroups: 0,
          totalProducts: 0,
          totalOffers: 0,
          messagesTodaySent: 0,
          messagesScheduled: 0,
          successRate: 0,
        };
      }

      const userGroups = await db.select().from(groups).where(eq(groups.userId, ctx.user.id));

      const userProducts = await db.select().from(products).where(eq(products.userId, ctx.user.id));

      const userOffers = await db.select().from(offers).where(eq(offers.userId, ctx.user.id));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayMessages = await db
        .select()
        .from(messageHistory)
        .where(and(eq(messageHistory.userId, ctx.user.id), gte(messageHistory.createdAt, today)));

      const scheduledOffers = userOffers.filter((offer) => offer.status === "pending" && offer.scheduledAt > new Date());

      const sentMessages = todayMessages.filter((msg) => msg.status === "sent").length;
      const failedMessages = todayMessages.filter((msg) => msg.status === "failed").length;
      const successRate =
        sentMessages + failedMessages > 0 ? (sentMessages / (sentMessages + failedMessages)) * 100 : 0;

      return {
        totalGroups: userGroups.length,
        totalProducts: userProducts.length,
        totalOffers: userOffers.length,
        messagesTodaySent: sentMessages,
        messagesScheduled: scheduledOffers.length,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      console.error("[Dashboard Router] Erro ao obter estatísticas:", error);
      throw error;
    }
  }),

  /**
   * Obter histórico recente de mensagens
   */
  getRecentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(messageHistory)
        .where(eq(messageHistory.userId, ctx.user.id))
        .limit(20);
    } catch (error) {
      console.error("[Dashboard Router] Erro ao obter histórico:", error);
      throw error;
    }
  }),
});
