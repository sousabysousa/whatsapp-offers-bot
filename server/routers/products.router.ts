import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const productsRouter = router({
  /**
   * Criar novo produto
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        productLink: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        price: z.string().optional(),
        emoji: z.string().default("🔥"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(products).values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          productLink: input.productLink,
          imageUrl: input.imageUrl,
          price: input.price,
          emoji: input.emoji,
        });

        return { success: true };
      } catch (error) {
        console.error("[Products Router] Erro ao criar produto:", error);
        throw error;
      }
    }),

  /**
   * Listar produtos do usuário
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(products).where(eq(products.userId, ctx.user.id));
    } catch (error) {
      console.error("[Products Router] Erro ao listar produtos:", error);
      throw error;
    }
  }),

  /**
   * Obter produto por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db
          .select()
          .from(products)
          .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)))
          .limit(1);

        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error("[Products Router] Erro ao obter produto:", error);
        throw error;
      }
    }),

  /**
   * Atualizar produto
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        productLink: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        price: z.string().optional(),
        emoji: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...updateData } = input;

        await db
          .update(products)
          .set(updateData)
          .where(and(eq(products.id, id), eq(products.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Products Router] Erro ao atualizar produto:", error);
        throw error;
      }
    }),

  /**
   * Deletar produto
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .delete(products)
          .where(and(eq(products.id, input.id), eq(products.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error("[Products Router] Erro ao deletar produto:", error);
        throw error;
      }
    }),
});
