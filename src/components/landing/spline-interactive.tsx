"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const metrics = [
  { value: "10,000+", label: "Resumes analyzed" },
  { value: "3×", label: "Interview rate" },
  { value: "< 5 min", label: "To your roadmap" },
];

const mockRoadmapSteps = [
  { label: "Resume parsed", done: true },
  { label: "ATS score: 87%", done: true },
  { label: "Skill gaps identified", done: true },
  { label: "Roadmap generated", done: true },
  { label: "Mock interview ready", done: false, active: true },
];

const mockSkills = ["React", "TypeScript", "Node.js", "System Design"];
const missingSkills = ["Go", "Kubernetes"];

export function SplineInteractive({
  user,
  onGetStartedClick,
}: {
  user?: User | null;
  onGetStartedClick?: () => void;
}) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-32 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left — headline + CTAs */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Zap className="h-3.5 w-3.5" />
              AI-powered career acceleration
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter text-foreground"
            >
              Land Your
              <br />
              Dream Job,
              <br />
              <span className="gradient-text">Faster.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
            >
              AI roadmaps, ATS-optimized resumes, voice interview prep, and job
              tracking — everything you need, in one place.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-primary px-7 text-base font-semibold hover:bg-primary/90"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : onGetStartedClick ? (
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-primary px-7 text-base font-semibold hover:bg-primary/90"
                  onClick={onGetStartedClick}
                >
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-primary px-7 text-base font-semibold hover:bg-primary/90"
                  >
                    Start for free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 px-5 text-base font-semibold text-[#f59e0b] hover:bg-[#f59e0b]/10 hover:text-[#f59e0b]"
                >
                  See how it works
                </Button>
              </Link>
            </motion.div>

            {/* Metrics strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-8"
            >
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — product mockup card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Outer glow */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.6) 0%, transparent 70%)",
              }}
              aria-hidden
            />

            {/* Main mockup card */}
            <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Card top bar */}
              <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-xs text-muted-foreground font-medium">
                  skillsphere.ai — Career Dashboard
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    AS
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Atharva Sawant</p>
                    <p className="text-xs text-muted-foreground">Target: Senior Frontend Engineer</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    87% match
                  </div>
                </div>

                {/* Roadmap progress */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Your roadmap
                  </p>
                  {mockRoadmapSteps.map((step) => (
                    <div key={step.label} className="flex items-center gap-2.5">
                      <div
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${
                          step.done
                            ? "bg-emerald-500"
                            : step.active
                              ? "bg-primary animate-pulse"
                              : "bg-border"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          step.done
                            ? "text-foreground"
                            : step.active
                              ? "text-primary font-semibold"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                      {step.done && (
                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Skills row */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mockSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                    {missingSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-2.5 py-0.5 text-xs font-medium text-[#f59e0b]"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interview ready pill */}
                <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Voice Interview Ready</p>
                      <p className="text-xs text-muted-foreground">AI will ask real interview questions</p>
                    </div>
                  </div>
                  <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90">
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
