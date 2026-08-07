import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyStoredOtp, deleteOtp } from "@/lib/otp";
import { signIn } from "@/lib/auth";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must be numbers only"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;

    const result = await verifyStoredOtp(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const otpRecord = await db.emailOtp.findUnique({ where: { email } });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification data not found. Please sign up again." },
        { status: 400 }
      );
    }

    const user = await db.user.create({
      data: {
        name: otpRecord.name,
        email: otpRecord.email,
        password: otpRecord.passwordHash,
        emailVerified: new Date(),
      },
    });

    await deleteOtp(email);

    return NextResponse.json(
      {
        message: "Email verified successfully",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
