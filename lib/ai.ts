import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export interface GrammarCorrection {
  original: string;
  corrected: string;
  reason: string;
}

export interface VocabularySuggestion {
  original: string;
  better: string;
  reason: string;
}

export interface PronunciationTip {
  word: string;
  tip: string;
}

export interface CoachResponse {
  ai_response: string;
  corrected_sentence: string;
  grammar: GrammarCorrection[];
  vocabulary: VocabularySuggestion[];
  pronunciation: PronunciationTip[];
  fluency_score: number;
  grammar_score: number;
  pronunciation_score: number;
  vocabulary_score: number;
  confidence_score: number;
  overall_score: number;
  encouragement: string;
}

export interface Correction {
  type: "grammar" | "vocabulary" | "pronunciation" | "fluency";
  original: string;
  corrected: string;
  explanation: string;
}

export interface ChatResult {
  response: string;
  corrections: Correction[];
  coachResponse: CoachResponse;
}

const SYSTEM_PROMPT = `You are FluentAI, the world's best English-speaking coach.

Your role is to help users become fluent English speakers through natural conversation.

RULES:
1. Talk naturally like a real person.
2. Never interrupt while the user is speaking.
3. Wait until the user finishes a complete sentence.
4. Understand the intended meaning even if grammar is incorrect.
5. First, reply naturally to keep the conversation flowing.
6. Then provide feedback in a friendly, encouraging tone.

For every user message, return JSON in the following format:

{
  "ai_response": "...",
  "corrected_sentence": "...",
  "grammar": [
    {
      "original": "...",
      "corrected": "...",
      "reason": "..."
    }
  ],
  "vocabulary": [
    {
      "original": "...",
      "better": "...",
      "reason": "..."
    }
  ],
  "pronunciation": [
    {
      "word": "...",
      "tip": "..."
    }
  ],
  "fluency_score": 0,
  "grammar_score": 0,
  "pronunciation_score": 0,
  "vocabulary_score": 0,
  "confidence_score": 0,
  "overall_score": 0,
  "encouragement": "..."
}

IMPORTANT INSTRUCTIONS:
- Your conversational response goes in "ai_response". Keep it 2-4 sentences, warm and engaging.
- "corrected_sentence" should be the user's sentence with all corrections applied. If no corrections needed, repeat their sentence as-is.
- Scores should be 0-100. Be generous but honest. Base them on the user's actual message quality.
- "encouragement" should be a brief motivational note (1 sentence).
- Put pronunciation tips for words that might be tricky for non-native speakers.
- Always end your response with the JSON block wrapped in triple backticks like this:
\`\`\`json
{ ... }
\`\`\`
- Do NOT put corrections inline in your response text. Only in the JSON.
- Be supportive and motivating. Never shame the user for mistakes. Keep the conversation engaging and ask follow-up questions when appropriate.`;

const MODEL = "llama-3.3-70b-versatile";

const FALLBACK_COACH: CoachResponse = {
  ai_response: "",
  corrected_sentence: "",
  grammar: [],
  vocabulary: [],
  pronunciation: [],
  fluency_score: 75,
  grammar_score: 75,
  pronunciation_score: 75,
  vocabulary_score: 75,
  confidence_score: 75,
  overall_score: 75,
  encouragement: "Keep going! Every conversation makes you stronger.",
};

async function callGroq(messages: OpenAI.ChatCompletionMessageParam[]) {
  let lastError: any;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      });
      return response.choices[0].message.content || "";
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || "";
      const isRateLimit = err?.status === 429 || msg.includes("429") || msg.includes("rate_limit");
      if (isRateLimit && attempt < 1) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function extractJsonFromResponse(text: string): CoachResponse | null {
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // fall through
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*"ai_response"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // fall through
    }
  }

  return null;
}

function coachToCorrections(coach: CoachResponse): Correction[] {
  const corrections: Correction[] = [];

  for (const g of coach.grammar) {
    corrections.push({
      type: "grammar",
      original: g.original,
      corrected: g.corrected,
      explanation: g.reason,
    });
  }

  for (const v of coach.vocabulary) {
    corrections.push({
      type: "vocabulary",
      original: v.original,
      corrected: v.better,
      explanation: v.reason,
    });
  }

  for (const p of coach.pronunciation) {
    corrections.push({
      type: "pronunciation",
      original: p.word,
      corrected: p.word,
      explanation: p.tip,
    });
  }

  return corrections;
}

function generateLocalResponse(userMessage: string, topic: string): CoachResponse {
  const wordCount = userMessage.split(" ").length;
  const isShort = wordCount < 5;
  const isQuestion = userMessage.includes("?");

  let ai_response: string;
  if (isQuestion) {
    ai_response = `That's a great question about ${topic}! I'd love to explore that more. Can you tell me more about what made you think of that?`;
  } else if (isShort) {
    ai_response = `Good start! Try telling me more — what do you think about ${topic}? Give me a full sentence and I'll help you polish it.`;
  } else {
    ai_response = `That's interesting! I can see you're thinking about ${topic}. Could you expand on that a bit more? Try using some descriptive words.`;
  }

  return {
    ai_response,
    corrected_sentence: userMessage,
    grammar: [],
    vocabulary: [],
    pronunciation: [],
    fluency_score: isShort ? 60 : 75,
    grammar_score: 70,
    pronunciation_score: 70,
    vocabulary_score: isShort ? 55 : 70,
    confidence_score: isShort ? 50 : 65,
    overall_score: isShort ? 55 : 70,
    encouragement: isShort
      ? "You're doing great! Try adding more detail to your sentences."
      : "Nice! Keep expressing your thoughts — fluency comes with practice!",
  };
}

export async function chatWithGemini(
  topic: string,
  history: Array<{ role: "user" | "model" | "ai"; text: string }>,
  userMessage: string
): Promise<ChatResult> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT + `\n\nCurrent conversation topic: ${topic}` },
    ...history.map((h) => ({
      role: (h.role === "model" || h.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: h.text,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const rawText = await callGroq(messages);

    const coach = extractJsonFromResponse(rawText);

    if (coach) {
      return {
        response: coach.ai_response,
        corrections: coachToCorrections(coach),
        coachResponse: coach,
      };
    }

    return {
      response: rawText,
      corrections: [],
      coachResponse: { ...FALLBACK_COACH, ai_response: rawText },
    };
  } catch (err) {
    console.warn("Groq API unavailable, using fallback response:", err);
    const fallback = generateLocalResponse(userMessage, topic);
    return {
      response: fallback.ai_response,
      corrections: [],
      coachResponse: fallback,
    };
  }
}

export async function generateGreeting(topic: string): Promise<string> {
  const greetings: Record<string, string> = {
    "Daily Conversations": `Hii there! I'm FluentAI, your personal English coach. I'd love to chat about Daily Conversations with you. What's something interesting that happened to you today?`,
    "Travel & Adventure": `Hey! I'm FluentAI, your personal English coach. Let's talk about Travel & Adventure! What's the most exciting place you've ever visited?`,
    "Technology": `Hello! I'm FluentAI, your personal English coach. Technology is a fascinating topic! What's the latest gadget or app you've been excited about?`,
    "Food & Cooking": `Hii! I'm FluentAI, your personal English coach. Let's talk about Food & Cooking! What's your favorite dish to make or eat?`,
    "Movies & Entertainment": `Hey there! I'm FluentAI, your personal English coach. Let's discuss Movies & Entertainment! What's the last great movie or show you watched?`,
    "Health & Fitness": `Hello! I'm FluentAI, your personal English coach. Health & Fitness is a great topic! What's your favorite way to stay active?`,
    "Business & Career": `Hi! I'm FluentAI, your personal English coach. Let's talk about Business & Career! What are you currently working on or aspiring to do?`,
    "Education & Learning": `Hey! I'm FluentAI, your personal English coach. Education & Learning — wonderful topic! What's something new you've learned recently?`,
  };

  const fallback = `Hii! I'm FluentAI, your personal English coach. Let's talk about ${topic}. What's on your mind?`;

  return greetings[topic] || fallback;
}
