import { db } from "./db";

export type PlanType = "free" | "pro" | "premium";

export interface PlanLimits {
  dailyMinutes: number;
  monthlyMinutes: number;
  maxSessionMinutes: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    dailyMinutes: 30,
    monthlyMinutes: 450,
    maxSessionMinutes: 15,
  },
  pro: {
    dailyMinutes: 60,
    monthlyMinutes: 1500,
    maxSessionMinutes: 30,
  },
  premium: {
    dailyMinutes: 120,
    monthlyMinutes: 3000,
    maxSessionMinutes: 45,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  const normalized = plan.toLowerCase() as PlanType;
  return PLAN_LIMITS[normalized] || PLAN_LIMITS.free;
}

function getUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getUtcMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getUsageToday(userId: string) {
  const today = getUtcToday();

  let record = await db.usageTracking.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!record) {
    record = await db.usageTracking.create({
      data: { userId, date: today },
    });
  }

  return record;
}

export async function getMonthlyUsage(userId: string) {
  const monthStart = getUtcMonthStart();

  const records = await db.usageTracking.findMany({
    where: {
      userId,
      date: { gte: monthStart },
    },
  });

  return records.reduce((sum: number, r: any) => sum + r.monthlyMinutesUsed, 0);
}

export interface UsageCheck {
  allowed: boolean;
  reason?: "daily" | "monthly" | "session";
  dailyRemaining: number;
  monthlyRemaining: number;
  sessionMax: number;
  dailyUsed: number;
  monthlyUsed: number;
}

export async function canStartSession(
  userId: string,
  plan: string
): Promise<UsageCheck> {
  const limits = getPlanLimits(plan);
  const todayRecord = await getUsageToday(userId);
  const monthlyUsed = await getMonthlyUsage(userId);

  const dailyRemaining = Math.max(0, limits.dailyMinutes - todayRecord.dailyMinutesUsed);
  const monthlyRemaining = Math.max(0, limits.monthlyMinutes - monthlyUsed);

  if (dailyRemaining <= 0) {
    return {
      allowed: false,
      reason: "daily",
      dailyRemaining: 0,
      monthlyRemaining,
      sessionMax: limits.maxSessionMinutes,
      dailyUsed: todayRecord.dailyMinutesUsed,
      monthlyUsed,
    };
  }

  if (monthlyRemaining <= 0) {
    return {
      allowed: false,
      reason: "monthly",
      dailyRemaining,
      monthlyRemaining: 0,
      sessionMax: limits.maxSessionMinutes,
      dailyUsed: todayRecord.dailyMinutesUsed,
      monthlyUsed,
    };
  }

  return {
    allowed: true,
    dailyRemaining,
    monthlyRemaining,
    sessionMax: limits.maxSessionMinutes,
    dailyUsed: todayRecord.dailyMinutesUsed,
    monthlyUsed,
  };
}

export async function recordSessionUsage(
  userId: string,
  durationMinutes: number
): Promise<void> {
  const today = getUtcToday();

  await db.usageTracking.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      dailyMinutesUsed: durationMinutes,
      monthlyMinutesUsed: durationMinutes,
      sessionsToday: 1,
    },
    update: {
      dailyMinutesUsed: { increment: durationMinutes },
      monthlyMinutesUsed: { increment: durationMinutes },
      sessionsToday: { increment: 1 },
    },
  });
}

export async function getUsageStats(userId: string, plan: string) {
  const limits = getPlanLimits(plan);
  const todayRecord = await getUsageToday(userId);
  const monthlyUsed = await getMonthlyUsage(userId);

  const dailyRemaining = Math.max(0, limits.dailyMinutes - todayRecord.dailyMinutesUsed);
  const monthlyRemaining = Math.max(0, limits.monthlyMinutes - monthlyUsed);

  return {
    plan,
    limits,
    daily: {
      used: todayRecord.dailyMinutesUsed,
      limit: limits.dailyMinutes,
      remaining: dailyRemaining,
      percentage: Math.min(100, Math.round((todayRecord.dailyMinutesUsed / limits.dailyMinutes) * 100)),
    },
    monthly: {
      used: monthlyUsed,
      limit: limits.monthlyMinutes,
      remaining: monthlyRemaining,
      percentage: Math.min(100, Math.round((monthlyUsed / limits.monthlyMinutes) * 100)),
    },
    sessionsToday: todayRecord.sessionsToday,
    maxSessionMinutes: limits.maxSessionMinutes,
  };
}
