"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Mic2, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Career Recommender", href: "/career", icon: Briefcase },
  { name: "Resume Builder", href: "/resume", icon: FileText },
  { name: "Learning Academy", href: "/academy", icon: GraduationCap },
  { name: "Mock Interview", href: "/interview", icon: Mic2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-20 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            SKILLSPHERE
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "group-hover:text-white"
              )} />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-border">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all mt-1">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
