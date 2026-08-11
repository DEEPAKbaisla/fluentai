import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const conversations = await db.conversation.findMany({
    where: {
      userId: session.user.id,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "asc" },
  });

  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    const dateStr = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

    const dayConversations = conversations.filter((c: any) => {
      const cDate = new Date(c.date);
      return cDate.toDateString() === date.toDateString();
    });

    function avg(field: "grammarScore" | "pronunciationScore" | "vocabularyScore" | "fluencyScore") {
      if (dayConversations.length === 0) return 70;
      return Math.round(
        dayConversations.reduce((sum: number, c: any) => sum + c[field], 0) /
          dayConversations.length
      );
    }

    return {
      date: dateStr,
      grammar: avg("grammarScore"),
      pronunciation: avg("pronunciationScore"),
      vocabulary: avg("vocabularyScore"),
      fluency: avg("fluencyScore"),
    };
  });

  return NextResponse.json(monthlyData);
}
