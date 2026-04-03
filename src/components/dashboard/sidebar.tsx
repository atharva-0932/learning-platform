"use client";

import { SessionNavBar } from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";

export function DashboardSidebar({ user }: { user: User | null }) {
  return <SessionNavBar user={user} />;
}
