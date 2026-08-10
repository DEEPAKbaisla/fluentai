"use client";

import { Skeleton } from "@/components/ui/skeleton";

function ScoreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

function ConversationCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4">
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
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

function TopicCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl p-3">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCardSkeleton />
        <ScoreCardSkeleton />
        <ScoreCardSkeleton />
        <ScoreCardSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-2">
            <TopicCardSkeleton />
            <TopicCardSkeleton />
            <TopicCardSkeleton />
            <TopicCardSkeleton />
            <TopicCardSkeleton />
          </div>
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          <ConversationCardSkeleton />
          <ConversationCardSkeleton />
          <ConversationCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <Skeleton className="mb-4 h-5 w-36" />
        <div className="mb-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-sm" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <Skeleton className="mb-4 h-5 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted/30 p-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-16 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 text-center">
              <Skeleton className="mx-auto mb-2 h-10 w-10 rounded-full" />
              <Skeleton className="mx-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SubscriptionSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/30 p-4 text-center">
              <Skeleton className="mx-auto mb-1 h-8 w-8" />
              <Skeleton className="mx-auto h-3 w-20" />
            </div>
            <div className="rounded-xl bg-muted/30 p-4 text-center">
              <Skeleton className="mx-auto mb-1 h-8 w-8" />
              <Skeleton className="mx-auto h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="mb-6 space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="mb-6 h-10 w-24" />
            <div className="mb-6 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-start gap-2">
                  <Skeleton className="mt-0.5 h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <Skeleton className="mb-4 h-5 w-20" />
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <Skeleton className="mb-4 h-5 w-20" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <Skeleton className="mb-4 h-5 w-28" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PracticeTopicsSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 lg:h-[calc(100vh-2rem)]">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center space-y-2">
          <Skeleton className="mx-auto h-8 w-56" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>
        <Skeleton className="mb-6 h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card p-5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
