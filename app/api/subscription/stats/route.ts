import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await db.conversation.findMany({
    where: { userId: session.user.id },
    select: { duration: true, overallScore: true },
  });

  const totalSessions = conversations.length;
  const totalMinutes = conversations.reduce((sum, c) => sum + c.duration, 0);
  const avgScore =
    totalSessions > 0
      ? Math.round(
          conversations.reduce((sum, c) => sum + c.overallScore, 0) /
            totalSessions
        )
      : 0;

  return NextResponse.json({
    sessions: totalSessions,
    practiceTime: `${Math.round(totalMinutes / 60)}h`,
    avgScore,
  });
}
