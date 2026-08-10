"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            Pricing
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Start free and upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-6 transition-all duration-300",
                plan.highlighted
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border/50 bg-card hover:border-border"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `\u20B9${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">
                    /{plan.period}
                  </span>
                )}
              </div>
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className={cn(
                    "w-full rounded-full",
                    plan.highlighted && "shadow-lg shadow-primary/25"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
