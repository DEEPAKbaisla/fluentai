import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordReset } from "@/lib/password-reset";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const { devOtp } = await createPasswordReset(email);

    return NextResponse.json(
      {
        message: "If an account with that email exists, we've sent a reset code.",
        ...(devOtp ? { devOtp } : {}),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
