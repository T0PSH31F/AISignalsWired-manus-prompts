import { and, desc, eq, gte, lte, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertSignal,
  InsertStrategyPerformance,
  InsertSubscription,
  InsertUser,
  InsertUserPreferences,
  signals,
  strategyPerformance,
  subscriptions,
  userPreferences,
  users 
} from "../drizzle/schema";
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

// Signal queries
export async function createSignal(signal: InsertSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(signals).values(signal);
  return result;
}

export async function getLatestSignals(limit: number = 10, tier: string = "free") {
  const db = await getDb();
  if (!db) return [];
  
  // Free tier: only 5 signals per day
  const actualLimit = tier === "free" ? Math.min(limit, 5) : limit;
  
  const result = await db
    .select()
    .from(signals)
    .orderBy(desc(signals.createdAt))
    .limit(actualLimit);
  return result;
}

export async function getSignalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(signals).where(eq(signals.id, id)).limit(1);
  return result[0];
}

export async function getSignalsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(signals)
    .where(and(
      gte(signals.createdAt, startDate),
      lte(signals.createdAt, endDate)
    ))
    .orderBy(desc(signals.createdAt));
  return result;
}

export async function updateSignalOutcome(
  id: number,
  outcome: "win" | "loss" | "neutral",
  actualReturnPercent: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(signals)
    .set({ outcome, actualReturnPercent, closedAt: new Date() })
    .where(eq(signals.id, id));
}

// Strategy performance queries
export async function getStrategyPerformance(strategyName?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (strategyName) {
    const result = await db
      .select()
      .from(strategyPerformance)
      .where(eq(strategyPerformance.strategyName, strategyName))
      .limit(1);
    return result[0];
  }
  
  return await db.select().from(strategyPerformance);
}

export async function upsertStrategyPerformance(data: InsertStrategyPerformance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .insert(strategyPerformance)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        winRate7d: data.winRate7d,
        winRate30d: data.winRate30d,
        totalSignals: data.totalSignals,
        avgReturnPercent: data.avgReturnPercent,
        status: data.status,
        lastUpdated: new Date(),
      },
    });
}

export async function toggleStrategyStatus(strategyName: string, status: "active" | "paused") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(strategyPerformance)
    .set({ status })
    .where(eq(strategyPerformance.strategyName, strategyName));
}

// Subscription queries
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return result[0];
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptions).values(data);
}

export async function updateSubscription(
  userId: number,
  data: Partial<InsertSubscription>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0];
}

// User preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertUserPreferences(data: InsertUserPreferences) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .insert(userPreferences)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        discordWebhook: data.discordWebhook,
        emailNotifications: data.emailNotifications,
        apiKey: data.apiKey,
        updatedAt: new Date(),
      },
    });
}

// Performance calculation helpers
export async function calculatePlatformWinRate(days: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const allSignals = await db
    .select()
    .from(signals)
    .where(and(
      gte(signals.createdAt, startDate),
      ne(signals.outcome, "open")
    ));
  
  if (allSignals.length === 0) return 0;
  
  const wins = allSignals.filter(s => s.outcome === "win").length;
  return wins / allSignals.length;
}

export async function getOpenSignalsCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select()
    .from(signals)
    .where(eq(signals.outcome, "open"));
  
  return result.length;
}
