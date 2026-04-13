"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Brain,
  Layers,
  Rocket,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateTargetRoleForm } from "@/components/dashboard/update-target-role-form";
import { Badge } from "@/components/ui/badge";
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

function gapColor(score: number) {
  if (score >= 7) return "bg-red-500";
  if (score >= 4) return "bg-amber-500";
  return "bg-emerald-500";
}

function pivotRingColor(match: number) {
  if (match >= 75) return { ring: "stroke-emerald-500", text: "text-emerald-400" };
  if (match >= 50) return { ring: "stroke-amber-500", text: "text-amber-400" };
  return { ring: "stroke-red-500", text: "text-red-400" };
}

function MatchRing({ match }: { match: number }) {
  const { ring, text } = pivotRingColor(match);
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const dash = (match / 100) * circumference;
  return (
    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={r} stroke="currentColor" strokeWidth="3" className="text-border" fill="none" />
        <circle cx="28" cy="28" r={r} className={ring} strokeWidth="3" fill="none"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
      </svg>
      <span className={`relative text-xs font-bold ${text}`}>{match}%</span>
    </div>
  );
}

export function CareerContent({ user, assessment, profile }: CareerContentProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const feedback = assessment?.feedback || {};
  const score = assessment?.score || 0;
  const verdict = feedback.verdict || "";
  const keywords = feedback.keywords || { present: [], missing: [] };
  const skillGaps = feedback.skill_gaps || [];
  const pivotCareers = feedback.pivot_careers || { alternatives: [], trending: [] };
  const targetRole = assessment?.target_role || profile?.goals?.target_role;

  return (
    <div className={`w-full max-w-none transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Hero strip */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-primary/15 via-background to-violet-500/10 px-6 py-8 lg:px-10">
        <div className="pointer-events-none absolute -top-16 left-0 h-48 w-96 opacity-25"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, transparent 70%)" }} aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-10"
          style={{ background: "linear-gradient(to left, rgba(139,92,246,0.3), transparent)" }} aria-hidden />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Career Roadmap</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              {targetRole ? (
                <>
                  Roadmap to{" "}
                  <span className="gradient-text">{targetRole}</span>
                </>
              ) : (
                "Your Career Roadmap"
              )}
            </h1>
            {score > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-sm font-bold text-foreground">{score}%</span>
                  <span className="text-xs text-muted-foreground">ATS score</span>
                </div>
                {verdict && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="mr-1 h-3 w-3 text-primary" />
                    {assessment?.target_role} Fit
                  </Badge>
                )}
              </div>
            )}
          </div>

          {(targetRole || assessment) && !isEditing && (
            <div className="flex items-center gap-2">
              {targetRole && (
                <UpdateTargetRoleForm userId={user.id} currentRole={targetRole} onSuccess={() => router.refresh()} />
              )}
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Update Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-10 px-4 py-6 lg:px-8 lg:py-8">
        {(!targetRole && !assessment) || isEditing ? (
          <div className="mx-auto max-w-xl">
            <ResumeUploadForm userId={user.id} onSuccess={() => setIsEditing(false)} />
          </div>
        ) : (
          <>
            {/* Roadmap */}
            {targetRole && (
              <section className="w-full min-h-[calc(100dvh-12rem)]">
                <RoadmapShView userId={user.id} targetRole={targetRole} />
              </section>
            )}

            {/* Assessment section */}
            {assessment && (
              <section className="space-y-8 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Resume Assessment</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Score + Keywords card */}
                    <Card className="overflow-hidden border border-border/60 bg-gradient-to-br from-card to-primary/5 shadow-sm">
                      <CardContent className="p-0">
                        <div className="grid sm:grid-cols-5">
                          <div className="sm:col-span-2 flex flex-col items-center justify-center bg-primary/5 p-6">
                            <MatchScoreGauge score={score} size={180} strokeWidth={14} />
                            <p className="mt-2 text-xs text-muted-foreground">Resume match</p>
                          </div>
                          <div className="sm:col-span-3 space-y-4 p-6">
                            <div>
                              <div className="mb-1.5 flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">AI Verdict</Badge>
                              </div>
                              <h3 className="mb-1 text-base font-bold text-foreground">{assessment.target_role} Fit</h3>
                              <p className="text-sm leading-relaxed text-muted-foreground">{verdict}</p>
                            </div>
                            <div className="border-t border-border/50 pt-4">
                              <ATSKeywordCloud present={keywords.present} missing={keywords.missing} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skill Gap card */}
                    <Card className="border border-border/60">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Brain className="h-4 w-4 text-primary" />
                          </div>
                          Skill Gap Analysis
                        </CardTitle>
                        <CardDescription className="text-sm">Areas to focus on for this role</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-5">
                          {skillGaps.map((gap: any, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -12 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: i * 0.08 }}
                              className="space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground">{gap.skill}</span>
                                  {gap.impact === "High Impact" && (
                                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">High</span>
                                  )}
                                  {gap.impact === "Medium Impact" && (
                                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">Medium</span>
                                  )}
                                </div>
                                <span className="flex-shrink-0 text-xs text-muted-foreground">
                                  {gap.gap_score}/10
                                </span>
                              </div>
                              {/* Animated progress bar */}
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                  className={`h-full rounded-full ${gapColor(gap.gap_score)}`}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${gap.gap_score * 10}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                                />
                              </div>
                            </motion.div>
                          ))}
                          {skillGaps.length === 0 && (
                            <div className="flex flex-col items-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-8">
                              <CheckCircle className="mb-2 h-8 w-8 text-emerald-500" />
                              <p className="text-sm font-semibold text-emerald-400">No significant skill gaps</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar: Pivot options */}
                  <aside className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">Pivot Options</h3>
                    </div>
                    <div className="space-y-3">
                      {pivotCareers.alternatives?.map((path: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: i * 0.07 }}
                        >
                          <Card className="border border-border/60 transition-all hover:border-primary/40">
                            <CardContent className="flex items-center gap-3 p-4">
                              <MatchRing match={path.match} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">{path.role}</p>
                                <p className="text-xs text-muted-foreground">Alternative path</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      {pivotCareers.trending?.map((trend: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: (pivotCareers.alternatives?.length ?? 0) * 0.07 + i * 0.07 }}
                        >
                          <Card className="border border-border/40 bg-muted/10">
                            <CardContent className="flex gap-3 p-4">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Rocket className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{trend.role}</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{trend.description}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </aside>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
