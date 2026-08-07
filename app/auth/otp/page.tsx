"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("otp_email");
    if (!stored) {
      window.location.href = "/auth/register";
      return;
    }
    setEmail(stored);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      sessionStorage.removeItem("otp_email");
      toast.success("Email verified! Welcome to FluentAI.");
      // window.location.href = "/";
       window.location.href = "/auth/profile-setup";

    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to resend code");
        setResending(false);
        return;
      }

      toast.success("New verification code sent!");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="h-14 w-12 text-center text-lg font-medium"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full rounded-full h-11"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Verify"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Didn&apos;t receive a code?{" "}
        {countdown > 0 ? (
          <span className="text-muted-foreground">
            Resend in {countdown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-foreground transition-colors hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/auth/register"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to sign up
        </Link>
      </div>
    </motion.div>
  );
}
