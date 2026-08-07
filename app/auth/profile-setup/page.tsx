"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";

const languages = [
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Portuguese",
  "Italian",
  "Russian",
  "Hindi",
  "Other",
];

const levels = [
  { id: "beginner", label: "Beginner", description: "Just starting out" },
  { id: "intermediate", label: "Intermediate", description: "Can hold basic conversations" },
  { id: "advanced", label: "Advanced", description: "Fluent but want to polish" },
];

export default function ProfileSetupPage() {
  const [name, setName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [level, setLevel] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Help us personalize your learning experience
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = "/dashboard";
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">What should we call you?</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>What&apos;s your native language?</Label>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setNativeLanguage(lang)}
                className={cn(
                  "rounded-lg border p-2 text-sm transition-all",
                  nativeLanguage === lang
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>What&apos;s your English level?</Label>
          <div className="grid grid-cols-3 gap-3">
            {levels.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  level === l.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-muted/30 hover:border-border"
                )}
              >
                <p className="font-medium">{l.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {l.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full rounded-full">
          Get Started
        </Button>
      </form>
    </motion.div>
  );
}
