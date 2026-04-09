"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

export type JobOpeningDisplay = {
  title?: string;
  url?: string;
  snippet?: string;
  portal?: string;
  match_score?: number;
};

const PORTAL_PILL: Record<
  string,
  { pill: string; label: string }
> = {
  LinkedIn: {
    pill: "border border-primary/25 bg-primary/10 text-primary",
    label: "LinkedIn",
  },
  Naukri: {
    pill: "border border-border bg-secondary text-secondary-foreground",
    label: "Naukri",
  },
  Glassdoor: {
    pill: "border border-border bg-muted text-muted-foreground",
    label: "Glassdoor",
  },
};

function getPortalPill(portal?: string) {
  if (!portal) return PORTAL_PILL.LinkedIn;
  const hit = Object.keys(PORTAL_PILL).find((k) => portal.toLowerCase().includes(k.toLowerCase()));
  return hit ? PORTAL_PILL[hit] : PORTAL_PILL.LinkedIn;
}

function portalToGlowColor(portal?: string): "blue" | "purple" | "green" | "red" | "orange" {
  const p = portal?.toLowerCase() || "";
  if (p.includes("linkedin")) return "blue";
  if (p.includes("naukri")) return "purple";
  if (p.includes("glassdoor")) return "green";
  return "blue";
}

function RankMedal({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "from-primary to-primary/90 text-primary-foreground shadow-primary/30"
      : rank === 2
        ? "from-secondary to-muted text-secondary-foreground shadow-sm"
        : rank === 3
          ? "from-accent to-muted text-accent-foreground shadow-sm"
          : "from-muted to-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold shadow-md ring-2 ring-card",
        colors
      )}
      aria-hidden
    >
      #{rank}
    </div>
  );
}

function MatchMeter({ score }: { score: number }) {
  const s = Math.min(100, Math.max(0, score));
  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{Math.round(s)}</span>
        <span className="text-xs font-medium text-muted-foreground">%</span>
      </div>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
          initial={{ width: 0 }}
          animate={{ width: `${s}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.12 }}
        />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Skill match</span>
    </div>
  );
}

export function JobOpeningSpotlightCard({
  job,
  rank,
  className,
}: {
  job: JobOpeningDisplay;
  rank: number;
  className?: string;
}) {
  const glowColor = portalToGlowColor(job.portal);
  const pill = getPortalPill(job.portal);
  const score = typeof job.match_score === "number" ? job.match_score : 0;

  return (
    <GlowCard
      glowColor={glowColor}
      customSize
      className={cn(
        "w-full min-h-[280px] h-full border-0 text-left shadow-md shadow-primary/5 dark:shadow-primary/10",
        className
      )}
    >
      <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <RankMedal rank={rank} />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    pill.pill
                  )}
                >
                  {job.portal || pill.label}
                </span>
                {rank <= 3 && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {rank === 1 ? "Best match" : rank === 2 ? "Strong fit" : "Solid option"}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                {job.title || "Job listing"}
              </h3>
            </div>
          </div>
          <MatchMeter score={score} />
        </div>

        {job.snippet ? (
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{job.snippet}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground/70">No description preview available.</p>
        )}

        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            Apply on {job.portal || pill.label}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </GlowCard>
  );
}
