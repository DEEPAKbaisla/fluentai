import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const RESET_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export async function createPasswordReset(
  email: string
): Promise<{ sent: boolean; devOtp?: string }> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return { sent: true };
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

  await db.passwordReset.upsert({
    where: { email },
    update: { otp, expiresAt, attempts: 0, createdAt: new Date() },
    create: { email, otp, expiresAt },
  });

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT || "465";
  const user_ = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user_ || !pass) {
    console.log(`[DEV RESET] Email: ${email}, OTP: ${otp}`);
    return { sent: true, devOtp: otp };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user: user_, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_USER || "FluentAI <noreply@fluentai.com>",
      to: email,
      subject: "Reset your password - FluentAI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Reset your password</h1>
          <p style="color: #666; margin-bottom: 24px;">Hi ${user.name || "there"},</p>
          <p style="color: #666; margin-bottom: 24px;">Use the following code to reset your password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px;">This code expires in ${RESET_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #999; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    console.error("Failed to send reset email:", error);
    console.log(`[DEV RESET] Email: ${email}, OTP: ${otp}`);
    return { sent: true, devOtp: otp };
  }
}

export async function verifyPasswordReset(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const record = await db.passwordReset.findUnique({ where: { email } });

  if (!record) {
    return { success: false, error: "No reset code found. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: "Too many failed attempts. Please request a new code." };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  if (record.otp !== otp) {
    await db.passwordReset.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, error: "Invalid verification code. Please try again." };
  }

  return { success: true };
}

export async function deletePasswordReset(email: string): Promise<void> {
  await db.passwordReset.deleteMany({ where: { email } });
}
