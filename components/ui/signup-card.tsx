"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mic, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DotMap } from "./dot-map";
import { loginWithGoogle } from "@/lib/actions/auth";
import { toast } from "sonner";

export function SignUpCard() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const allMet = passwordRequirements.every((r) => r.met);
    if (!allMet) {
      toast.error("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("otp_email", email);
      toast.success("Verification code sent! Check your email.");
      window.location.href = "/auth/otp";
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-card shadow-2xl border border-border/50"
      >
        {/* Left side - Animated Visual */}
        <div className="hidden md:block w-1/2 h-[680px] relative overflow-hidden border-r border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-indigo-500/10">
            <DotMap
              dotColor="rgba(139, 92, 246, 0.3)"
              routeColor="#8b5cf6"
              routeGlow="rgba(139, 92, 246, 0.35)"
              routeCount={8}
            />

            {/* Logo and text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-6"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Mic className="text-white h-7 w-7" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-3xl font-bold mb-3 text-center gradient-text"
              >
                FluentAI
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-sm text-center text-muted-foreground max-w-xs leading-relaxed"
              >
                Join thousands of learners improving their English every day
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-8 space-y-3 w-full max-w-xs"
              >
                {[
                  "Real-time pronunciation feedback",
                  "Grammar & vocabulary corrections",
                  "Personalized learning paths",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <div className="h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-indigo-500" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-card">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
              Create an account
            </h1>
            <p className="text-muted-foreground mb-8">
              Start your journey to English fluency
            </p>

            {/* Google Sign Up */}
            <div className="mb-6">
              <Button
                variant="outline"
                className="w-full rounded-full h-11 font-medium"
                onClick={() => loginWithGoogle()}
                type="button"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fillOpacity=".54"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#34A853"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
                </svg>
                <span>Sign up with Google</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Full Name <span className="text-purple-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-1.5 h-11"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email <span className="text-purple-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1.5 h-11"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">
                  Password <span className="text-purple-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {/* Password requirements */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 space-y-1"
                  >
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full transition-colors ${
                            req.met ? "bg-emerald-500" : "bg-muted-foreground/30"
                          }`}
                        />
                        <span
                          className={
                            req.met ? "text-emerald-500" : "text-muted-foreground"
                          }
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white transition-all duration-300 ${
                    isHovered ? "shadow-lg shadow-purple-500/25" : ""
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center">
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-purple-500 hover:text-purple-600 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
