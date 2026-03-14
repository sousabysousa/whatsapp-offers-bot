import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, whatsappSessions, groups, products, offers, messageHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// WhatsApp Sessions
export async function getWhatsappSession(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(whatsappSessions).where(eq(whatsappSessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserWhatsappSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(whatsappSessions).where(eq(whatsappSessions.userId, userId));
}

// Groups
export async function getUserGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(groups).where(eq(groups.userId, userId));
}

export async function getGroup(groupId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Products
export async function getUserProducts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}

export async function getProduct(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Offers
export async function getUserOffers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(offers).where(eq(offers.userId, userId));
}

export async function getOffer(offerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(offers).where(eq(offers.id, offerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Message History
export async function getMessageHistory(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messageHistory).where(eq(messageHistory.userId, userId)).limit(limit);
}
