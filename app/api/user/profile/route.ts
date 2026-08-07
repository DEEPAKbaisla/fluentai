import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      streak: true,
      joinedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, image } = body;

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(image !== undefined && { image }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      streak: true,
    },
  });

  return NextResponse.json(user);
}
