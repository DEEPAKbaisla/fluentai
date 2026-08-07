"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WaveformProps {
  levels: number[];
  isActive?: boolean;
  color?: string;
  height?: number;
  barWidth?: number;
  gap?: number;
}

export function Waveform({
  levels,
  isActive = false,
  color = "bg-primary",
  height = 48,
  barWidth = 3,
  gap = 2,
}: WaveformProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height, gap }}
      role="img"
      aria-label={isActive ? "Audio waveform active" : "Audio waveform inactive"}
    >
      {levels.map((level, i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", color)}
          style={{ width: barWidth }}
          animate={{
            height: isActive ? Math.max(4, level * height) : 4,
            opacity: isActive ? 0.5 + level * 0.5 : 0.2,
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevels: number[];
}

export function AudioVisualizer({ isRecording, audioLevels }: AudioVisualizerProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rings */}
      {isRecording && (
        <>
          <motion.div
            className="absolute h-40 w-40 rounded-full border border-primary/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-52 w-52 rounded-full border border-primary/10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </>
      )}
      <Waveform
        levels={audioLevels}
        isActive={isRecording}
        height={64}
        barWidth={4}
        gap={3}
      />
    </div>
  );
}
