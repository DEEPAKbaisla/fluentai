import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUsageStats, canStartSession } from "@/lib/limits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const plan = user?.plan || "free";

  const [usageStats, sessionCheck] = await Promise.all([
    getUsageStats(session.user.id, plan),
    canStartSession(session.user.id, plan),
  ]);

  return NextResponse.json({
    ...usageStats,
    canStartSession: sessionCheck.allowed,
    limitReason: sessionCheck.reason || null,
  });
}
