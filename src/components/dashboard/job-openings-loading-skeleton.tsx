"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { GlowCard, type GlowCardProps } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

const SKELETON_GLOW: NonNullable<GlowCardProps["glowColor"]>[] = [
  "blue",
  "purple",
  "green",
  "blue",
  "purple",
  "green",
];

const TOP_N = 6;

export function JobOpeningsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-3">
        <div className="relative">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Finding your best-fit roles</p>
          <p className="text-xs text-muted-foreground">
            Scanning listings and ranking against your skills — spotlight preview below
          </p>
        </div>
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: TOP_N }).map((_, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.07,
              type: "spring",
              stiffness: 320,
              damping: 24,
            }}
            className="min-w-0 list-none"
          >
            <GlowCard
              glowColor={SKELETON_GLOW[i % SKELETON_GLOW.length]}
              customSize
              className={cn(
                "w-full min-h-[220px] border-0 text-left shadow-md shadow-primary/5",
                "pointer-events-none"
              )}
            >
              <div
                className="relative z-10 flex h-full min-h-[200px] flex-col justify-between gap-4"
                aria-hidden
              >
                <div className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-muted/70" />
                  <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                    <div className="h-2.5 w-16 animate-pulse rounded-md bg-primary/20" />
                    <div className="h-4 w-full max-w-[90%] animate-pulse rounded-md bg-muted/60" />
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted/45" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted/35" />
                </div>
                <div className="h-11 w-full animate-pulse rounded-xl bg-muted/55" />
              </div>
            </GlowCard>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
