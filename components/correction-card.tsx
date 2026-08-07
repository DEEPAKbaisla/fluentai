"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CorrectionCardProps {
  type: "grammar" | "vocabulary" | "pronunciation" | "fluency";
  original: string;
  corrected: string;
  explanation: string;
  index?: number;
}

export function CorrectionCard({
  type,
  original,
  corrected,
  explanation,
  index = 0,
}: CorrectionCardProps) {
  const typeConfig = {
    grammar: {
      label: "Grammar",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    vocabulary: {
      label: "Vocabulary",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    pronunciation: {
      label: "Pronunciation",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ),
    },
    fluency: {
      label: "Fluency",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn("rounded-xl border p-4", config.border, config.bg)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 rounded-lg p-1.5", config.bg, config.color)}>
          {config.icon}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground line-through">{original}</span>
            <svg className="h-3 w-3 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="font-medium text-foreground">{corrected}</span>
          </div>
          <p className="text-xs text-muted-foreground">{explanation}</p>
        </div>
      </div>
    </motion.div>
  );
}
