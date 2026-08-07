"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  online,
}: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-muted",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || fallback || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium text-muted-foreground">
            {fallback || "?"}
          </span>
        )}
      </div>
      {online !== undefined && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            online ? "bg-emerald-400" : "bg-muted-foreground/50",
            size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"
          )}
        />
      )}
    </div>
  );
}

interface AchievementBadgeProps {
  icon: string;
  title: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export function AchievementBadge({
  icon,
  title,
  unlocked,
  progress,
  target,
}: AchievementBadgeProps) {
  const percentage = Math.min((progress / target) * 100, 100);

  const iconMap: Record<string, React.ReactNode> = {
    mic: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    flame: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    book: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    brain: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    star: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    timer: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all",
        unlocked
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-muted/30 opacity-60"
      )}
    >
      <div
        className={cn(
          "rounded-xl p-3",
          unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {iconMap[icon] || iconMap.star}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {!unlocked && (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary/50"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {progress}/{target}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
