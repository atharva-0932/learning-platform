"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  /** When true, ignores size preset; use width/height or className for dimensions */
  customSize?: boolean;
}

/** Hue bases aligned with project primary (~262° / #8b5cf6) — spotlight shifts follow pointer */
const glowColorMap = {
  blue: { base: 262, spread: 200 },
  purple: { base: 278, spread: 260 },
  green: { base: 155, spread: 180 },
  red: { base: 340, spread: 200 },
  orange: { base: 32, spread: 200 },
} as const;

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
} as const;

const beforeAfterStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 262) calc(var(--saturation, 85) * 1%) calc(var(--lightness, 52) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
    );
    filter: brightness(2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      color-mix(in srgb, var(--primary) 28%, transparent), transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`;

export function GlowCard({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      const el = cardRef.current;
      if (!el) return;
      el.style.setProperty("--x", x.toFixed(2));
      el.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
      el.style.setProperty("--y", y.toFixed(2));
      el.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
    };

    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size];
  };

  const getInlineStyles = (): React.CSSProperties => {
    const vars: Record<string, string | number> = {
      "--base": base,
      "--spread": spread,
      "--radius": 14,
      "--border": 3,
      "--backdrop": "color-mix(in srgb, var(--card) 88%, transparent)",
      "--backup-border": "color-mix(in srgb, var(--border) 75%, transparent)",
      "--size": 200,
      "--outer": 1,
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      position: "relative",
      touchAction: "none",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 262) calc(var(--saturation, 85) * 1%) calc(var(--lightness, 58) * 1%) / var(--bg-spot-opacity, 0.14)), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: "fixed",
      border: "var(--border-size) solid var(--backup-border)",
    };

    if (width !== undefined) {
      vars.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      vars.height = typeof height === "number" ? `${height}px` : height;
    }

    return vars as unknown as React.CSSProperties;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={cn(
          getSizeClasses(),
          !customSize && "aspect-[3/4]",
          "rounded-2xl relative grid grid-rows-[1fr_auto] shadow-lg shadow-primary/[0.08] p-4 gap-4 backdrop-blur-md text-card-foreground dark:shadow-primary/10",
          className
        )}
      >
        <div data-glow aria-hidden />
        {children}
      </div>
    </>
  );
}
