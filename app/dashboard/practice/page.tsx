"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TranscriptBubble } from "@/components/transcript-bubble";
import { CorrectionCard } from "@/components/correction-card";
import { Waveform } from "@/components/waveform";
import { useAppStore } from "@/lib/store";
import { cn, formatDuration, getScoreColor } from "@/lib/utils";

const mockTranscript = [
  {
    id: "1",
    role: "ai" as const,
    content: "Hello! I'd love to hear about your most memorable travel experience. Where did you go?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    role: "user" as const,
    content: "Last summer I went to Japan. It was amazing! The food were delicious and the people was very friendly.",
    timestamp: "10:30 AM",
    corrections: [
      {
        type: "grammar",
        original: "The food were delicious",
        corrected: "The food was delicious",
        explanation: "'Food' is an uncountable noun and takes a singular verb.",
      },
      {
        type: "grammar",
        original: "the people was very friendly",
        corrected: "the people were very friendly",
        explanation: "'People' is a plural noun and takes a plural verb.",
      },
    ],
  },
  {
    id: "3",
    role: "ai" as const,
    content: "Japan sounds wonderful! Could you tell me more about the specific dishes you tried? Try using some descriptive vocabulary!",
    timestamp: "10:30 AM",
  },
  {
    id: "4",
    role: "user" as const,
    content: "I tried ramen, sushi, and tempura. The ramen was very testy. I also eat some wagyu beef which was absolutely delicous.",
    timestamp: "10:31 AM",
    corrections: [
      {
        type: "vocabulary",
        original: "very testy",
        corrected: "very tasty",
        explanation: "'Testy' means irritable. 'Tasty' means delicious.",
      },
      {
        type: "grammar",
        original: "I also eat",
        corrected: "I also ate",
        explanation: "Use past tense 'ate' when describing a past event.",
      },
      {
        type: "vocabulary",
        original: "delicous",
        corrected: "delicious",
        explanation: "Spelling correction: delicious.",
      },
    ],
  },
];

const speakingStatusConfig = {
  idle: { label: "Ready to speak", color: "text-muted-foreground", bg: "bg-muted/50" },
  listening: { label: "Listening...", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  thinking: { label: "Thinking...", color: "text-amber-400", bg: "bg-amber-500/10" },
  speaking: { label: "AI is speaking...", color: "text-blue-400", bg: "bg-blue-500/10" },
};

export default function PracticePage() {
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(32).fill(0));
  const [duration, setDuration] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const { speakingStatus, setSpeakingStatus } = useAppStore();
  const [transcript, setTranscript] = useState(mockTranscript.slice(0, 2));

  const simulateRecording = useCallback(() => {
    if (!isStarted) return;
    setAudioLevels((prev) => prev.map(() => Math.random() * 0.8 + 0.1));
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted) return;
    const interval = setInterval(simulateRecording, 100);
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isStarted, simulateRecording]);

  const handleStart = () => {
    setIsStarted(true);
    setSpeakingStatus("listening");
    setTimeout(() => {
      setTranscript(mockTranscript);
    }, 2000);
  };

  const handleStop = () => {
    setIsStarted(false);
    setSpeakingStatus("idle");
    setAudioLevels(new Array(32).fill(0));
  };

  const status = speakingStatusConfig[speakingStatus];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-2rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Center area */}
        <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto p-4 sm:p-6">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2",
              status.bg
            )}
          >
            <div className={cn("h-2 w-2 rounded-full", status.color, speakingStatus !== "idle" && "animate-pulse")} />
            <span className={cn("text-sm font-medium", status.color)}>
              {status.label}
            </span>
            {isStarted && (
              <span className="text-sm text-muted-foreground">
                · {formatDuration(duration)}
              </span>
            )}
          </motion.div>

          {/* AI Avatar & Waveform */}
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {/* AI Avatar */}
            <motion.div
              className="relative"
              animate={{
                scale: speakingStatus === "speaking" ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 1.5, repeat: speakingStatus === "speaking" ? Infinity : 0 }}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 sm:h-32 sm:w-32">
                <svg
                  className="h-12 w-12 text-primary sm:h-16 sm:w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 01-5.982-2.275M12 21a8.966 8.966 0 005.982-2.275M15.75 3.186a24.284 24.284 0 012.024.526m-9.5 0c.252-.032.504-.064.75-.097"
                  />
                </svg>
              </div>
              {/* Pulse rings */}
              {speakingStatus === "listening" && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/20"
                    animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}
            </motion.div>

            {/* Waveform */}
            <div className="w-full max-w-md">
              <Waveform
                levels={audioLevels}
                isActive={isStarted}
                height={48}
                barWidth={4}
                gap={3}
              />
            </div>
          </div>

          {/* Transcript */}
          <div className="w-full max-w-2xl space-y-4">
            <AnimatePresence>
              {transcript.map((msg) => (
                <TranscriptBubble key={msg.id} {...msg} />
              ))}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => {}}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </Button>

            {/* Main mic button */}
            <motion.button
              onClick={isStarted ? handleStop : handleStart}
              className={cn(
                "relative flex h-16 w-16 items-center justify-center rounded-full transition-colors sm:h-20 sm:w-20",
                isStarted
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {isStarted ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </motion.button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => {}}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Feedback Panel */}
        <div className="hidden w-80 border-l border-border/50 bg-card/50 overflow-y-auto lg:block">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Feedback</h3>

            {/* Scores */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { label: "Grammar", score: 92, color: "text-emerald-400" },
                { label: "Pronunciation", score: 85, color: "text-blue-400" },
                { label: "Vocabulary", score: 88, color: "text-purple-400" },
                { label: "Fluency", score: 83, color: "text-amber-400" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={cn("text-xl font-bold", item.color)}>{item.score}</p>
                </div>
              ))}
            </div>

            {/* Overall Score */}
            <div className="mb-6 rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-3xl font-bold text-emerald-400">87</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Corrections */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Corrections ({transcript.reduce((acc, msg) => acc + (msg.corrections?.length || 0), 0)})
              </h4>
              {transcript
                .filter((msg) => msg.corrections && msg.corrections.length > 0)
                .flatMap((msg) =>
                  (msg.corrections || []).map((correction, i) => (
                    <CorrectionCard key={`${msg.id}-${i}`} {...correction} type={correction.type as "grammar" | "vocabulary" | "pronunciation" | "fluency"} index={i} />
                  ))
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
