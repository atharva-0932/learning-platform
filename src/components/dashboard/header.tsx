"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/career": "Career Roadmap",
  "/dashboard/resume": "Resume Studio",
  "/dashboard/job-ready": "Job Ready",
};

function pageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "Dashboard";
}

function initials(email: string | null | undefined): string {
  if (!email) return "?";
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

function hashColor(str: string): string {
  const colors = [
    "bg-violet-500",
    "bg-indigo-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

export function DashboardHeader({ user }: { user: { email?: string | null } | null }) {
  const pathname = usePathname();
  const email = user?.email ?? null;
  const ini = initials(email);
  const avatarColor = hashColor(email ?? "default");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-6 backdrop-blur-md">
      {/* Left: page title */}
      <div>
        <h2 className="text-sm font-semibold text-foreground">{pageTitle(pathname)}</h2>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Avatar chip */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColor}`}
          title={email ?? undefined}
          aria-label={`Signed in as ${email}`}
        >
          {ini}
        </div>
      </div>
    </header>
  );
}
