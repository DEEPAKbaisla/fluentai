import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordSessionUsage, getPlanLimits } from "@/lib/limits";

interface MessageScores {
  grammar_score?: number;
  vocabulary_score?: number;
  pronunciation_score?: number;
  fluency_score?: number;
  confidence_score?: number;
  overall_score?: number;
}

function calculateFallbackScores(
  totalCorrections: number,
  grammarErrors: number,
  vocabErrors: number
) {
  return {
    grammar: Math.max(40, 100 - grammarErrors * 12),
    vocabulary: Math.max(40, 100 - vocabErrors * 15),
    pronunciation: Math.max(50, 95 - totalCorrections * 5),
    fluency: Math.max(50, 90 - totalCorrections * 4),
    overall: 0,
  };
}

function averageScores(messages: Array<{ scores: unknown }>) {
  const scoreArrays = { grammar: [] as number[], vocabulary: [] as number[], pronunciation: [] as number[], fluency: [] as number[] };

  for (const msg of messages) {
    const s = msg.scores as MessageScores | null;
    if (!s) continue;
    if (s.grammar_score != null) scoreArrays.grammar.push(s.grammar_score);
    if (s.vocabulary_score != null) scoreArrays.vocabulary.push(s.vocabulary_score);
    if (s.pronunciation_score != null) scoreArrays.pronunciation.push(s.pronunciation_score);
    if (s.fluency_score != null) scoreArrays.fluency.push(s.fluency_score);
  }

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 75;

  const grammar = avg(scoreArrays.grammar);
  const vocabulary = avg(scoreArrays.vocabulary);
  const pronunciation = avg(scoreArrays.pronunciation);
  const fluency = avg(scoreArrays.fluency);
  const overall = Math.round((grammar + vocabulary + pronunciation + fluency) / 4);

  return { grammar, vocabulary, pronunciation, fluency, overall };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, duration: clientDuration } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          include: { corrections: true },
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userMessages = conversation.messages.filter((m: any) => m.role === "user");
    const aiMessages = conversation.messages.filter((m: any) => m.role === "ai");
    const totalCorrections = conversation.messages.reduce(
      (acc: number, m: any) => acc + m.corrections.length,
      0
    );

    const correctionTypes = conversation.messages
      .flatMap((m: any) => m.corrections)
      .reduce(
        (acc: Record<string, number>, c: any) => {
          acc[c.type] = (acc[c.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const messageCount = userMessages.length;
    const grammarErrors = correctionTypes["grammar"] || 0;
    const vocabErrors = correctionTypes["vocabulary"] || 0;

    const hasAiScores = aiMessages.some((m: any) => m.scores != null);

    let scores;
    if (hasAiScores) {
      scores = averageScores(aiMessages);
    } else {
      scores = calculateFallbackScores(totalCorrections, grammarErrors, vocabErrors);
      scores.overall = Math.round(
        (scores.grammar + scores.vocabulary + scores.pronunciation + scores.fluency) / 4
      );
    }

    const durationSeconds = Math.round(
      (conversation.messages[conversation.messages.length - 1]?.timestamp.getTime() -
        conversation.messages[0]?.timestamp.getTime()) /
        1000
    );

    const durationMinutes = Math.round(durationSeconds / 60);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const plan = user?.plan || "free";
    const limits = getPlanLimits(plan);
    const usageMinutes = Math.round((clientDuration || durationSeconds) / 60);
    const clampedMinutes = Math.min(usageMinutes, limits.maxSessionMinutes);

    await db.conversation.update({
      where: { id: conversationId },
      data: {
        duration: durationSeconds || userMessages.length * 30,
        overallScore: scores.overall,
        grammarScore: scores.grammar,
        pronunciationScore: scores.pronunciation,
        vocabularyScore: scores.vocabulary,
        fluencyScore: scores.fluency,
      },
    });

    await recordSessionUsage(session.user.id, clampedMinutes);

    for (const correction of conversation.messages.flatMap((m: any) => m.corrections)) {
      const existing = await db.repeatedMistake.findFirst({
        where: {
          userId: session.user.id,
          mistake: correction.original,
        },
      });

      if (existing) {
        await db.repeatedMistake.update({
          where: { id: existing.id },
          data: { count: { increment: 1 } },
        });
      } else {
        await db.repeatedMistake.create({
          data: {
            userId: session.user.id,
            mistake: correction.original,
            type: correction.type,
          },
        });
      }
    }

    const vocabCorrections = conversation.messages
      .flatMap((m: any) => m.corrections)
      .filter((c: any) => c.type === "vocabulary" || c.type === "pronunciation");

    for (const correction of vocabCorrections) {
      const word = correction.original.toLowerCase().trim();
      if (!word || word.split(" ").length > 3) continue;

      const existing = await db.weakestWord.findFirst({
        where: {
          userId: session.user.id,
          word,
        },
      });

      if (existing) {
        await db.weakestWord.update({
          where: { id: existing.id },
          data: {
            attempts: { increment: 1 },
            accuracy: Math.max(0, existing.accuracy - 5),
          },
        });
      } else {
        await db.weakestWord.create({
          data: {
            userId: session.user.id,
            word,
            attempts: 1,
            accuracy: 60,
          },
        });
      }
    }

    return NextResponse.json({
      scores: {
        overall: scores.overall,
        grammar: scores.grammar,
        pronunciation: scores.pronunciation,
        vocabulary: scores.vocabulary,
        fluency: scores.fluency,
      },
      duration: durationSeconds || userMessages.length * 30,
      messageCount,
      correctionCount: totalCorrections,
    });
  } catch (error) {
    console.error("End conversation error:", error);
    return NextResponse.json(
      { error: "Failed to end conversation" },
      { status: 500 }
    );
  }
}
