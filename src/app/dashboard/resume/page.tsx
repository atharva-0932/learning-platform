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
    <div className="p-6 lg:p-8 space-y-8 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              Resume Studio
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Polish your professional narrative with our dual-pane AI-powered resume builder.
          </p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="builder" className="rounded-lg px-6 font-semibold">
            <Sparkles className="w-4 h-4 mr-2" /> Resume Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-0 h-[calc(100vh-280px)]">
          <ResumeBuilder user={user} initialProfile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
