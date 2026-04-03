"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  ChevronsUpDown,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  Mic,
  Settings,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";
import { logout } from "@/app/auth/actions";

const sidebarVariants = {
  open: { width: "16.5rem" },
  closed: { width: "3.25rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

function navActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function displayName(user: User | null) {
  if (!user) return "Guest";
  const meta = user.user_metadata as { full_name?: string } | undefined;
  if (meta?.full_name?.trim()) return meta.full_name.trim();
  return user.email?.split("@")[0] ?? "Account";
}

function initials(user: User | null) {
  if (!user) return "?";
  const meta = user.user_metadata as { full_name?: string } | undefined;
  const name = meta?.full_name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const email = user.email ?? "";
  return email.slice(0, 2).toUpperCase();
}

const mainNav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/career",
    label: "Career",
    icon: Briefcase,
  },
  {
    href: "/dashboard/resume",
    label: "Resume",
    icon: FileText,
  },
  {
    href: "/dashboard/interview",
    label: "Mock Interview",
    icon: Mic,
    badge: "BETA" as const,
  },
] as const;

export function SessionNavBar({ user }: { user: User | null }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const name = useMemo(() => displayName(user), [user]);
  const ini = useMemo(() => initials(user), [user]);

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-border bg-background",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex h-full shrink-0 flex-col bg-background text-muted-foreground transition-all"
        variants={contentVariants}
      >
        <motion.div variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex min-h-[60px] w-full shrink-0 border-b border-border px-2 py-2.5">
              <div className="flex w-full items-center">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto min-h-10 w-full justify-start gap-2.5 px-2 py-1.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="size-4" />
                      </div>
                      <motion.span
                        variants={variants}
                        className="flex min-w-0 flex-1 items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <span className="text-base font-semibold leading-tight tracking-tight text-foreground">
                              SkillsSphere
                            </span>
                            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground/60" />
                          </>
                        )}
                      </motion.span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[13rem]">
                    <DropdownMenuItem asChild className="gap-2.5 py-2.5 text-base">
                      <Link href="/">
                        <House className="size-4 shrink-0" />
                        Marketing site
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="gap-2.5 py-2.5 text-base">
                      <Link href="/dashboard">
                        <LayoutDashboard className="size-4 shrink-0" />
                        Dashboard home
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow px-2 py-3">
                  <div className="flex w-full flex-col gap-1.5">
                    {mainNav.map((item) => {
                      const Icon = item.icon;
                      const active = navActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex min-h-10 w-full flex-row items-center rounded-lg px-2.5 py-2 text-[15px] leading-snug transition-colors hover:bg-muted hover:text-primary",
                            active &&
                              "bg-muted font-medium text-primary shadow-sm ring-1 ring-border/60",
                          )}
                        >
                          <Icon className="size-5 shrink-0" aria-hidden />
                          <motion.span variants={variants} className="min-w-0 flex-1">
                            {!isCollapsed && (
                              <div className="ml-3 flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {item.label}
                                </span>
                                {"badge" in item && item.badge && (
                                  <Badge
                                    className="shrink-0 rounded-md border-none bg-primary/10 px-2 py-0.5 text-xs font-semibold tracking-wide text-primary dark:bg-primary/20"
                                    variant="outline"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </motion.span>
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col gap-1 border-t border-border p-2 pt-3">
                <Link
                  href="/dashboard"
                  className="mt-auto flex min-h-10 w-full flex-row items-center rounded-lg px-2.5 py-2 text-[15px] font-medium leading-snug text-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  <Settings className="size-5 shrink-0" aria-hidden />
                  <motion.span variants={variants}>
                    {!isCollapsed && (
                      <span className="ml-3">Settings</span>
                    )}
                  </motion.span>
                </Link>
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                      <div className="flex min-h-10 w-full flex-row items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted hover:text-primary">
                        <Avatar className="size-8 border border-border">
                          <AvatarFallback className="text-xs font-semibold">
                            {ini}
                          </AvatarFallback>
                        </Avatar>
                        <motion.span
                          variants={variants}
                          className="flex min-w-0 flex-1 items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <span className="truncate text-[15px] font-medium leading-snug text-foreground">
                                {name}
                              </span>
                              <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground/60" />
                            </>
                          )}
                        </motion.span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={8} align="start" className="min-w-[14rem]">
                      <div className="flex flex-row items-start gap-3 px-1 py-2">
                        <Avatar className="size-10 border border-border">
                          <AvatarFallback className="text-sm font-semibold">
                            {ini}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col gap-0.5 text-left">
                          <span className="truncate text-base font-semibold leading-tight text-foreground">
                            {name}
                          </span>
                          <span className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {user?.email ?? "Not signed in"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="gap-2.5 py-2.5 text-base">
                        <Link href="/dashboard">
                          <LayoutDashboard className="size-4 shrink-0" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <form action={logout} className="w-full">
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2.5 py-0.5 text-left text-base font-medium"
                          >
                            <LogOut className="size-4 shrink-0" />
                            Sign out
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
