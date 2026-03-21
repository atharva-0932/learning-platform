"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle,
  Search,
  Brain,
  Layers,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateTargetRoleForm } from "@/components/dashboard/update-target-role-form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResumeUploadForm } from "@/components/dashboard/resume-upload-form";
import { MatchScoreGauge } from "@/components/dashboard/match-score-gauge";
import { ATSKeywordCloud } from "@/components/dashboard/ats-keyword-cloud";
import { RoadmapShView } from "@/components/dashboard/roadmap-sh-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CareerContentProps {
  user: any;
  assessment?: any;
  profile?: any;
}

export function CareerContent({ user, assessment, profile }: CareerContentProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use assessment feedback directly if available
  const feedback = assessment?.feedback || {};
  const score = assessment?.score || 0;
  const verdict = feedback.verdict || "";
  const keywords = feedback.keywords || { present: [], missing: [] };
  const skillGaps = feedback.skill_gaps || [];
  const pivotCareers = feedback.pivot_careers || { alternatives: [], trending: [] };

  const targetRole = assessment?.target_role || profile?.goals?.target_role;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 w-full max-w-[1600px] mx-auto space-y-10">
      {/* Header */}
      <header
        className={`transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
              Career Recommender
            </h1>
            <p className="text-muted-foreground text-sm">
              Step-by-step roadmap for your target role
            </p>
          </div>
          {(targetRole || assessment) && !isEditing && (
            <div className="flex items-center gap-2">
              {targetRole && (
                <UpdateTargetRoleForm
                  userId={user.id}
                  currentRole={targetRole}
                  onSuccess={() => router.refresh()}
                />
              )}
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Update Profile
              </Button>
            </div>
          )}
        </div>
      </header>

      {(!targetRole && !assessment) || isEditing ? (
        <div className={`transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <div className="max-w-xl mx-auto">
            <ResumeUploadForm userId={user.id} onSuccess={() => setIsEditing(false)} />
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Roadmap - primary focus */}
          {targetRole && (
            <section className="w-full min-h-[calc(100vh-14rem)]">
              <RoadmapShView userId={user.id} targetRole={targetRole} />
            </section>
          )}

          {/* Assessment section - only when assessment exists */}
          {assessment && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t">
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border shadow-sm">
                  <CardContent className="p-0">
                    <div className="grid sm:grid-cols-5">
                      <div className="sm:col-span-2 p-6 flex flex-col items-center justify-center bg-muted/30">
                        <MatchScoreGauge score={score} size={180} strokeWidth={14} />
                      </div>
                      <div className="sm:col-span-3 p-6 space-y-4">
                        <div>
                          <Badge variant="secondary" className="text-[10px] mb-2">AI Verdict</Badge>
                          <h2 className="text-lg font-semibold mb-2">{assessment.target_role} Fit</h2>
                          <p className="text-muted-foreground text-sm leading-relaxed">{verdict}</p>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <Search className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">ATS Keywords</span>
                          </div>
                          <ATSKeywordCloud present={keywords.present} missing={keywords.missing} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Skill Gap Analysis
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Areas to focus on for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillGaps.map((gap: any, i: number) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{gap.skill}</span>
                              {gap.impact === "High Impact" && (
                                <Badge variant="destructive" className="text-[10px] px-1.5">High</Badge>
                              )}
                              {gap.impact === "Medium Impact" && (
                                <Badge variant="secondary" className="text-[10px] px-1.5">Medium</Badge>
                              )}
                            </div>
                            <span className="text-muted-foreground shrink-0">Gap: {gap.gap_score}/10</span>
                          </div>
                          <Progress value={gap.gap_score * 10} className="h-1.5" />
                        </div>
                      ))}
                      {skillGaps.length === 0 && (
                        <div className="text-center py-6 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm text-emerald-700 font-medium">No significant skill gaps</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Pivot Options
                  </h3>
                  <div className="space-y-3">
                    {pivotCareers.alternatives?.map((path: any, i: number) => (
                      <Card key={i} className="hover:border-primary/40 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-medium text-sm">{path.role}</p>
                              <p className="text-xs text-muted-foreground">Alternative path</p>
                            </div>
                            <span className="text-lg font-bold text-primary">{path.match}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {pivotCareers.trending?.map((trend: any, i: number) => (
                      <Card key={i} className="bg-muted/5 border-muted">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Rocket className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{trend.role}</p>
                              <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </aside>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
