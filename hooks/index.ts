"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(32).fill(0));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const updateLevels = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const levels = Array.from(dataArray.slice(0, 32)).map((v) => v / 255);
    setAudioLevels(levels);
    animationRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setDuration(0);
    intervalRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    // Simulate audio levels for demo
    const simulateLevels = () => {
      setAudioLevels((prev) =>
        prev.map(() => Math.random() * 0.8 + 0.1)
      );
      animationRef.current = requestAnimationFrame(simulateLevels);
    };
    animationRef.current = requestAnimationFrame(simulateLevels);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setAudioLevels(new Array(32).fill(0));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { isRecording, duration, audioLevels, startRecording, stopRecording };
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ interimTranscript, setInterimTranscript] = useState("");

  const startListening = useCallback(() => {
    setIsListening(true);
    // Simulated speech recognition
    const phrases = [
      "Last summer I went to Japan",
      "It was an amazing experience",
      "The food was delicious",
      "I would love to go back someday",
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < phrases.length) {
        setTranscript((prev) => prev + " " + phrases[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 2000);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query, matches]);

  return matches;
}
