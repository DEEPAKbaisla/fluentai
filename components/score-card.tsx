"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

const scoreCardVariants = cva(
  "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-border",
  {
    variants: {
      variant: {
        default: "",
        glass: "glass",
        gradient: "gradient-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ScoreCardProps extends VariantProps<typeof scoreCardVariants> {
  label: string;
  score: number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

export function ScoreCard({
  label,
  score,
  change,
  icon,
  color = "text-blue-400",
  variant,
}: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-blue-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(scoreCardVariants({ variant }))}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold tracking-tight", getScoreColor(score))}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "font-medium",
                  change >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl bg-muted/50 p-2.5", color)}>
          {icon}
        </div>
      </div>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
    </motion.div>
  );
}
