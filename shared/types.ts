/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Custom types for the application
export type WhatsAppSessionStatus = "disconnected" | "connecting" | "connected" | "error";
export type MessageStatus = "sent" | "failed" | "pending";
export type OfferStatus = "pending" | "sent" | "failed" | "cancelled";

export interface DashboardStats {
  totalGroups: number;
  totalProducts: number;
  totalOffers: number;
  messagesTodaySent: number;
  messagesScheduled: number;
  successRate: number;
}

export interface MessagePayload {
  groupId: string;
  productId: number;
  title: string;
  description: string;
  imageUrl?: string;
  productLink: string;
  price?: string;
  emoji: string;
}
