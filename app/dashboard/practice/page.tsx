"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TranscriptBubble } from "@/components/transcript-bubble";
import { CorrectionCard } from "@/components/correction-card";
import { Waveform } from "@/components/waveform";
import { usePractice, type PracticeScores } from "@/hooks/use-practice";
import { PracticeTopicsSkeleton } from "@/components/dashboard-skeletons";
import { cn, formatDuration, getScoreColor } from "@/lib/utils";
import { Plane, Briefcase, Users, MessageCircle, GraduationCap, Cpu, Heart, Film, Clock, AlertTriangle } from "lucide-react";

const topicIcons: Record<string, React.ReactNode> = {
  plane: <Plane className="h-6 w-6" />,
  briefcase: <Briefcase className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  "message-circle": <MessageCircle className="h-6 w-6" />,
  "graduation-cap": <GraduationCap className="h-6 w-6" />,
  cpu: <Cpu className="h-6 w-6" />,
  heart: <Heart className="h-6 w-6" />,
  film: <Film className="h-6 w-6" />,
};

const statusConfig = {
  idle: { label: "Choose a topic to begin", color: "text-muted-foreground", bg: "bg-muted/50" },
  "topic-select": { label: "Select a topic", color: "text-muted-foreground", bg: "bg-muted/50" },
  starting: { label: "Starting conversation...", color: "text-amber-400", bg: "bg-amber-500/10" },
  active: { label: "Conversation active", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ending: { label: "Saving results...", color: "text-amber-400", bg: "bg-amber-500/10" },
  completed: { label: "Session complete", color: "text-blue-400", bg: "bg-blue-500/10" },
};

export default function PracticePage() {
  const practice = usePractice();
  const [topics, setTopics] = useState<Array<{ id: string; title: string; icon: string; level: string }>>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(32).fill(0));
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/practice-topics")
      .then((r) => r.json())
      .then((data) => setTopics(data.topics || data))
      .catch(() => {})
      .finally(() => setTopicsLoading(false));
  }, []);

  useEffect(() => {
    if (practice.isListening) {
      const interval = setInterval(() => {
        setAudioLevels((prev) => prev.map(() => Math.random() * 0.8 + 0.1));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevels(new Array(32).fill(0));
    }
  }, [practice.isListening]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [practice.transcript]);

  const status = statusConfig[practice.status];
  const totalCorrections = practice.transcript.reduce(
    (acc, msg) => acc + (msg.corrections?.length || 0),
    0
  );

  const latestEncouragement = [...practice.transcript]
    .reverse()
    .find((msg) => msg.role === "ai" && msg.encouragement)?.encouragement;

  const latestCorrectedSentence = [...practice.transcript]
    .reverse()
    .find((msg) => msg.role === "user" && msg.correctedSentence && msg.correctedSentence !== msg.content)?.correctedSentence;

  const allPronunciationTips = practice.transcript
    .filter((msg) => msg.role === "ai" && msg.pronunciationTips?.length)
    .flatMap((msg) => msg.pronunciationTips || []);

  if (practice.status === "idle" || practice.status === "topic-select") {
    const usage = practice.usage;
    const canStart = usage?.canStartSession !== false;

    if (topicsLoading) {
      return <PracticeTopicsSkeleton />;
    }

    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 lg:h-[calc(100vh-2rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Start a Practice Session</h1>
            <p className="mt-2 text-muted-foreground">
              Choose a topic and have a conversation with your AI tutor
            </p>
          </div>

          {/* Usage Bar */}
          {usage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-6 rounded-2xl border p-4",
                canStart
                  ? "border-border/50 bg-card"
                  : "border-red-500/30 bg-red-500/5"
              )}
            >
              {!canStart ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Daily limit reached</p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;ve used {usage.daily.used} of {usage.daily.limit} minutes today.
                      Upgrade your plan for more practice time.
                    </p>
                  </div>
                  <a href="/dashboard/subscription">
                    <Button size="sm" className="rounded-full">Upgrade</Button>
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Daily Practice</p>
                      <p className="text-xs text-muted-foreground">
                        {usage.daily.remaining} min remaining
                      </p>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          usage.daily.percentage >= 90
                            ? "bg-red-500"
                            : usage.daily.percentage >= 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${usage.daily.percentage}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topics.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: canStart ? 1.03 : 1 }}
                whileTap={{ scale: canStart ? 0.97 : 1 }}
                onClick={() => canStart && practice.selectTopic(t.title)}
                disabled={!canStart}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center transition-all",
                  canStart
                    ? "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5"
                    : "border-border/30 bg-card/50 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="text-primary">{topicIcons[t.icon] || topicIcons["message-circle"]}</div>
                <p className="h-10 text-sm font-semibold text-foreground line-clamp-2 flex items-center justify-center">{t.title}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {t.level}
                </span>
              </motion.button>
            ))}
          </div>

          {practice.error && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
              {practice.error}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (practice.status === "starting") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 lg:h-[calc(100vh-2rem)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <svg className="h-8 w-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-lg font-medium">Starting conversation about</p>
          <p className="text-primary font-semibold">{practice.topic}</p>
          <Button variant="outline" className="mt-4" onClick={practice.reset}>
            Cancel
          </Button>
        </motion.div>
      </div>
    );
  }

  if (practice.status === "completed") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 lg:h-[calc(100vh-2rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mx-auto">
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Session Complete!</h1>
          <p className="mt-2 text-muted-foreground">Topic: {practice.topic}</p>
          <p className="text-sm text-muted-foreground">
            {formatDuration(practice.duration)} · {practice.transcript.filter((m) => m.role === "user").length} messages · {totalCorrections} corrections
          </p>

          {practice.scores && (
            <SessionScores scores={practice.scores} />
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={practice.reset}>
              New Session
            </Button>
            <Button className="flex-1" onClick={() => window.location.href = "/dashboard"}>
              Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-2rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Center area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Sticky Header: Status + Avatar + Waveform */}
          <div className="sticky top-0 z-10 flex shrink-0 flex-col items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-md p-4 sm:p-5">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex items-center gap-2 rounded-full px-4 py-2", practice.isPaused ? "bg-amber-500/10" : status.bg)}
            >
              <div className={cn("h-2 w-2 rounded-full", practice.isPaused ? "text-amber-400" : status.color, practice.status === "active" && !practice.isPaused && "animate-pulse")} />
              <span className={cn("text-sm font-medium", practice.isPaused ? "text-amber-400" : status.color)}>
                {practice.isPaused ? "Paused" : status.label}
              </span>
              {practice.status === "active" && !practice.isPaused && (
                <span className="text-sm text-muted-foreground">· {formatDuration(practice.duration)}</span>
              )}
              {practice.sessionTimeRemaining !== null && practice.status === "active" && (
                <span className={cn(
                  "text-xs font-medium ml-1",
                  practice.sessionTimeRemaining <= 2 ? "text-red-400" : "text-muted-foreground"
                )}>
                  ({practice.sessionTimeRemaining} min left)
                </span>
              )}
            </motion.div>

            {/* AI Avatar */}
            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                animate={{
                  scale: practice.isSpeaking ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 1.5, repeat: practice.isSpeaking ? Infinity : 0 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 sm:h-20 sm:w-20">
                  <svg className="h-8 w-8 text-primary sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 01-5.982-2.275M12 21a8.966 8.966 0 005.982-2.275M15.75 3.186a24.284 24.284 0 012.024.526m-9.5 0c.252-.032.504-.064.75-.097" />
                  </svg>
                </div>
                {practice.isListening && (
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

              <div className="w-48 sm:w-64">
                <Waveform
                  levels={audioLevels}
                  isActive={practice.isListening && !practice.isPaused}
                  height={32}
                  barWidth={3}
                  gap={2}
                />
              </div>
            </div>

            {/* Interim transcript */}
            {practice.interimTranscript && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-md text-center text-sm text-muted-foreground italic"
              >
                {practice.interimTranscript}
              </motion.p>
            )}
          </div>

          {/* Scrollable Transcript */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto w-full max-w-2xl space-y-4">
              <AnimatePresence>
                {practice.transcript.map((msg) => (
                  <TranscriptBubble
                    key={msg.id}
                    {...msg}
                    onReplay={practice.speak}
                  />
                ))}
              </AnimatePresence>
              {practice.isAiThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082" />
                    </svg>
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Fixed Bottom Controls */}
          <div className="flex shrink-0 flex-col items-center gap-2 border-t border-border/50 bg-background/80 backdrop-blur-md p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={practice.endConversation}
                disabled={practice.status !== "active"}
                title="End practice"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </Button>

            <motion.button
              onClick={practice.toggleListening}
              disabled={practice.isAiThinking || practice.isSpeaking}
              className={cn(
                "relative flex h-16 w-16 items-center justify-center rounded-full transition-colors sm:h-20 sm:w-20 disabled:opacity-50",
                practice.isPaused
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  : practice.isListening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {practice.isPaused ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : practice.isListening ? (
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
                onClick={practice.pauseListening}
                disabled={!practice.isListening || practice.isPaused}
                title="Pause practice"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
            </div>

            {!practice.isSpeechSupported && (
              <p className="text-xs text-amber-400">
                Speech recognition not supported in this browser. Use Chrome or Edge.
              </p>
            )}

            {practice.speechError && (
              <p className="text-xs text-red-400">
                Speech error: {practice.speechError}
              </p>
            )}
          </div>
        </div>

        {/* Feedback Panel */}
        <div className="hidden w-80 border-l border-border/50 bg-card/50 overflow-y-auto lg:block">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Feedback</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {practice.topic}
              </span>
            </div>

            {/* Latest encouragement */}
            {latestEncouragement && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">💪</span>
                  <h4 className="text-sm font-medium text-primary">Encouragement</h4>
                </div>
                <p className="text-sm text-muted-foreground italic">{latestEncouragement}</p>
              </motion.div>
            )}

            {/* Latest corrected sentence */}
            {latestCorrectedSentence && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h4 className="text-sm font-medium text-emerald-400">Your sentence, corrected</h4>
                </div>
                <p className="text-sm text-emerald-300">{latestCorrectedSentence}</p>
              </motion.div>
            )}

            {/* Pronunciation Tips */}
            {allPronunciationTips.length > 0 && (
              <div className="mb-4 space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Pronunciation Tips ({allPronunciationTips.length})
                </h4>
                {allPronunciationTips.map((tip, i) => (
                  <motion.div
                    key={`pron-${i}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg p-1.5 bg-amber-500/10 text-amber-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-amber-400">Pronunciation</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{tip.word}</span>
                          <button
                            onClick={() => practice.speak(tip.word)}
                            className="rounded-full p-0.5 text-amber-400 transition-colors hover:bg-amber-500/20"
                            title={`Listen to "${tip.word}"`}
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{tip.tip}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Corrections */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Corrections ({totalCorrections})
              </h4>
              {totalCorrections === 0 && (
                <p className="text-sm text-muted-foreground">
                  {practice.transcript.length > 1
                    ? "No corrections yet — keep going!"
                    : "Start speaking to get feedback on your English."}
                </p>
              )}
              {practice.transcript
                .filter((msg) => msg.corrections && msg.corrections.length > 0)
                .flatMap((msg) =>
                  (msg.corrections || [])
                    .filter((c) => c.type !== "pronunciation")
                    .map((correction, i) => (
                      <CorrectionCard
                        key={`${msg.id}-${i}`}
                        {...correction}
                        index={i}
                        onSpeak={practice.speak}
                      />
                    ))
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionScores({ scores }: { scores: PracticeScores }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Grammar", score: scores.grammar, color: "text-emerald-400" },
          { label: "Pronunciation", score: scores.pronunciation, color: "text-blue-400" },
          { label: "Vocabulary", score: scores.vocabulary, color: "text-purple-400" },
          { label: "Fluency", score: scores.fluency, color: "text-amber-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn("text-xl font-bold", item.color)}>{item.score}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">Overall Score</p>
        <p className={cn("text-3xl font-bold", getScoreColor(scores.overall))}>{scores.overall}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${scores.overall}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
