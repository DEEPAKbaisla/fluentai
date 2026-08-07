"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
}

interface SubscriptionData {
  plan: string;
  status: string;
}

interface StatsData {
  sessions: number;
  practiceTime: string;
  avgScore: number;
}

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch("/api/subscription/current").then((r) => r.json()).then(setCurrentPlan);
    fetch("/api/subscription/stats").then((r) => r.json()).then(setStats);
    fetch("/api/pricing-plans").then((r) => r.json()).then(setPlans);
  }, []);

  const userPlan = currentPlan?.plan || "free";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="mt-1 text-muted-foreground">Manage your plan and billing</p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-primary/30 bg-primary/5 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-2xl font-bold capitalize">{userPlan}</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-4 py-2">
            <p className="text-sm font-medium text-primary">
              {currentPlan?.status === "active" ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{stats?.sessions ?? 0}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.practiceTime ?? "0h"}</p>
            <p className="text-xs text-muted-foreground">Practice Time</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.avgScore ?? 0}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </div>
      </motion.div>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            className={cn(
              "relative rounded-2xl border p-6 transition-all duration-300",
              plan.id === userPlan
                ? "border-primary bg-card shadow-xl shadow-primary/10"
                : "border-border/50 bg-card"
            )}
          >
            {plan.id === userPlan && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Current Plan
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/{plan.period}</span>
            </div>
            <ul className="mb-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={plan.id === userPlan ? "default" : "outline"}
              className="w-full rounded-full"
              disabled={plan.id === userPlan}
            >
              {plan.id === userPlan ? "Current Plan" : plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Billing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Billing</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
            <div>
              <p className="font-medium">Next billing date</p>
              <p className="text-sm text-muted-foreground">N/A</p>
            </div>
            <p className="text-lg font-bold">$0.00</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
            <div>
              <p className="font-medium">Payment method</p>
              <p className="text-sm text-muted-foreground">No payment method</p>
            </div>
            <Button variant="ghost" size="sm">Update</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
