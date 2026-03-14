import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * WhatsApp Sessions - Gerencia as conexões com WhatsApp via WAHA
 */
export const whatsappSessions = mysqlTable("whatsapp_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionName: varchar("session_name", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["disconnected", "connecting", "connected", "error"]).default("disconnected").notNull(),
  qrCode: text("qr_code"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappSession = typeof whatsappSessions.$inferSelect;
export type InsertWhatsappSession = typeof whatsappSessions.$inferInsert;

/**
 * Groups - Grupos do WhatsApp para envio de ofertas
 */
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("session_id").notNull().references(() => whatsappSessions.id, { onDelete: "cascade" }),
  groupName: varchar("group_name", { length: 255 }).notNull(),
  groupId: varchar("group_id", { length: 255 }).notNull(),
  description: text("description"),
  participantCount: int("participant_count").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Products - Produtos/Ofertas a serem enviadas
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  productLink: varchar("product_link", { length: 2048 }),
  imageUrl: varchar("image_url", { length: 2048 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  emoji: varchar("emoji", { length: 10 }).default("🔥"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Offers - Agendamentos de ofertas para envio
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "cancelled"]).default("pending").notNull(),
  groupIds: json("group_ids").$type<number[]>().notNull(),
  sentCount: int("sent_count").default(0),
  failedCount: int("failed_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Message History - Histórico de mensagens enviadas
 */
export const messageHistory = mysqlTable("message_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  offerId: int("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  groupId: int("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MessageHistory = typeof messageHistory.$inferSelect;
export type InsertMessageHistory = typeof messageHistory.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  whatsappSessions: many(whatsappSessions),
  groups: many(groups),
  products: many(products),
  offers: many(offers),
  messageHistory: many(messageHistory),
}));

export const whatsappSessionsRelations = relations(whatsappSessions, ({ one, many }) => ({
  user: one(users, { fields: [whatsappSessions.userId], references: [users.id] }),
  groups: many(groups),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  user: one(users, { fields: [groups.userId], references: [users.id] }),
  session: one(whatsappSessions, { fields: [groups.sessionId], references: [whatsappSessions.id] }),
  messageHistory: many(messageHistory),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, { fields: [products.userId], references: [users.id] }),
  offers: many(offers),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  user: one(users, { fields: [offers.userId], references: [users.id] }),
  product: one(products, { fields: [offers.productId], references: [products.id] }),
  messageHistory: many(messageHistory),
}));

export const messageHistoryRelations = relations(messageHistory, ({ one }) => ({
  user: one(users, { fields: [messageHistory.userId], references: [users.id] }),
  offer: one(offers, { fields: [messageHistory.offerId], references: [offers.id] }),
  group: one(groups, { fields: [messageHistory.groupId], references: [groups.id] }),
}));