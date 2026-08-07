import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateOtp, storeOtp, sendOtpEmail } from "@/lib/otp";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = generateOtp();
    await storeOtp(email, name, hashedPassword, otp);
    await sendOtpEmail(email, name, otp);

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
