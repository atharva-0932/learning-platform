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
        "w-full bg-gradient-to-b from-[#1B004D] to-[#2E0A6F] text-white",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-16">
        <div className="mb-6 flex items-center space-x-3">
          {logo}
          <span className="text-xl font-semibold tracking-wide">{brandName}</span>
        </div>
        <p className="max-w-xl text-center text-sm font-normal leading-relaxed text-white/90">
          {tagline}
        </p>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-6 py-6 text-center text-sm font-normal">
          <p className="text-white/90">{copyright}</p>
          <div className="flex items-center gap-4 text-white/90">
            {legalLinks.map((link, idx) => (
              <div key={link.href} className="flex items-center gap-4">
                <a
                  href={link.href}
                  className="font-medium transition-all hover:text-white"
                >
                  {link.label}
                </a>
                {idx < legalLinks.length - 1 && (
                  <div className="h-4 w-px bg-white/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
