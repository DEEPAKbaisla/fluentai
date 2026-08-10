import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateGreeting } from "@/lib/ai";
import { canStartSession } from "@/lib/limits";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    const plan = user?.plan || "free";
    const check = await canStartSession(session.user.id, plan);

    if (!check.allowed) {
      const message =
        check.reason === "daily"
          ? "You've reached your daily practice limit. Upgrade your plan or try again tomorrow."
          : "You've reached your monthly practice limit. Please upgrade your plan.";

      return NextResponse.json(
        {
          error: message,
          limitType: check.reason,
          usage: {
            dailyUsed: check.dailyUsed,
            dailyLimit: check.dailyRemaining + check.dailyUsed,
            monthlyUsed: check.monthlyUsed,
          },
        },
        { status: 403 }
      );
    }

    const greeting = await generateGreeting(topic);

    const conversation = await db.conversation.create({
      data: {
        userId: session.user.id,
        topic,
      },
    });

    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: "ai",
        content: greeting,
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      greeting,
      usage: {
        dailyRemaining: check.dailyRemaining,
        monthlyRemaining: check.monthlyRemaining,
        maxSessionMinutes: check.sessionMax,
      },
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    return NextResponse.json(
      { error: "Failed to start conversation" },
      { status: 500 }
    );
  }
}
