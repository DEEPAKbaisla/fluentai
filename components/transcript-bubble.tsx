"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TranscriptBubbleProps {
  role: "user" | "ai";
  content: string;
  timestamp?: string;
  corrections?: Array<{
    type: string;
    original: string;
    corrected: string;
    explanation: string;
  }>;
}

export function TranscriptBubble({
  role,
  content,
  timestamp,
  corrections,
}: TranscriptBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 01-5.982-2.275M12 21a8.966 8.966 0 005.982-2.275M15.75 3.186a24.284 24.284 0 012.024.526m-9.5 0c.252-.032.504-.064.75-.097"
            />
          </svg>
        </div>
      )}
      <div className={cn("max-w-[80%] space-y-2")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-muted rounded-tl-md"
          )}
        >
          {content}
        </div>
        {corrections && corrections.length > 0 && (
          <div className="space-y-1.5">
            {corrections.map((correction, i) => (
              <CorrectionBadge key={i} {...correction} />
            ))}
          </div>
        )}
        {timestamp && (
          <p className="px-1 text-xs text-muted-foreground">{timestamp}</p>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <span className="text-xs font-medium text-primary-foreground">You</span>
        </div>
      )}
    </motion.div>
  );
}

function CorrectionBadge({
  type,
  original,
  corrected,
  explanation,
}: {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
}) {
  const typeColors: Record<string, string> = {
    grammar: "border-red-500/30 bg-red-500/5 text-red-400",
    vocabulary: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    pronunciation: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    fluency: "border-purple-500/30 bg-purple-500/5 text-purple-400",
  };

  const typeLabels: Record<string, string> = {
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    pronunciation: "Pronunciation",
    fluency: "Fluency",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-lg border px-3 py-2 text-xs",
        typeColors[type] || typeColors.grammar
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{typeLabels[type] || type}</span>
        <span className="text-muted-foreground line-through">{original}</span>
        <svg
          className="h-3 w-3 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        <span className="font-medium">{corrected}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{explanation}</p>
    </motion.div>
  );
}
