"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn, getScoreColor, computeQuickAccuracy } from "@/lib/utils";

interface PronunciationData {
  word: string;
  phonetic: string;
  syllables: string;
  stressPattern: string;
  ipa: string;
  definition: string;
  tips: string[];
  commonMistakes: string[];
  similarWords: string[];
}

interface AnalysisResult {
  accuracy: number;
  feedback: string;
  whatWentWrong: string;
  suggestion: string;
}

export default function PronunciationPage() {
  const [inputWord, setInputWord] = useState("");
  const [pronData, setPronData] = useState<PronunciationData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [quickAccuracy, setQuickAccuracy] = useState<number | null>(null);

  const tts = useSpeechSynthesis();
  const speech = useSpeechRecognition();

  const handleLookup = useCallback(async (word?: string) => {
    const lookupWord = (word || inputWord).trim();
    if (!lookupWord) return;

    setIsLookupLoading(true);
    setError(null);
    setAnalysis(null);
    setAttemptCount(0);
    setQuickAccuracy(null);

    try {
      const res = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: lookupWord }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPronData(data);
      setInputWord(data.word);
      setRecentWords((prev) => {
        const filtered = prev.filter((w) => w !== data.word);
        return [data.word, ...filtered].slice(0, 8);
      });

      setTimeout(() => {
        tts.speak(data.word);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get pronunciation");
      setPronData(null);
    } finally {
      setIsLookupLoading(false);
    }
  }, [inputWord, tts]);

  const handleSpeakWord = useCallback(() => {
    if (pronData) {
      tts.speak(pronData.word);
    }
  }, [pronData, tts]);

  const handleStartPractice = useCallback(() => {
    setAnalysis(null);
    speech.startListening();
  }, [speech]);

  const handleStopPractice = useCallback(async () => {
    speech.stopListening();

    const spokenText = speech.transcript.trim();
    if (!spokenText || !pronData) return;

    const immediate = computeQuickAccuracy(pronData.word, spokenText);
    setQuickAccuracy(immediate);
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/pronunciation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetWord: pronData.word,
          spokenText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnalysis(data);
      setQuickAccuracy(null);
      setAttemptCount((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze pronunciation");
    } finally {
      setIsAnalyzing(false);
    }
  }, [speech.transcript, pronData]);

  const handleRetry = useCallback(() => {
    setAnalysis(null);
    setQuickAccuracy(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight">Pronunciation Practice</h1>
          <p className="mt-2 text-muted-foreground">
            Enter a word to learn its correct pronunciation, then practice speaking it
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2"
        >
          <Input
            type="text"
            placeholder="Type a word (e.g. pronunciation)"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="h-12 text-base"
          />
          <Button
            onClick={() => handleLookup()}
            disabled={isLookupLoading || !inputWord.trim()}
            className="h-12 px-6"
          >
            {isLookupLoading ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            ) : (
              "Look Up"
            )}
          </Button>
        </motion.div>

        {/* Recent Words */}
        {recentWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">Recent words</p>
            <div className="flex flex-wrap gap-2">
              {recentWords.map((w) => (
                <button
                  key={w}
                  onClick={() => handleLookup(w)}
                  className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                >
                  {w}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Pronunciation Info Card */}
        <AnimatePresence mode="wait">
          {pronData && (
            <motion.div
              key={pronData.word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Main Card */}
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">{pronData.word}</h2>
                    {pronData.definition && (
                      <p className="mt-1 text-sm text-muted-foreground">{pronData.definition}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSpeakWord}
                    disabled={tts.isSpeaking}
                    className="shrink-0 rounded-full"
                    title={`Listen to "${pronData.word}"`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </Button>
                </div>

                {/* Pronunciation Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Phonetic</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{pronData.phonetic}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">IPA</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{pronData.ipa}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Syllables</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{pronData.syllables}</p>
                  </div>
                </div>

                {/* Stress Pattern */}
                {pronData.stressPattern && (
                  <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="text-xs font-medium text-primary mb-2">Stress Pattern</p>
                    <p className="text-lg font-mono font-bold text-foreground">{pronData.stressPattern}</p>
                    <p className="mt-1 text-xs text-muted-foreground">The CAPS syllable should be emphasized</p>
                  </div>
                )}
              </Card>

              {/* Tips */}
              {pronData.tips.length > 0 && (
                <Card className="border-border/50 bg-card/50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pronunciation Tips
                  </h3>
                  <ul className="space-y-2">
                    {pronData.tips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Common Mistakes */}
              {pronData.commonMistakes.length > 0 && (
                <Card className="border-border/50 bg-card/50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Common Mistakes
                  </h3>
                  <ul className="space-y-2">
                    {pronData.commonMistakes.map((mistake, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        {mistake}
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Similar Words */}
              {pronData.similarWords.length > 0 && (
                <Card className="border-border/50 bg-card/50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Similar Words for Practice
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pronData.similarWords.map((w) => (
                      <button
                        key={w}
                        onClick={() => handleLookup(w)}
                        className="rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Practice Section */}
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Practice Speaking
                </h3>

                {!analysis ? (
                  <div className="text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                      Click listen first, then try saying &quot;{pronData.word}&quot; yourself
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={handleSpeakWord}
                        disabled={tts.isSpeaking}
                        className="rounded-full"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        Listen
                      </Button>

                      <motion.button
                        onClick={speech.isListening ? handleStopPractice : handleStartPractice}
                        disabled={isAnalyzing || tts.isSpeaking}
                        className={cn(
                          "relative flex h-16 w-16 items-center justify-center rounded-full transition-colors disabled:opacity-50",
                          speech.isListening
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                            : "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {speech.isListening ? (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                        {speech.isListening && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-red-400/30"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    </div>

                    {speech.isListening && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-sm text-red-400"
                      >
                        Listening... speak now, then click stop
                      </motion.p>
                    )}
                    {speech.transcript && !speech.isListening && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-sm text-muted-foreground"
                      >
                        Detected: &quot;{speech.transcript}&quot;
                        {isAnalyzing && quickAccuracy !== null && (
                          <span className={cn("ml-2 inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-xs font-semibold", getScoreColor(quickAccuracy))}>
                            {quickAccuracy}%
                          </span>
                        )}
                      </motion.p>
                    )}
                  </div>
                ) : (
                  /* Analysis Result */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* Accuracy Score */}
                    <div className="text-center">
                      <div className="mb-2 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                        <div className="text-center">
                          <p className={cn("text-3xl font-bold", getScoreColor(analysis.accuracy))}>
                            {analysis.accuracy}
                          </p>
                          <p className="text-[10px] text-muted-foreground">accuracy</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Attempt {attemptCount}
                      </p>
                    </div>

                    {/* Feedback */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h4 className="text-sm font-medium text-emerald-400">Feedback</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.feedback}</p>
                    </div>

                    {/* What Went Wrong */}
                    {analysis.whatWentWrong && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <h4 className="text-sm font-medium text-amber-400">What to improve</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{analysis.whatWentWrong}</p>
                      </div>
                    )}

                    {/* Suggestion */}
                    {analysis.suggestion && (
                      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h4 className="text-sm font-medium text-purple-400">Suggestion</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{analysis.suggestion}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleRetry}
                      >
                        Try Again
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          handleRetry();
                          setTimeout(() => handleSpeakWord(), 100);
                        }}
                      >
                        Listen & Retry
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!pronData && !error && !isLookupLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Practice Any Word</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Type any English word above to get its phonetic spelling, IPA notation,
              and AI-powered pronunciation guidance. Then practice speaking it!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
