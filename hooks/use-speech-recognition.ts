"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function useSpeechRecognition() {
  const [status, setStatus] = useState<"idle" | "listening" | "paused">("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const pausedRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript((prev) => (prev ? prev + " " + final : final));
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(event.error);
      }
      if (!pausedRef.current) {
        setStatus("idle");
      }
    };

    recognition.onend = () => {
      if (!pausedRef.current) {
        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      pausedRef.current = true;
      recognition.abort();
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    pausedRef.current = false;
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
      setStatus("listening");
    } catch {
      // Already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    pausedRef.current = false;
    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped
    }
    setStatus("idle");
  }, []);

  const pauseListening = useCallback(() => {
    if (!recognitionRef.current) return;
    pausedRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped
    }
    setStatus("paused");
  }, []);

  const resumeListening = useCallback(() => {
    if (!recognitionRef.current) return;
    pausedRef.current = false;
    try {
      recognitionRef.current.start();
      setStatus("listening");
    } catch {
      // Already started
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening: status === "listening",
    isPaused: status === "paused",
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    resetTranscript,
  };
}
