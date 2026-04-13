"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, FileText, Mic, Sparkles, TrendingUp } from "lucide-react";
import { ResumeUploadForm } from "@/components/dashboard/resume-upload-form";
import { ProfileDataView } from "@/components/dashboard/profile-data-view";
import { SmartFollowUp } from "@/components/dashboard/smart-follow-up";

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  return greeting;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

const quickActions = [
  {
    href: "/dashboard/resume",
    icon: FileText,
    label: "Resume Studio",
    description: "Upload or update your resume to refresh your profile",
    accent: "violet",
    border: "border-l-violet-500",
    bg: "from-violet-500/8 to-transparent",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    arrowColor: "group-hover:text-violet-400",
  },
  {
    href: "/dashboard/career",
    icon: Briefcase,
    label: "View Roadmap",
    description: "See your personalised week-by-week career roadmap",
    accent: "sky",
    border: "border-l-sky-500",
    bg: "from-sky-500/8 to-transparent",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
    arrowColor: "group-hover:text-sky-400",
  },
  {
    href: "/dashboard/job-ready",
    icon: Mic,
    label: "Practice Interview",
    description: "Start a voice mock interview with your AI coach",
    accent: "amber",
    border: "border-l-[#f59e0b]",
    bg: "from-[#f59e0b]/8 to-transparent",
    iconBg: "bg-[#f59e0b]/15",
    iconColor: "text-[#f59e0b]",
    arrowColor: "group-hover:text-[#f59e0b]",
  },
];

interface StatsStripProps {
  skillCount: number;
  atsScore: number;
}

function StatsStrip({ skillCount, atsScore }: StatsStripProps) {
  const animSkills = useCountUp(skillCount, 1000);
  const animScore = useCountUp(atsScore, 1400);

  const stats = [
    { label: "Skills extracted", value: animSkills, suffix: "", icon: Sparkles, color: "text-violet-400" },
    { label: "ATS match score", value: animScore, suffix: "%", icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8 flex flex-wrap gap-3"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card px-4 py-2 text-sm"
        >
          <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
          <span className="font-bold text-foreground">
            {s.value}{s.suffix}
          </span>
          <span className="text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

export function DashboardContent({ user, profileData }: { user: any; profileData?: any }) {
  const [mounted, setMounted] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(!profileData);
  const greeting = useGreeting();
  const userName = user?.email?.split("@")[0] || "User";

  const skillCount = profileData?.skills?.length ?? 0;
  const atsScore = 0; // would come from assessment if present

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Ambient hero header */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-primary/10 via-background to-[#f59e0b]/8 px-6 py-8 lg:px-10 lg:py-10">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -top-16 left-0 h-48 w-96 opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-16 right-0 h-48 w-80 opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.35) 0%, transparent 70%)" }}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
            {greeting},{" "}
            <span className="gradient-text capitalize">{userName}</span>
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            {profileData && !showUploadForm
              ? "Here's your career command centre"
              : "Let's start by uploading your resume"}
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        {/* Animated stats strip — only for users with profile data */}
        {profileData && !showUploadForm && skillCount > 0 && (
          <StatsStrip skillCount={skillCount} atsScore={atsScore} />
        )}

        {/* Quick Actions — only for returning users */}
        {profileData && !showUploadForm && (
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={action.href}
                  className={`group flex items-center gap-4 rounded-xl border-l-4 ${action.border} border border-border/60 bg-gradient-to-r ${action.bg} p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/[0.06]`}
                >
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${action.iconBg}`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-1 ${action.arrowColor}`} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="w-full space-y-10">
          {!showUploadForm && profileData ? (
            <ProfileDataView
              profileData={profileData}
              onUploadAnother={() => setShowUploadForm(true)}
            />
          ) : (
            <div className="mx-auto max-w-2xl">
              <ResumeUploadForm
                userId={user.id}
                onSuccess={() => setShowUploadForm(false)}
              />
            </div>
          )}

          <SmartFollowUp userId={user.id} />
        </div>
      </div>
    </div>
  );
}
