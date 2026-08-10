import { NextResponse } from "next/server";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function callGroq(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });
  return response.choices[0].message.content || "";
}

async function callAI(prompt: string): Promise<string> {
  try {
    const text = await callGroq(prompt);
    if (text) return text;
  } catch (err) {
    console.warn("Groq unavailable, falling back to Gemini:", (err as Error).message);
  }
  return callGroq(prompt);
}

function parseJson(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  throw new Error("No JSON found");
}

export async function POST(request: Request) {
  try {
    const { targetWord, spokenText } = await request.json();

    if (!targetWord || !spokenText) {
      return NextResponse.json(
        { error: "targetWord and spokenText are required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert English pronunciation evaluator. A user is practicing the pronunciation of the word "${targetWord}".

They spoke and the speech recognition captured: "${spokenText}"

Your task:
1. Compare the spoken text to the target word
2. Account for common speech-to-text transcription differences (e.g., "pro-nun-see-AY-shun" for "pronunciation" is correct)
3. Score the pronunciation accuracy from 0-100
4. Provide constructive feedback

Return ONLY a JSON object (no markdown, no explanation) with this exact structure:

{
  "accuracy": 85,
  "feedback": "Brief positive/constructive feedback about the pronunciation",
  "whatWentWrong": "What sounds were off (empty string if accuracy >= 90)",
  "suggestion": "One specific tip to improve"
}

SCORING GUIDE:
- 90-100: Excellent, sounds native-like
- 75-89: Good, minor issues with stress or specific sounds
- 60-74: Fair, noticeable accent but understandable
- 40-59: Needs work, several sounds are off
- 0-39: Significant mispronunciation

IMPORTANT: Return ONLY valid JSON. No markdown fences. No extra text.`;

    const text = await callAI(prompt);
    const parsed = parseJson(text);

    return NextResponse.json({
      accuracy: Math.min(100, Math.max(0, Number(parsed.accuracy) || 0)),
      feedback: parsed.feedback || "",
      whatWentWrong: parsed.whatWentWrong || "",
      suggestion: parsed.suggestion || "",
    });
  } catch (error) {
    console.error("Pronunciation analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze pronunciation" },
      { status: 500 }
    );
  }
}
