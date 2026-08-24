"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pausedRef = useRef(false);
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined";

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("Audio recording is not supported in this browser");
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      pausedRef.current = false;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: recorder.mimeType || "" })
          : null;
        chunksRef.current = [];
        stopTracks();
        setIsRecording(false);
        setIsPaused(false);
        pausedRef.current = false;
        const resolveStop = stopResolverRef.current;
        stopResolverRef.current = null;
        resolveStop?.(blob);
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch {
      recorderRef.current = null;
      stopTracks();
      chunksRef.current = [];
      setIsRecording(false);
      setIsPaused(false);
      pausedRef.current = false;
      setError("Microphone access denied");
    }
  }, [isSupported, stopTracks]);

  const pauseRecording = useCallback(() => {
    if (!recorderRef.current) return;
    pausedRef.current = true;
    try {
      recorderRef.current.pause();
      setIsPaused(true);
    } catch {
      // Already paused
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (!recorderRef.current) return;
    pausedRef.current = false;
    try {
      recorderRef.current.resume();
      setIsPaused(false);
    } catch {
      // Already recording
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      stopResolverRef.current = resolve;
      try {
        recorder.stop();
      } catch {
        // Already stopped
        stopResolverRef.current = null;
        resolve(null);
      }
    });
  }, []);

  const reset = useCallback(() => {
    setError(null);
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      pausedRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          stopResolverRef.current = null;
          recorder.stop();
        } catch {
          // Already stopped
        }
      }
      stopTracks();
      recorderRef.current = null;
    };
  }, [stopTracks]);

  return {
    isRecording,
    isPaused,
    error,
    isSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  };
}
