"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PronunciationTip {
  word: string;
  tip: string;
}

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
  correctedSentence?: string;
  encouragement?: string;
  pronunciationTips?: PronunciationTip[];
  onReplay?: (text: string) => void;
}

export function TranscriptBubble({
  role,
  content,
  timestamp,
  corrections,
  correctedSentence,
  encouragement,
  pronunciationTips,
  onReplay,
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
            "group relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-muted rounded-tl-md"
          )}
        >
          {content}
          {!isUser && onReplay && (
            <button
              onClick={() => onReplay(content)}
              className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border opacity-0 shadow-sm transition-opacity hover:opacity-100 group-hover:opacity-100"
              title="Listen again"
            >
              <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          )}
        </div>

        {/* Corrected sentence for user messages */}
        {isUser && correctedSentence && correctedSentence !== content && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-emerald-400 font-medium">Corrected:</span>
            </div>
            <p className="mt-1 text-sm text-emerald-300">{correctedSentence}</p>
          </motion.div>
        )}

        {/* Pronunciation tips for AI messages */}
        {!isUser && pronunciationTips && pronunciationTips.length > 0 && (
          <div className="space-y-1.5">
            {pronunciationTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5"
              >
                <svg className="h-3 w-3 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="text-xs">
                  <span className="font-semibold text-amber-300">{tip.word}</span>
                  <span className="text-muted-foreground"> — {tip.tip}</span>
                </span>
                {onReplay && (
                  <button
                    onClick={() => onReplay(tip.word)}
                    className="ml-auto shrink-0 rounded-full p-1 text-amber-400 transition-colors hover:bg-amber-500/20"
                    title={`Listen to "${tip.word}"`}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Corrections for AI messages */}
        {corrections && corrections.length > 0 && (
          <div className="space-y-1.5">
            {corrections.map((correction, i) => (
              <CorrectionBadge key={i} {...correction} onReplay={onReplay} />
            ))}
          </div>
        )}

        {/* Encouragement for AI messages */}
        {!isUser && encouragement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2"
          >
            <span className="text-xs">💪</span>
            <p className="text-xs text-primary/80 italic">{encouragement}</p>
          </motion.div>
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
  onReplay,
}: {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
  onReplay?: (text: string) => void;
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

  const speakTarget = type === "pronunciation" ? original : corrected;

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
        {type !== "pronunciation" ? (
          <>
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
          </>
        ) : (
          <span className="font-medium">{original}</span>
        )}
        {onReplay && (
          <button
            onClick={() => onReplay(speakTarget)}
            className="ml-auto shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/10"
            title={`Listen to "${speakTarget}"`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1 text-muted-foreground">{explanation}</p>
    </motion.div>
  );
}
