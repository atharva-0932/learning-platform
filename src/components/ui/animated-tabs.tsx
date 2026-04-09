"use client";

import React, { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MenuBar, type GlowMenuItem } from "@/components/ui/glow-menu";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { useScreenSize } from "@/hooks/use-screen-size";

export interface AnimatedTabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  /** Required when variant is "glow" */
  icon?: LucideIcon;
  gradient?: string;
  iconColor?: string;
  iconHoverClass?: string;
}

interface AnimatedTabsProps {
  tabs: AnimatedTabItem[];
  defaultTab?: string;
  className?: string;
  layoutGroupId?: string;
  /** default: pill row · glow: icon menu · gooey: merged blob tab bar + panel (dashboard profile) */
  variant?: "default" | "glow" | "gooey";
}

function sanitizeFilterId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9-_]/g, "-");
}

export function AnimatedTabs({
  tabs,
  defaultTab,
  className,
  layoutGroupId = "animated-tabs",
  variant = "default",
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    () => defaultTab ?? tabs[0]?.id ?? "",
  );

  const screenSize = useScreenSize();
  const gooeyStrength = screenSize.lessThan("md") ? 8 : 14;
  const gooeyFilterId = useMemo(
    () => `${sanitizeFilterId(layoutGroupId)}-gooey-filter`,
    [layoutGroupId],
  );

  if (!tabs?.length) return null;

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const glowMenuItems: GlowMenuItem[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    href: `#${t.id}`,
    icon: t.icon!,
    gradient:
      t.gradient ??
      "radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(167,139,250,0.1) 48%, rgba(139,92,246,0) 100%)",
    iconColor: t.iconColor ?? "text-primary",
    iconHoverClass: t.iconHoverClass,
  }));

  if (variant === "gooey") {
    return (
      <div className={cn("flex w-full max-w-none flex-col gap-0", className)}>
        <GooeyFilter id={gooeyFilterId} strength={gooeyStrength} />
        <div className="relative w-full">
          <div
            className="overflow-hidden rounded-xl"
            style={{ filter: `url(#${gooeyFilterId})` }}
          >
            <div className="flex w-full">
              {tabs.map((tab) => (
                <div key={tab.id} className="relative h-11 flex-1 md:h-12">
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId={`${layoutGroupId}-gooey-active`}
                      className="absolute inset-0 bg-muted"
                      transition={{
                        type: "spring",
                        bounce: 0,
                        duration: 0.45,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="min-h-[12rem] w-full bg-muted">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeTab}
                  role="tabpanel"
                  id={`panel-${activeTab}`}
                  aria-labelledby={`tab-${activeTab}`}
                  initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="p-5 text-card-foreground sm:p-6"
                >
                  {active?.content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-11 md:h-12"
            role="tablist"
            aria-label="Profile sections"
          >
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "pointer-events-auto flex flex-1 items-center justify-center px-2 text-sm font-semibold outline-none transition-colors md:text-base",
                    selected ? "text-foreground" : "text-muted-foreground hover:text-foreground/90",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-none flex-col gap-3",
        className,
      )}
    >
      {variant === "glow" ? (
        <MenuBar
          items={glowMenuItems}
          activeId={activeTab}
          onItemClick={setActiveTab}
          className="w-full"
        />
      ) : (
        <div
          className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1 backdrop-blur-sm dark:bg-muted/30"
          role="tablist"
          aria-label="Profile sections"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative rounded-lg px-4 py-2.5 text-base font-medium outline-none transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  selected && "text-foreground",
                )}
              >
                {selected && (
                  <motion.div
                    layoutId={`${layoutGroupId}-active-pill`}
                    className="absolute inset-0 rounded-lg bg-background shadow-sm ring-1 ring-border"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div
        className="min-h-[12rem] rounded-xl border border-border bg-card text-card-foreground shadow-sm"
        role="tabpanel"
        id={`panel-${active?.id}`}
        aria-labelledby={
          variant === "glow" ? `glow-tab-${active?.id}` : `tab-${active?.id}`
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id}
            initial={{ opacity: 0, scale: 0.98, x: -6, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, x: 6, filter: "blur(6px)" }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="p-5 sm:p-6"
          >
            {active?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
