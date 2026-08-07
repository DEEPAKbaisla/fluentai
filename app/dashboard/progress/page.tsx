"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AchievementBadge } from "@/components/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyData {
  date: string;
  grammar: number;
  pronunciation: number;
  vocabulary: number;
  fluency: number;
}

interface WeakestWord {
  word: string;
  attempts: number;
  accuracy: number;
}

interface RepeatedMistake {
  mistake: string;
  count: number;
  type: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
}

export default function ProgressPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [weakestWords, setWeakestWords] = useState<WeakestWord[]>([]);
  const [repeatedMistakes, setRepeatedMistakes] = useState<RepeatedMistake[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [calendarData] = useState(() =>
    Array.from({ length: 28 }, (_, i) => {
      const seed = ((i * 7 + 13) % 100) / 100;
      return seed;
    })
  );

  useEffect(() => {
    fetch("/api/progress/monthly").then((r) => r.json()).then(setMonthlyData);
    fetch("/api/progress/weakest-words").then((r) => r.json()).then(setWeakestWords);
    fetch("/api/progress/repeated-mistakes").then((r) => r.json()).then(setRepeatedMistakes);
    fetch("/api/achievements").then((r) => r.json()).then(setAchievements);
  }, []);

  const hasMonthlyData = monthlyData.some((d) => d.grammar > 70 || d.pronunciation > 70);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="mt-1 text-muted-foreground">Track your improvement over time</p>
      </motion.div>

      {/* Score Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Score Trends</h2>
        {hasMonthlyData ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="grammar" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pronunciation" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vocabulary" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fluency" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p>No score data yet. Complete some practice sessions to see trends.</p>
          </div>
        )}
      </motion.div>

      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Practice Calendar</h2>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((intensity, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor:
                  intensity > 0.7
                    ? "var(--primary)"
                    : intensity > 0.4
                      ? "var(--primary)"
                      : "var(--muted)",
                opacity: intensity > 0.1 ? 0.3 + intensity * 0.7 : 0.1,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Weakest Words & Mistakes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Weakest Words</h2>
          {weakestWords.length > 0 ? (
            <div className="space-y-3">
              {weakestWords.map((word) => (
                <div key={word.word} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium">{word.word}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${word.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-sm text-muted-foreground">
                    {word.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No word data yet. Practice to build your vocabulary profile.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl border border-border/50 bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Most Repeated Mistakes</h2>
          {repeatedMistakes.length > 0 ? (
            <div className="space-y-3">
              {repeatedMistakes.map((mistake, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-muted/30 p-3"
                >
                  <div
                    className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      mistake.type === "grammar"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {mistake.type}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{mistake.mistake}</p>
                    <p className="text-xs text-muted-foreground">
                      {mistake.count} times
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No mistake data yet. Keep practicing to track your improvement.</p>
          )}
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h2 className="mb-4 text-lg font-semibold">Achievements</h2>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                icon={achievement.icon}
                title={achievement.title}
                unlocked={!!achievement.unlockedAt}
                progress={achievement.progress}
                target={achievement.target}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No achievements yet. Keep practicing to unlock them!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
