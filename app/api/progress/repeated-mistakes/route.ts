import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mistakes = await db.repeatedMistake.findMany({
    where: { userId: session.user.id },
    orderBy: { count: "desc" },
    take: 10,
  });

  return NextResponse.json(mistakes);
}
