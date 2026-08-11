import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const conversations = await db.conversation.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        date: true,
        id: true,
      },
    });

    const daysInMonth = endOfMonth.getDate();
    const calendarData: Array<{ date: string; sessions: number; active: boolean }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59);

      const sessionsOnDay = conversations.filter(
        (c: any) => c.date >= dayStart && c.date <= dayEnd
      ).length;

      calendarData.push({
        date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        sessions: sessionsOnDay,
        active: sessionsOnDay > 0,
      });
    }

    return NextResponse.json(calendarData);
  } catch (error) {
    console.error("Calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}
