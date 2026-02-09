"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle,
  ArrowRight,
  Search,
  Brain,
  Layers,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResumeUploadForm } from "@/components/dashboard/resume-upload-form";
import { MatchScoreGauge } from "@/components/dashboard/match-score-gauge";
import { ATSKeywordCloud } from "@/components/dashboard/ats-keyword-cloud";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCareerAssessment } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CareerContentProps {
  user: any;
  assessment?: any;
  profile?: any;
}

export function CareerContent({ user, assessment, profile }: CareerContentProps) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTriggerAssessment = async () => {
    const resumeToUse = profile?.resume_text || (profile?.bio && profile?.skills?.length > 0
      ? `Bio: ${profile.bio}\n\nSkills: ${profile.skills.join(", ")}`
      : null);

    if (!resumeToUse || !profile?.goals?.target_role) {
      setIsEditing(true);
      return;
    }

    setIsAssessing(true);
    try {
      await getCareerAssessment(user.id, profile.goals.target_role, resumeToUse);
      toast.success("Assessment Generated", {
        description: "Your personalized career insights are ready."
      });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const isRateLimit = error.message?.includes("rate limit") || error.message?.includes("429");

      toast.error(isRateLimit ? "Quota Reached" : "Assessment Failed", {
        description: isRateLimit
          ? "Gemini API is currently rate-limited. Please wait about 30 seconds and try again."
          : "Could not generate insights at this time."
      });
    } finally {
      setIsAssessing(false);
    }
  };

  // Useassessment feedback directly if available
  const feedback = assessment?.feedback || {};
  const score = assessment?.score || 0;
  const verdict = feedback.verdict || "";
  const keywords = feedback.keywords || { present: [], missing: [] };
  const skillGaps = feedback.skill_gaps || [];
  const pivotCareers = feedback.pivot_careers || { alternatives: [], trending: [] };

  return (
    <div className="p-6 lg:p-8 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div
        className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                Career Recommender
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Precision career mapping powered by AI to bridge the gap between where you are and where you want to be.
            </p>
          </div>
          {assessment && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-xl px-6">
              Update Profile
            </Button>
          )}
        </div>
      </div>

      {!assessment || isEditing ? (
        <div className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          {(profile?.resume_text || (profile?.bio && profile?.skills?.length > 0)) && !isEditing ? (
            <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Rocket className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold italic">"Ready to bridge the gap?"</h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  We have your profile details and target role on file. Would you like to generate your career assessment for <span className="text-primary font-bold">{profile.goals?.target_role || "your target role"}</span> now?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  onClick={handleTriggerAssessment}
                  disabled={isAssessing}
                  size="lg"
                  className="rounded-xl px-8 h-14 text-lg font-bold shadow-xl shadow-primary/20 gap-2"
                >
                  {isAssessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Your Profile...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Generate AI Assessment
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl h-14 px-6"
                >
                  Upload New Resume
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <ResumeUploadForm userId={user.id} onSuccess={() => setIsEditing(false)} />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Main Content Area (2/3) */}
          <div className="xl:col-span-2 space-y-8">

            {/* 1. The "Fit" Score & Summary */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-card to-muted/30 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-5 items-center">
                  <div className="md:col-span-2 p-8 flex flex-col items-center justify-center bg-primary/5 border-r border-border/50">
                    <MatchScoreGauge score={score} size={220} strokeWidth={18} />
                  </div>
                  <div className="md:col-span-3 p-8 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary border-none text-xs font-bold uppercase tracking-wider">
                          The AI Verdict
                        </Badge>
                      </div>
                      <h2 className="text-2xl font-bold mb-3">"{assessment.target_role}" Fit Analysis</h2>
                      <p className="text-muted-foreground leading-relaxed text-lg italic">
                        "{verdict}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Search className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-sm">ATS Keyword Matcher</h3>
                      </div>
                      <ATSKeywordCloud present={keywords.present} missing={keywords.missing} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Skill Gap Visualization */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <CardTitle>Skill Gap Analysis</CardTitle>
                </div>
                <CardDescription>Specific areas where upskilling will yield the highest return for this role.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {skillGaps.map((gap: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{gap.skill}</span>
                          {gap.impact === "High Impact" && (
                            <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] px-1.5 py-0">
                              High Impact
                            </Badge>
                          )}
                          {gap.impact === "Medium Impact" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">
                              Medium Impact
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          Gap: {gap.gap_score}/10
                        </span>
                      </div>
                      <Progress value={gap.gap_score * 10} className="h-1.5 bg-muted" />
                    </div>
                  ))}
                  {skillGaps.length === 0 && (
                    <div className="text-center py-8 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-emerald-700">Perfect alignment! No significant skill gaps found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* 3. Recommended "Pivot" Careers */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-xl">Pivot Options</h3>
              </div>

              {/* Alternative Paths */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Alternative Paths</h4>
                {pivotCareers.alternatives?.map((path: any, i: number) => (
                  <Card key={i} className="group hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-bold group-hover:text-primary transition-colors">{path.role}</p>
                          <p className="text-xs text-muted-foreground">Strategic stepping stone</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-primary/80">{path.match}%</span>
                          <span className="text-[10px] text-muted-foreground">Match</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Trending Roles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Trending Near You</h4>
                {pivotCareers.trending?.map((trend: any, i: number) => (
                  <Card key={i} className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Rocket className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{trend.role}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {trend.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action */}
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 gap-2 shadow-lg shadow-primary/20">
                Generate Learning Roadmap
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
