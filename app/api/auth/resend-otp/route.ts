import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateOtp, storeOtp, sendOtpEmail, canResendOtp } from "@/lib/otp";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const allowed = await canResendOtp(email);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many resend attempts. Please sign up again." },
        { status: 429 }
      );
    }

    const existingRecord = await db.emailOtp.findUnique({ where: { email } });
    if (!existingRecord) {
      return NextResponse.json(
        { error: "No pending verification found. Please sign up again." },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    await storeOtp(
      email,
      existingRecord.name,
      existingRecord.passwordHash,
      otp
    );
    const { devOtp } = await sendOtpEmail(email, existingRecord.name, otp);

    return NextResponse.json(
      {
        message: "New verification code sent",
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
