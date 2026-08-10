import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ACCENTS = ["en-US", "en-GB", "en-AU", "en-IN"];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { accent: true },
    });

    return NextResponse.json({ accent: user?.accent || "en-US" });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accent } = await request.json();

    if (!accent || !VALID_ACCENTS.includes(accent)) {
      return NextResponse.json(
        { error: "Invalid accent. Must be one of: " + VALID_ACCENTS.join(", ") },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { accent },
    });

    return NextResponse.json({ accent });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
