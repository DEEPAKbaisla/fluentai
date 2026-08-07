import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latestConversations = await db.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 10,
  });

  if (latestConversations.length === 0) {
    return NextResponse.json({
      overall: { score: 0, change: 0 },
      grammar: { score: 0, change: 0 },
      pronunciation: { score: 0, change: 0 },
      vocabulary: { score: 0, change: 0 },
    });
  }

  const latest = latestConversations[0];
  const previous = latestConversations[1];

  function calcChange(current: number, prev: number | undefined) {
    if (!prev || prev === 0) return 0;
    return Math.round((current - prev) * 10) / 10;
  }

  return NextResponse.json({
    overall: {
      score: Math.round(latest.overallScore),
      change: calcChange(latest.overallScore, previous?.overallScore),
    },
    grammar: {
      score: Math.round(latest.grammarScore),
      change: calcChange(latest.grammarScore, previous?.grammarScore),
    },
    pronunciation: {
      score: Math.round(latest.pronunciationScore),
      change: calcChange(latest.pronunciationScore, previous?.pronunciationScore),
    },
    vocabulary: {
      score: Math.round(latest.vocabularyScore),
      change: calcChange(latest.vocabularyScore, previous?.vocabularyScore),
    },
  });
}
