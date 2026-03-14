import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { groups } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const groupsRouter = router({
  /**
   * Criar novo grupo
   */
  create: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        groupName: z.string().min(1),
        groupId: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(groups).values({
          userId: ctx.user.id,
          sessionId: input.sessionId,
          groupName: input.groupName,
          groupId: input.groupId,
          description: input.description,
          isActive: true,
        });

        return { success: true };
      } catch (error) {
        console.error("[Groups Router] Erro ao criar grupo:", error);
        throw error;
      }
    }),

  /**
   * Listar grupos do usuário
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(groups).where(eq(groups.userId, ctx.user.id));
    } catch (error) {
      console.error("[Groups Router] Erro ao listar grupos:", error);
      throw error;
    }
  }),

  /**
   * Obter grupo por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db
          .select()
          .from(groups)
          .where(and(eq(groups.id, input.id), eq(groups.userId, ctx.user.id)))
          .limit(1);

        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error("[Groups Router] Erro ao obter grupo:", error);
        throw error;
      }
    }),

  /**
   * Atualizar grupo
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        groupName: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...updateData } = input;

        await db
          .update(groups)
          .set(updateData)
          .where(and(eq(groups.id, id), eq(groups.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Groups Router] Erro ao atualizar grupo:", error);
        throw error;
      }
    }),

  /**
   * Deletar grupo
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(groups).where(and(eq(groups.id, input.id), eq(groups.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Groups Router] Erro ao deletar grupo:", error);
        throw error;
      }
    }),

  /**
   * Listar grupos por sessão
   */
  listBySession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        return await db
          .select()
          .from(groups)
          .where(and(eq(groups.userId, ctx.user.id), eq(groups.sessionId, input.sessionId)));
      } catch (error) {
        console.error("[Groups Router] Erro ao listar grupos por sessão:", error);
        throw error;
      }
    }),
});
