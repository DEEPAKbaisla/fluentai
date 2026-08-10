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

    const prompt = `You are an expert English pronunciation coach. Analyze the word "${cleanWord}" and return ONLY a JSON object (no markdown, no explanation) with this exact structure:

{
  "word": "${cleanWord}",
  "phonetic": "human-readable phonetic spelling (e.g. pruh-nuhn-see-AY-shuhn)",
  "syllables": "syllable breakdown with hyphens (e.g. pro-nun-ci-a-tion)",
  "stressPattern": "show stress with caps (e.g. pro-NUN-ci-a-tion)",
  "ipa": "IPA notation (e.g. /prəˌnʌnsiˈeɪʃən/)",
  "definition": "brief one-line definition",
  "tips": ["array of 2-3 practical pronunciation tips for non-native speakers"],
  "commonMistakes": ["array of 1-2 common pronunciation mistakes"],
  "similarWords": ["array of 2-3 similar-sounding words for practice"]
}

IMPORTANT: Return ONLY valid JSON. No markdown fences. No extra text.`;

    const text = await callAI(prompt);
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
