import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const conversations = await db.conversation.findMany({
    where: {
      userId: session.user.id,
      date: { gte: sevenDaysAgo },
    },
    orderBy: { date: "asc" },
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    const dayName = dayNames[date.getDay()];

    const dayConversations = conversations.filter((c) => {
      const cDate = new Date(c.date);
      return cDate.toDateString() === date.toDateString();
    });

    const avgScore =
      dayConversations.length > 0
        ? Math.round(
            dayConversations.reduce((sum, c) => sum + c.overallScore, 0) /
              dayConversations.length
          )
        : 0;

    const totalMinutes = dayConversations.reduce(
      (sum, c) => sum + Math.round(c.duration / 60),
      0
    );

    return { day: dayName, score: avgScore, minutes: totalMinutes };
  });

  return NextResponse.json(weeklyData);
}
