"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const ACCENT_VOICE_MAP: Record<string, { lang: string; preferred: string[] }> = {
  "en-US": {
    lang: "en-US",
    preferred: ["Google US English", "Samantha", "Alex", "Microsoft Zira", "Microsoft David"],
  },
  "en-GB": {
    lang: "en-GB",
    preferred: ["Google UK English", "Daniel", "Serena", "Microsoft Hazel", "Microsoft George"],
  },
  "en-AU": {
    lang: "en-AU",
    preferred: ["Google Australian English", "Karen", "Microsoft Hazel"],
  },
  "en-IN": {
    lang: "en-IN",
    preferred: ["Google Indian English", "Microsoft Heera", "Microsoft Ravi"],
  },
};

export function useSpeechSynthesis(accent?: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const accentRef = useRef(accent);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const accentConfig = ACCENT_VOICE_MAP[accentRef.current || "en-US"] || ACCENT_VOICE_MAP["en-US"];

      utterance.lang = accentConfig.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          accentConfig.preferred.some((name) => v.name.includes(name)) &&
          v.lang.startsWith(accentConfig.lang)
      ) || voices.find(
        (v) => v.lang.startsWith(accentConfig.lang)
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSpeaking, speak, stop, isSupported };
}
