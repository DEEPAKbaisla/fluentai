"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScoreCard } from "@/components/score-card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard-skeletons";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UserProfile {
  name: string;
  streak: number;
}

interface ScoreData {
  overall: { score: number; change: number };
  grammar: { score: number; change: number };
  pronunciation: { score: number; change: number };
  vocabulary: { score: number; change: number };
}

interface WeeklyData {
  day: string;
  score: number;
  minutes: number;
}

interface ConversationItem {
  id: string;
  topic: string;
  date: string;
  duration: number;
  overallScore: number;
}

interface TopicItem {
  id: string;
  title: string;
  icon: string;
  level: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()).then(setProfile),
      fetch("/api/scores/latest").then((r) => r.json()).then(setScores),
      fetch("/api/weekly-progress").then((r) => r.json()).then(setWeeklyData),
      fetch("/api/conversations?limit=3").then((r) => r.json()).then((d) => setConversations(d.conversations || [])),
      fetch("/api/practice-topics?limit=5").then((r) => r.json()).then(setTopics),
    ]).finally(() => setLoading(false));
  }, []);

  const firstName = profile?.name?.split(" ")[0] || session?.user?.name?.split(" ")[0] || "there";
  const streak = profile?.streak ?? 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Good {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {streak > 0
            ? `Keep up your streak! You've been practicing for ${streak} days straight.`
            : "Start practicing to build your streak!"}
        </p>
      </motion.div>

      {/* Streak & Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-4"
      >
        {streak > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2">
            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="text-sm font-medium text-amber-400">
              {streak} day streak
            </span>
          </div>
        )}
        <Link href="/dashboard/practice">
          <Button className="rounded-full">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Practice
          </Button>
        </Link>
      </motion.div>

      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          label="Overall Score"
          score={scores?.overall?.score ?? 0}
          change={scores?.overall?.change ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="text-emerald-400"
        />
        <ScoreCard
          label="Grammar"
          score={scores?.grammar?.score ?? 0}
          change={scores?.grammar?.change ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="text-blue-400"
        />
        <ScoreCard
          label="Pronunciation"
          score={scores?.pronunciation?.score ?? 0}
          change={scores?.pronunciation?.change ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          }
          color="text-purple-400"
        />
        <ScoreCard
          label="Vocabulary"
          score={scores?.vocabulary?.score ?? 0}
          change={scores?.vocabulary?.change ?? 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          color="text-amber-400"
        />
      </div>

      {/* Charts & Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Weekly Progress</h2>
            <span className="text-sm text-muted-foreground">Last 7 days</span>
          </div>
          {weeklyData.some((d) => d.score > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <p>No practice data yet. Start a conversation to see your progress.</p>
            </div>
          )}
        </motion.div>

        {/* Practice Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl border border-border/50 bg-card p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Practice Topics</h2>
          <div className="space-y-2">
            {topics.length > 0 ? (
              topics.slice(0, 5).map((topic) => (
                <Link
                  key={topic.id}
                  href="/dashboard/practice"
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">{topic.level}</p>
                  </div>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No topics available.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Conversations</h2>
          <Link href="/dashboard/history" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            View all
          </Link>
        </div>
        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{conv.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(conv.date)} · {formatDuration(conv.duration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-lg font-bold text-emerald-400">{conv.overallScore}</p>
                  </div>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-3 text-sm text-muted-foreground">No conversations yet</p>
            <Link href="/dashboard/practice">
              <Button className="mt-4 rounded-full" size="sm">Start your first practice</Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
