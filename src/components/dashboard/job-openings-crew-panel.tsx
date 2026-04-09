"use client";

import { useEffect, useState } from "react";
import { Briefcase, Loader2, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getJobOpeningsCrew } from "@/lib/api";
import { JobOpeningSpotlightCard, type JobOpeningDisplay } from "@/components/dashboard/job-opening-spotlight-card";
import { JobOpeningsLoadingSkeleton } from "@/components/dashboard/job-openings-loading-skeleton";

export function JobOpeningsCrewPanel({
  targetRole,
  skills,
}: {
  targetRole: string;
  skills: string[];
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [crewLog, setCrewLog] = useState<string | null>(null);
  const [topMatches, setTopMatches] = useState<JobOpeningDisplay[]>([]);

  const load = () => {
    setLoading(true);
    setError(null);
    getJobOpeningsCrew(targetRole, skills)
      .then((data) => {
        if (data.error) {
          setError(String(data.error));
          return;
        }
        setHint(data.config_hint ?? null);
        setSummary(data.summary ?? null);
        setCrewLog(data.crew_output ?? null);
        setTopMatches(data.top_matches || []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const skillsKey = skills.slice().sort().join("|");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when role or skill set changes
  }, [targetRole, skillsKey]);

  return (
    <Card className="relative overflow-hidden border-border/60 bg-gradient-to-b from-card via-card to-muted/40 shadow-lg shadow-primary/[0.06] dark:to-muted/25 dark:shadow-primary/10">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary/[0.05] blur-3xl"
        aria-hidden
      />

      <CardHeader className="relative border-b border-border/50 bg-muted/20 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Live scan · last 24h
            </div>
            <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Top picks for you
              </span>
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-relaxed">
              Up to six best-fit roles, ranked by overlap with your skills
              {skills.length > 0 ? (
                <span className="text-foreground/80">
                  {" "}
                  ({skills.slice(0, 4).join(", ")}
                  {skills.length > 4 ? "…" : ""})
                </span>
              ) : null}
              . Opens the original listing on each portal.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="shrink-0 gap-2 border-border/80 bg-background/80 backdrop-blur-sm hover:bg-muted/80"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4" />
                Refresh matches
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6 px-4 pb-8 pt-6 sm:px-8">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              <JobOpeningsLoadingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && hint && (
          <div className="rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-500/10 to-amber-500/5 px-5 py-4 text-sm text-amber-950 dark:text-amber-100">
            {hint}
          </div>
        )}

        {!loading && summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-transparent to-violet-500/[0.05] p-5 sm:p-6"
          >
            <div className="absolute right-4 top-4 opacity-[0.08]">
              <Sparkles className="h-24 w-24 text-primary" />
            </div>
            <div className="relative flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/90">AI takeaway</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{summary}</p>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && crewLog && (
          <details className="group rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground/70 outline-none marker:text-primary">
              Search trace
            </summary>
            <p className="mt-2 font-mono text-[11px] leading-relaxed opacity-90">{crewLog}</p>
          </details>
        )}

        {!loading && !hint && topMatches.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No listings matched this window</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a broader role title or run refresh in a few hours.
            </p>
          </div>
        )}

        {!loading && topMatches.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 items-stretch">
            {topMatches.map((job, i) => (
              <motion.li
                key={job.url || `job-${i}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 360, damping: 26 }}
                className="min-w-0 flex"
              >
                <JobOpeningSpotlightCard job={job} rank={i + 1} className="h-full w-full min-h-0" />
              </motion.li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
