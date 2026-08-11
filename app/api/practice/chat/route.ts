import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatWithGemini } from "@/lib/ai";
import { getPlanLimits } from "@/lib/limits";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, userMessage } = await request.json();

    if (!conversationId || !userMessage) {
      return NextResponse.json(
        { error: "conversationId and userMessage are required" },
        { status: 400 }
      );
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const plan = user?.plan || "free";
    const limits = getPlanLimits(plan);

    const firstMessage = conversation.messages[0];
    if (firstMessage) {
      const elapsedSeconds = (Date.now() - firstMessage.timestamp.getTime()) / 1000;
      const elapsedMinutes = elapsedSeconds / 60;

      if (elapsedMinutes >= limits.maxSessionMinutes) {
        return NextResponse.json({
          aiMessage: "Great practice session! Your time limit for this session has been reached. Let's save your progress.",
          corrections: [],
          correctedSentence: null,
          encouragement: "You did amazing today! Come back tomorrow for more practice.",
          pronunciationTips: [],
          scores: null,
          limitReached: true,
        });
      }
    }

    await db.message.create({
      data: {
        conversationId,
        role: "user",
        content: userMessage,
      },
    });

    const history = conversation.messages.map((m: any) => ({
      role: m.role as "user" | "model",
      text: m.content,
    }));

    const { response, corrections, coachResponse } = await chatWithGemini(
      conversation.topic,
      history,
      userMessage
    );

    const aiMessage = await db.message.create({
      data: {
        conversationId,
        role: "ai",
        content: response,
        correctedSentence: coachResponse.corrected_sentence || undefined,
        encouragement: coachResponse.encouragement || undefined,
        pronunciationTips: coachResponse.pronunciation?.length
          ? (coachResponse.pronunciation as unknown as any)
          : undefined,
        scores: {
          grammar_score: coachResponse.grammar_score,
          vocabulary_score: coachResponse.vocabulary_score,
          pronunciation_score: coachResponse.pronunciation_score,
          fluency_score: coachResponse.fluency_score,
          confidence_score: coachResponse.confidence_score,
          overall_score: coachResponse.overall_score,
        } as unknown as any,
      },
    });

    if (corrections.length > 0) {
      const lastUserMessage = await db.message.findFirst({
        where: { conversationId, role: "user" },
        orderBy: { timestamp: "desc" },
      });

      if (lastUserMessage) {
        await db.correction.createMany({
          data: corrections.map((c) => ({
            messageId: lastUserMessage.id,
            type: c.type,
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
          })),
        });
      }
    }

    return NextResponse.json({
      aiMessage: response,
      corrections,
      correctedSentence: coachResponse.corrected_sentence,
      encouragement: coachResponse.encouragement,
      pronunciationTips: coachResponse.pronunciation,
      scores: {
        grammar: coachResponse.grammar_score,
        vocabulary: coachResponse.vocabulary_score,
        pronunciation: coachResponse.pronunciation_score,
        fluency: coachResponse.fluency_score,
        confidence: coachResponse.confidence_score,
        overall: coachResponse.overall_score,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
