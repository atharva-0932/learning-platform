"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlowMenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
  /** Tailwind classes applied on hover when inactive, e.g. `group-hover:text-primary` */
  iconHoverClass?: string;
}

export interface MenuBarProps {
  items: GlowMenuItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  className?: string;
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
      scale: { duration: 0.5, type: "spring" as const, stiffness: 300, damping: 25 },
    },
  },
};

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const sharedTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

export const MenuBar = React.forwardRef<HTMLElement, MenuBarProps>(
  ({ className, items, activeId, onItemClick }, ref) => {
    const { resolvedTheme } = useTheme();
    const isDarkTheme = resolvedTheme === "dark";

    return (
      <motion.nav
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-b from-background/90 to-background/50 p-2 shadow-lg shadow-primary/5 backdrop-blur-lg dark:border-primary/25 dark:shadow-primary/10",
          className,
        )}
        initial="initial"
        whileHover="hover"
      >
        <motion.div
          className="pointer-events-none absolute -inset-2 z-0 rounded-3xl"
          style={{
            background: isDarkTheme
              ? "radial-gradient(ellipse 85% 65% at 50% 38%, rgba(139,92,246,0.32) 0%, rgba(167,139,250,0.14) 42%, rgba(88,28,135,0.12) 72%, transparent 100%)"
              : "radial-gradient(ellipse 85% 65% at 50% 38%, rgba(139,92,246,0.2) 0%, rgba(167,139,250,0.14) 48%, rgba(139,92,246,0.06) 78%, transparent 100%)",
          }}
          variants={navGlowVariants}
        />
        <ul
          className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:justify-start"
          role="tablist"
          aria-label="Section navigation"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <motion.li key={item.id} className="relative">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`glow-tab-${item.id}`}
                  onClick={() => onItemClick?.(item.id)}
                  className="block w-full"
                >
                  <motion.div
                    className="group relative block overflow-visible rounded-xl"
                    style={{ perspective: "600px" }}
                    whileHover="hover"
                    initial="initial"
                  >
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-0"
                      variants={glowVariants}
                      animate={isActive ? "hover" : "initial"}
                      style={{
                        background: item.gradient,
                        opacity: isActive ? 1 : 0,
                        borderRadius: "16px",
                      }}
                    />
                    <motion.div
                      className={cn(
                        "relative z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "center bottom",
                      }}
                    >
                      <span
                        className={cn(
                          "transition-colors duration-300",
                          isActive
                            ? item.iconColor
                            : cn(
                                "text-muted-foreground",
                                item.iconHoverClass ?? "group-hover:text-primary",
                              ),
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                    <motion.div
                      className={cn(
                        "absolute inset-0 z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "center top",
                      }}
                    >
                      <span
                        className={cn(
                          "transition-colors duration-300",
                          isActive
                            ? item.iconColor
                            : cn(
                                "text-muted-foreground",
                                item.iconHoverClass ?? "group-hover:text-primary",
                              ),
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>
    );
  },
);

MenuBar.displayName = "MenuBar";
