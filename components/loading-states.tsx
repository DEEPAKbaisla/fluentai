"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LoadingSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <svg
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-3",
            i % 2 === 0 ? "justify-start" : "justify-end"
          )}
        >
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-10 w-64 animate-pulse rounded-2xl bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 p-12 text-center"
    >
      <div className="mb-4 rounded-2xl bg-muted/50 p-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </motion.div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center"
    >
      <div className="mb-4 rounded-2xl bg-destructive/10 p-4 text-destructive">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
