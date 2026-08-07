"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("reset_email");
    if (!stored) {
      window.location.href = "/auth/forgot-password";
      return;
    }
    setEmail(stored);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
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

  const passwordRequirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
  ];

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const allMet = passwordRequirements.every((r) => r.met);
    if (!allMet) {
      toast.error("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Reset failed");
        setLoading(false);
        return;
      }

      sessionStorage.removeItem("reset_email");
      toast.success("Password reset successful! Please sign in.");
      window.location.href = "/auth/login";
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
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

      if (data.devOtp) {
        toast.info(`Dev OTP: ${data.devOtp}`);
      }

      toast.success("New reset code sent!");
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
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div className="space-y-2">
          <Label>Verification Code</Label>
          <div className="flex justify-center gap-3">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="h-14 w-12 text-center text-lg font-medium"
                autoFocus={i === 0}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={isPasswordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2 text-xs">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${req.met ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                  <span className={req.met ? "text-emerald-500" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={isPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            className="h-11"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-400">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full rounded-full h-11"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Didn&apos;t receive a code?{" "}
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
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
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}
