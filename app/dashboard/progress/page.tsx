"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AchievementBadge } from "@/components/avatar";
import { ProgressSkeleton } from "@/components/dashboard-skeletons";
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

interface CalendarDay {
  date: string;
  sessions: number;
  active: boolean;
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
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [weakestWords, setWeakestWords] = useState<WeakestWord[]>([]);
  const [repeatedMistakes, setRepeatedMistakes] = useState<RepeatedMistake[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/progress/monthly").then((r) => r.json()).then(setMonthlyData),
      fetch("/api/progress/calendar").then((r) => r.json()).then(setCalendarData),
      fetch("/api/progress/weakest-words").then((r) => r.json()).then(setWeakestWords),
      fetch("/api/progress/repeated-mistakes").then((r) => r.json()).then(setRepeatedMistakes),
      fetch("/api/achievements").then((r) => r.json()).then(setAchievements),
    ]).finally(() => setLoading(false));
  }, []);

  const hasMonthlyData = monthlyData.some((d) => d.grammar > 70 || d.pronunciation > 70);

  if (loading) {
    return <ProgressSkeleton />;
  }

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
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>
        {calendarData.length > 0 ? (
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const firstDay = new Date(calendarData[0]?.date).getDay();
              const blanks = Array.from({ length: firstDay }, (_, i) => (
                <div key={`blank-${i}`} className="aspect-square" />
              ));
              return [
                ...blanks,
                ...calendarData.map((day) => {
                  const dayNum = new Date(day.date).getDate();
                  const maxSessions = Math.max(...calendarData.map((d) => d.sessions), 1);
                  const intensity = day.sessions / maxSessions;
                  return (
                    <div
                      key={day.date}
                      className={`group relative aspect-square rounded-sm transition-colors ${
                        day.sessions > 0
                          ? "cursor-pointer"
                          : ""
                      }`}
                      style={{
                        backgroundColor: day.sessions > 0
                          ? `var(--primary)`
                          : "var(--muted)",
                        opacity: day.sessions > 0 ? 0.3 + intensity * 0.7 : 0.15,
                      }}
                      title={`${day.date}: ${day.sessions} session${day.sessions !== 1 ? "s" : ""}`}
                    >
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                        day.sessions > 0 ? "text-primary-foreground" : "text-white"
                      }`}>
                        {dayNum}
                      </span>
                    </div>
                  );
                }),
              ];
            })()}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <p className="text-sm">No practice data yet. Start a session to see your calendar.</p>
          </div>
        )}
        {calendarData.length > 0 && (
          <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0.15, 0.35, 0.55, 0.75, 1].map((opacity) => (
                <div
                  key={opacity}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: "var(--primary)",
                    opacity,
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        )}
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
