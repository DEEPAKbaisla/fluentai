import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const achievements = await db.achievement.findMany({
    include: {
      userAchievements: {
        where: { userId: session.user.id },
      },
    },
  });

  const result = achievements.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    target: a.target,
    progress: a.userAchievements[0]?.progress ?? 0,
    unlockedAt: a.userAchievements[0]?.unlockedAt ?? null,
  }));

  return NextResponse.json(result);
}
