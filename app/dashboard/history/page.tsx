"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConversationItem {
  id: string;
  topic: string;
  date: string;
  duration: number;
  overallScore: number;
  grammarScore: number;
  pronunciationScore: number;
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations(searchQuery?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    params.set("limit", "50");
    const res = await fetch(`/api/conversations?${params}`);
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchConversations(search);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setSelectedConv(null);
  }

  const filtered = conversations;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Conversation History</h1>
        <p className="mt-1 text-muted-foreground">Review your past practice sessions</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </motion.div>

      {/* Conversations List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-1 text-right">
                  <Skeleton className="ml-auto h-3 w-10" />
                  <Skeleton className="ml-auto h-6 w-8" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-border cursor-pointer"
              onClick={() => setSelectedConv(conv)}
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
                    {formatDate(conv.date)} · {formatDuration(conv.duration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-lg font-bold text-emerald-400">{conv.overallScore}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv.id);
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-3 text-sm text-muted-foreground">
            {search ? "No conversations match your search" : "No conversations yet"}
          </p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedConv} onOpenChange={() => setSelectedConv(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedConv?.topic}</DialogTitle>
          </DialogHeader>
          {selectedConv && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Overall</p>
                  <p className="text-2xl font-bold text-emerald-400">{selectedConv.overallScore}</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(selectedConv.duration)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Grammar</p>
                  <p className="text-lg font-bold text-blue-400">{selectedConv.grammarScore}</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pronunciation</p>
                  <p className="text-lg font-bold text-purple-400">{selectedConv.pronunciationScore}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedConv(null)}>Close</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedConv && handleDelete(selectedConv.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
