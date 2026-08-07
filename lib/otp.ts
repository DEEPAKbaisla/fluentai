import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;
const MAX_RESEND_ATTEMPTS = 3;

export function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export async function storeOtp(
  email: string,
  name: string,
  passwordHash: string,
  otp: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.emailOtp.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    },
    create: {
      email,
      name,
      passwordHash,
      otp,
      expiresAt,
    },
  });
}

export async function verifyStoredOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const record = await db.emailOtp.findUnique({ where: { email } });

  if (!record) {
    return { success: false, error: "No verification code found. Please sign up again." };
  }

  if (record.attempts >= MAX_RESEND_ATTEMPTS + 3) {
    return { success: false, error: "Too many failed attempts. Please sign up again." };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  if (record.otp !== otp) {
    await db.emailOtp.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, error: "Invalid verification code. Please try again." };
  }

  return { success: true };
}

export async function deleteOtp(email: string): Promise<void> {
  await db.emailOtp.deleteMany({ where: { email } });
}

export async function canResendOtp(email: string): Promise<boolean> {
  const record = await db.emailOtp.findUnique({ where: { email } });
  if (!record) return true;
  return record.attempts < MAX_RESEND_ATTEMPTS;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT || "465";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: { user, pass },
  });
}

export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
): Promise<{ sent: boolean; devOtp?: string }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[DEV OTP] Email: ${email}, OTP: ${otp}`);
    return { sent: true, devOtp: otp };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_USER || "FluentAI <noreply@fluentai.com>",
      to: email,
      subject: "Verify your email - FluentAI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Verify your email</h1>
          <p style="color: #666; margin-bottom: 24px;">Hi ${name},</p>
          <p style="color: #666; margin-bottom: 24px;">Use the following code to verify your email address:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #999; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    console.log(`[DEV OTP] Email: ${email}, OTP: ${otp}`);
    return { sent: true, devOtp: otp };
  }
}
