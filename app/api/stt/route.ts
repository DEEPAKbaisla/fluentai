import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { groq, STT_MODEL } from "@/lib/ai";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!audio || !(audio instanceof File) || audio.size === 0) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    if (
      audio.type &&
      !audio.type.startsWith("audio/") &&
      !audio.type.startsWith("video/webm")
    ) {
      return NextResponse.json(
        { error: "Unsupported audio format" },
        { status: 415 }
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Audio file is too large" },
        { status: 413 }
      );
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: STT_MODEL,
      language: "en",
      temperature: 0,
    });

    return NextResponse.json({
      text: (transcription.text || "").trim(),
    });
  } catch (error) {
    console.error("STT API error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
