"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FooterOneProps {
  className?: string;
  logo?: ReactNode;
  brandName: string;
  tagline: string;
  copyright: string;
  legalLinks: Array<{ href: string; label: string }>;
}

export function FooterOne({
  className,
  logo,
  brandName,
  tagline,
  copyright,
  legalLinks,
}: FooterOneProps) {
  return (
    <footer
      className={cn(
        "relative w-full overflow-hidden border-t border-primary/20 bg-gradient-to-b from-violet-50/90 via-background to-slate-100/70 text-foreground",
        "shadow-[inset_0_1px_0_0_rgba(139,92,246,0.08)]",
        "dark:border-primary/25 dark:from-[#07060f] dark:via-[#0c0a14] dark:to-[#120d1f] dark:shadow-[inset_0_1px_0_0_rgba(167,139,250,0.08)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(139,92,246,0.12),transparent_50%)]"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-5 sm:px-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-primary [&_svg]:text-primary">{logo}</span>
          <span className="text-base font-semibold tracking-wide text-foreground sm:text-lg">
            {brandName}
          </span>
        </div>
        <p className="max-w-xl text-center text-xs font-normal leading-snug text-muted-foreground sm:text-sm">
          {tagline}
        </p>
      </div>

      <div className="relative border-t border-border/80 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2.5 text-center text-xs text-muted-foreground sm:gap-x-4 sm:px-6 sm:text-sm">
          <p>{copyright}</p>
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-medium text-foreground/90 transition-colors hover:text-primary dark:text-white/85 dark:hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
