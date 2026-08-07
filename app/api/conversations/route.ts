import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = {
    userId: session.user.id,
    ...(search
      ? { topic: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [conversations, total] = await Promise.all([
    db.conversation.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        topic: true,
        date: true,
        duration: true,
        overallScore: true,
        grammarScore: true,
        pronunciationScore: true,
      },
    }),
    db.conversation.count({ where }),
  ]);

  return NextResponse.json({
    conversations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
