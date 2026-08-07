import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const words = await db.weakestWord.findMany({
    where: { userId: session.user.id },
    orderBy: { accuracy: "asc" },
    take: 10,
  });

  return NextResponse.json(words);
}
