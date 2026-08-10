"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UsageMeterProps {
  used: number;
  limit: number;
  label: string;
  showRemaining?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UsageMeter({
  used,
  limit,
  label,
  showRemaining = true,
  size = "md",
  className,
}: UsageMeterProps) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const remaining = Math.max(0, limit - used);

  const getColor = (pct: number) => {
    if (pct >= 90) return { bar: "bg-red-500", text: "text-red-400", ring: "ring-red-500/20" };
    if (pct >= 70) return { bar: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/20" };
    return { bar: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/20" };
  };

  const colors = getColor(percentage);

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {showRemaining && (
          <span className={cn("text-xs font-medium", colors.text)}>
            {remaining} min left
          </span>
        )}
      </div>
      <div className={cn("overflow-hidden rounded-full bg-muted", heights[size])}>
        <motion.div
          className={cn("h-full rounded-full", colors.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {used} / {limit} min
        </span>
        <span className="text-[11px] text-muted-foreground">{percentage}%</span>
      </div>
    </div>
  );
}

interface UsageCardProps {
  daily: { used: number; limit: number; remaining: number; percentage: number };
  monthly: { used: number; limit: number; remaining: number; percentage: number };
  sessionsToday: number;
  plan: string;
  className?: string;
}

export function UsageCard({
  daily,
  monthly,
  sessionsToday,
  plan,
  className,
}: UsageCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Today&apos;s Usage</h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
          {plan} Plan
        </span>
      </div>

      <div className="space-y-4">
        <UsageMeter
          used={daily.used}
          limit={daily.limit}
          label="Daily Practice"
          size="md"
        />

        <UsageMeter
          used={monthly.used}
          limit={monthly.limit}
          label="Monthly Practice"
          size="sm"
        />

        <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
          <span className="text-xs text-muted-foreground">Sessions today</span>
          <span className="text-sm font-semibold">{sessionsToday}</span>
        </div>
      </div>
    </div>
  );
}
