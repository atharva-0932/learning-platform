"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, Sparkles, Radio } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ResumeBuilder } from "@/components/dashboard/resume-builder";

export default function ResumePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*, user_skills(proficiency, skills(name))")
          .eq("user_id", user.id)
          .single();
        if (profileData) {
          const flattenedSkills = profileData.user_skills?.map((s: any) => s.skills?.name) || [];
          setProfile({ ...profileData, skills: flattenedSkills });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Please log in to build your resume</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Vibrant studio header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-[#0a0a0f] via-primary/10 to-[#0a0a0f] px-6 py-4 backdrop-blur-md">
        {/* Subtle glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 100% at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          {/* Icon box with amber glow */}
          <div className="glow-amber flex h-9 w-9 items-center justify-center rounded-xl bg-[#f59e0b]/15">
            <FileText className="h-5 w-5 text-[#f59e0b]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-foreground">
              Resume Studio
            </h1>
            <p className="text-[10px] text-muted-foreground">Build · Customise · Export</p>
          </div>
        </div>

        {/* Centre: live indicator */}
        <div className="relative flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Live preview synced</span>
        </div>

        {/* Right: AI badge */}
        <div className="relative flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse text-[#f59e0b]" />
          <span className="hidden text-xs sm:inline">AI-Powered</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResumeBuilder user={user} initialProfile={profile} />
      </main>
    </div>
  );
}
