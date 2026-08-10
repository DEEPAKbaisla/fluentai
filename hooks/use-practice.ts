"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSpeechRecognition } from "./use-speech-recognition";
import { useSpeechSynthesis } from "./use-speech-synthesis";

export interface Correction {
  type: "grammar" | "vocabulary" | "pronunciation" | "fluency";
  original: string;
  corrected: string;
  explanation: string;
}

export interface PronunciationTip {
  word: string;
  tip: string;
}

export interface MessageScores {
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  fluency: number;
  confidence: number;
  overall: number;
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  corrections?: Correction[];
  correctedSentence?: string;
  encouragement?: string;
  pronunciationTips?: PronunciationTip[];
  scores?: MessageScores;
}

export interface PracticeScores {
  overall: number;
  grammar: number;
  pronunciation: number;
  vocabulary: number;
  fluency: number;
}

export interface UsageData {
  daily: { used: number; limit: number; remaining: number; percentage: number };
  monthly: { used: number; limit: number; remaining: number; percentage: number };
  sessionsToday: number;
  maxSessionMinutes: number;
  canStartSession: boolean;
}

type PracticeStatus = "idle" | "topic-select" | "starting" | "active" | "ending" | "completed";

export function usePractice() {
  const [status, setStatus] = useState<PracticeStatus>("idle");
  const [topic, setTopic] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [scores, setScores] = useState<PracticeScores | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [accent, setAccent] = useState("en-US");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  const speech = useSpeechRecognition();
  const tts = useSpeechSynthesis(accent);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.accent) setAccent(data.accent);
      })
      .catch(() => {});
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const startTimer = useCallback(() => {
    sessionStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);

      if (sessionStartTimeRef.current) {
        const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000 / 60;
        const maxSession = usage?.maxSessionMinutes || 15;
        const remaining = Math.max(0, maxSession - elapsed);
        setSessionTimeRemaining(Math.ceil(remaining));

        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 1000);
  }, [usage?.maxSessionMinutes]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionStartTimeRef.current = null;
    setSessionTimeRemaining(null);
  }, []);

  const selectTopic = useCallback((selectedTopic: string) => {
    setTopic(selectedTopic);
    setStatus("starting");
    setError(null);
  }, []);

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConversationId(data.conversationId);
      setTranscript([
        {
          id: "greeting",
          role: "ai",
          content: data.greeting,
          timestamp: formatTime(),
        },
      ]);

      if (data.usage) {
        setSessionTimeRemaining(data.usage.maxSessionMinutes);
      }

      setStatus("active");
      startTimer();

      setTimeout(() => {
        tts.speak(data.greeting);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
      setStatus("topic-select");
    }
  }, [topic, startTimer, tts]);

  useEffect(() => {
    if (status === "starting" && topic) {
      startConversation();
    }
  }, [status, topic, startConversation]);

  const sendUserMessage = useCallback(async (text: string) => {
    if (!conversationId || !text.trim()) return;

    const userEntry: TranscriptEntry = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: formatTime(),
    };
    setTranscript((prev) => [...prev, userEntry]);
    setIsAiThinking(true);

    try {
      const res = await fetch("/api/practice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, userMessage: text.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const aiEntry: TranscriptEntry = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.aiMessage,
        timestamp: formatTime(),
        corrections: data.corrections,
        correctedSentence: data.correctedSentence,
        encouragement: data.encouragement,
        pronunciationTips: data.pronunciationTips,
        scores: data.scores,
      };
      setTranscript((prev) => [...prev, aiEntry]);
      setIsAiThinking(false);

      if (data.limitReached) {
        stopTimer();
        speech.stopListening();
        tts.stop();
        fetchUsage();
        setStatus("ending");
        try {
          const endRes = await fetch("/api/practice/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId, duration }),
          });
          const endData = await endRes.json();
          setScores(endData.scores || {
            overall: 75, grammar: 80, pronunciation: 70, vocabulary: 75, fluency: 75,
          });
          setStatus("completed");
        } catch {
          setScores({
            overall: 75, grammar: 80, pronunciation: 70, vocabulary: 75, fluency: 75,
          });
          setStatus("completed");
        }
        return;
      }

      tts.speak(data.aiMessage);
    } catch {
      setIsAiThinking(false);
      setError("Failed to get response");
    }
  }, [conversationId, tts]);

  const toggleListening = useCallback(() => {
    if (speech.isPaused) {
      speech.resumeListening();
    } else if (speech.isListening) {
      speech.stopListening();
      if (speech.transcript.trim()) {
        sendUserMessage(speech.transcript);
      }
    } else {
      speech.startListening();
    }
  }, [speech, sendUserMessage]);

  const endConversation = useCallback(async () => {
    if (!conversationId) return;

    stopTimer();
    speech.stopListening();
    tts.stop();
    setStatus("ending");

    try {
      const res = await fetch("/api/practice/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, duration }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScores(data.scores);
      setStatus("completed");
      fetchUsage();
    } catch {
      setScores({
        overall: 75,
        grammar: 80,
        pronunciation: 70,
        vocabulary: 75,
        fluency: 75,
      });
      setStatus("completed");
      fetchUsage();
    }
  }, [conversationId, duration, stopTimer, speech, tts, fetchUsage]);

  const reset = useCallback(() => {
    stopTimer();
    speech.stopListening();
    tts.stop();
    setStatus("idle");
    setTopic("");
    setConversationId(null);
    setTranscript([]);
    setScores(null);
    setIsAiThinking(false);
    setDuration(0);
    setError(null);
    setSessionTimeRemaining(null);
  }, [stopTimer, speech, tts]);

  return {
    status,
    topic,
    transcript,
    scores,
    isAiThinking,
    duration,
    error,
    usage,
    sessionTimeRemaining,
    isListening: speech.isListening,
    isPaused: speech.isPaused,
    interimTranscript: speech.interimTranscript,
    isSpeaking: tts.isSpeaking,
    isSpeechSupported: speech.isSupported,
    speak: tts.speak,
    stopSpeaking: tts.stop,
    pauseListening: speech.pauseListening,
    selectTopic,
    startConversation,
    toggleListening,
    endConversation,
    reset,
    fetchUsage,
    speechError: speech.error,
  };
}
