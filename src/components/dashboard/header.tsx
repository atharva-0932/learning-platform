"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader({ user }: { user: { email?: string | null } | null }) {
  const userName = user?.email?.split("@")[0] ?? "User";
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search anything..."
          className="pl-10 bg-muted border-border focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground"
          title={user?.email ?? undefined}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="max-w-[140px] truncate capitalize text-foreground">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
