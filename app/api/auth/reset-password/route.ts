import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyPasswordReset, deletePasswordReset } from "@/lib/password-reset";

const resetSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must be numbers only"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = parsed.data;

    const result = await verifyPasswordReset(email, otp);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await deletePasswordReset(email);

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
