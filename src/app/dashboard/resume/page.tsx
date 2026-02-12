"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ResumeBuilder } from "@/components/dashboard/resume-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

        // Fetch profile with experience, education, skills
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, user_skills(proficiency, skills(name))')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          // Flatten skills
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
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Mini Studio Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Resume Studio</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground italic">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          AI-Powered Professional Design
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 overflow-hidden">
        <ResumeBuilder user={user} initialProfile={profile} />
      </main>
    </div>
  );
}
