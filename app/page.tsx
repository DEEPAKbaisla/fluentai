"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturesSection } from "@/components/sections/features";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { PricingSection } from "@/components/sections/pricing";
import { FAQSection } from "@/components/sections/faq";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Content fade & slide (tied to page scroll)
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0.15]);
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  // Section-relative parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const blobScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blobOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const visualScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background pb-20 pt-32">
      {/* Background gradient — parallax */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
      />
      <motion.div
        style={{ scale: blobScale, opacity: blobOpacity }}
        className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <motion.div
        style={{ opacity, y }}
        className="relative mx-auto max-w-5xl px-4 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Powered by Advanced AI
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Practice English
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            with AI
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Speak naturally with AI and receive instant corrections for grammar,
          pronunciation, fluency, and vocabulary. Improve your English 10x faster
          with personalized feedback.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link href="/dashboard/practice">
            <Button
              size="lg"
              className="relative overflow-hidden rounded-full px-8 py-6 text-base font-medium shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Speaking Free
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-base font-medium"
            >
              View Demo
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ y: contentY }}
          className="mt-16 flex flex-col items-center gap-6"
        >
          <div className="flex -space-x-2">
            {["SK", "MR", "YT", "AH", "JL"].map((initials, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted by <span className="font-medium text-foreground">50,000+</span> learners worldwide
          </p>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ scale: visualScale, y: visualY }}
          className="relative mt-16"
        >
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="ml-4 flex-1 text-center text-sm text-muted-foreground">
                FluentAI Practice Session
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: conversation */}
              <div className="space-y-4 p-6">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 01-5.982-2.275M12 21a8.966 8.966 0 005.982-2.275M15.75 3.186a24.284 24.284 0 012.024.526m-9.5 0c.252-.032.504-.064.75-.097" />
                    </svg>
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                    Tell me about your last vacation!
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                    I went to Paris last month. The food were amazing!
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-xs font-medium text-primary-foreground">You</span>
                  </div>
                </div>
                <div className="ml-11 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
                  <span className="font-medium text-red-400">Grammar: </span>
                  <span className="text-muted-foreground line-through">food were</span>
                  <span className="mx-1 text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">food was</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 01-5.982-2.275M12 21a8.966 8.966 0 005.982-2.275M15.75 3.186a24.284 24.284 0 012.024.526m-9.5 0c.252-.032.504-.064.75-.097" />
                    </svg>
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                    Great! &quot;Food&quot; is uncountable, so we use &quot;was&quot;. Try telling me more about the food you tried!
                  </div>
                </div>
              </div>
              {/* Right: scores */}
              <div className="space-y-3 border-l border-border/50 bg-muted/20 p-6">
                <p className="text-sm font-medium text-muted-foreground">Session Score</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Grammar", score: 92, color: "text-emerald-400" },
                    { label: "Pronunciation", score: 85, color: "text-blue-400" },
                    { label: "Vocabulary", score: 88, color: "text-purple-400" },
                    { label: "Fluency", score: 83, color: "text-amber-400" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`text-2xl font-bold ${item.color}`}>{item.score}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-background/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Overall</p>
                  <p className="text-3xl font-bold text-foreground">87</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
