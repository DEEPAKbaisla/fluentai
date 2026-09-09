import { NextResponse } from "next/server";
import { groq, CHAT_MODEL } from "@/lib/ai";


async function callGroq(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0].message.content || "";
}

function parseJson(text: string) {
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // fall through
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*"word"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // fall through
    }
  }

  const fallbackMatch = text.match(/\{[\s\S]*\}/);
  if (fallbackMatch) {
    try {
      return JSON.parse(fallbackMatch[0]);
    } catch {
      // fall through
    }
  }

  throw new Error("No JSON found");
}

export async function POST(request: Request) {
  try {
    const { word } = await request.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    const cleanWord = word.trim().toLowerCase();
    if (cleanWord.split(" ").length > 1) {
      return NextResponse.json(
        { error: "Please enter a single word only" },
        { status: 400 }
      );
    }

    const prompt = `Analyze the English pronunciation of "${cleanWord}". Return ONLY a JSON object with this exact structure and no other text:

{"word":"${cleanWord}","phonetic":"human-readable spelling","syllables":"hyphen-separated syllables","stressPattern":"stressed syllable in CAPS","ipa":"IPA notation","definition":"brief definition","tips":["2-3 pronunciation tips"],"commonMistakes":["1-2 common mistakes"],"similarWords":["2-3 similar words"]}`;

    const text = await callGroq(prompt);
    const parsed = parseJson(text);

    return NextResponse.json({
      word: parsed.word || cleanWord,
      phonetic: parsed.phonetic || "",
      syllables: parsed.syllables || "",
      stressPattern: parsed.stressPattern || "",
      ipa: parsed.ipa || "",
      definition: parsed.definition || "",
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      commonMistakes: Array.isArray(parsed.commonMistakes)
        ? parsed.commonMistakes
        : [],
      similarWords: Array.isArray(parsed.similarWords) ? parsed.similarWords : [],
    });
  } catch (error) {
    console.error("Pronunciation API error:", error);
    return NextResponse.json(
      { error: "Failed to get pronunciation data" },
      { status: 500 }
    );
  }
}
