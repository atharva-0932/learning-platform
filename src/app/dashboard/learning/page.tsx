"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  BookOpen,
  Target,
  CheckCircle,
  ExternalLink,
  Trophy,
  Lightbulb,
  TrendingUp,
  BrainCircuit,
  Zap,
  Layout
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Milestone {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
}

interface Resource {
  title: string;
  url: string;
}

interface LearningPath {
  target_role: string;
  missing_skills: string[];
  roadmap: Milestone[];
  resources: Record<string, Resource[]>;
  capstone: {
    title: string;
    description: string;
    technologies: string[];
    learning_outcomes: string[];
  };
}

export default function LearningAcademyPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [data, setData] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLearningPath = async (userId: string) => {
    try {
      const response = await fetch(`/api/learning-path?user_id=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // Check if profile exists to offer generation
          const { data: profileData } = await supabase
            .from('profiles')
            .select('resume_text, goals')
            .eq('user_id', userId)
            .single();

          if (profileData?.resume_text && profileData?.goals?.target_role) {
            setProfile(profileData);
            setError("needs_generation");
          } else {
            setError("needs_upload");
          }
          return;
        }
        throw new Error(result.error || "Failed to fetch learning path");
      }

      setData(result);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    if (!user || !profile) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/career-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          target_role: profile.goals.target_role,
          resume_text: profile.resume_text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate assessment");
      }

      toast.success("Assessment generated! Creating your roadmap now...");
      await fetchLearningPath(user.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchLearningPath(user.id);
      } else {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const toggleMilestone = async (title: string, currentStatus: boolean) => {
    if (!user || !data) return;

    // Optimistic UI update
    const updatedRoadmap = data.roadmap.map(m =>
      m.title === title ? { ...m, completed: !currentStatus } : m
    );
    setData({ ...data, roadmap: updatedRoadmap });

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          milestone_title: title,
          completed: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      toast.success(!currentStatus ? "Milestone completed!" : "Milestone marked as incomplete");
    } catch (err) {
      // Revert on error
      setData(data);
      toast.error("Failed to sync progress with the server");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Curating your personalized learning journey...</p>
        </div>
      </div>
    );
  }

  if (error === "needs_generation") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] container max-w-2xl mx-auto px-6 text-center space-y-8">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce">
          <BrainCircuit className="w-12 h-12" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Ready to Build Your Roadmap?</h1>
          <p className="text-muted-foreground text-lg">
            We've found your profile and target role: <span className="text-primary font-semibold">{profile?.goals?.target_role}</span>.
            We just need to analyze your skill gaps to build your personalized 30-day learning path.
          </p>
        </div>
        <Button
          size="lg"
          className="h-12 px-8 text-base font-semibold"
          onClick={generateRoadmap}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Skill Gaps...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5 fill-current" />
              Generate My Learning Roadmap
            </>
          )}
        </Button>
      </div>
    );
  }

  if (error === "needs_upload" || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] container max-w-2xl mx-auto px-6 text-center space-y-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <Layout className="w-12 h-12" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Start Your Learning Journey</h1>
          <p className="text-muted-foreground text-lg">
            To create a custom learning roadmap, you first need to upload your resume and specify a target role on the dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8"
            onClick={() => window.location.href = "/dashboard"}
          >
            Go to Dashboard
          </Button>
          <Button
            size="lg"
            className="h-12 px-8"
            onClick={() => window.location.href = "/dashboard/resume"}
          >
            Upload Resume
          </Button>
        </div>
      </div>
    );
  }

  if (error && error !== "needs_generation" && error !== "needs_upload") {
    return (
      <div className="p-10 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <Target className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const completedCount = data.roadmap.filter(m => m.completed).length;
  const progressPercent = (completedCount / data.roadmap.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Learning Academy</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
              <div className="flex items-center gap-3">
                <Progress value={progressPercent} className="w-32 h-2" />
                <span className="text-xs font-bold text-primary">{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container p-6 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roadmap */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">30-Day {data.target_role} Roadmap</h2>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                AI Custom-Built
              </Badge>
            </div>

            <div className="space-y-4 relative">
              {/* Vertical line connecting milestones */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border z-0" />

              {data.roadmap.map((milestone, idx) => (
                <Card
                  key={idx}
                  className={`relative z-10 border-l-4 ${milestone.completed ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-primary'
                    } hover:shadow-md transition-all`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${milestone.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-background border-primary text-primary'
                        }`}>
                        {milestone.completed ? <CheckCircle className="w-5 h-5" /> : <span>{idx + 1}</span>}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base">{milestone.title}</h3>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight px-1.5 h- 5">
                            {milestone.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                        <div className="pt-2 flex items-center gap-2">
                          <Checkbox
                            id={`milestone-${idx}`}
                            checked={milestone.completed}
                            onCheckedChange={() => toggleMilestone(milestone.title, milestone.completed)}
                          />
                          <label
                            htmlFor={`milestone-${idx}`}
                            className="text-xs font-medium cursor-pointer select-none"
                          >
                            Mark as completed
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Capstone Project */}
          {data.capstone && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary">
                  <Trophy className="w-5 h-5" />
                  <CardTitle className="text-lg">Capstone Mastery Project</CardTitle>
                </div>
                <CardDescription>Synthesize your new skills into a portfolio-ready piece.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-base">{data.capstone.title}</h3>
                  <p className="text-sm leading-relaxed">{data.capstone.description}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {data.capstone.technologies.map((tech, i) => (
                      <Badge key={i} variant="outline" className="bg-background">{tech}</Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase text-primary tracking-wider">Learning Outcomes</span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                      {data.capstone.learning_outcomes.map((outcome, i) => (
                        <li key={i} className="text-xs flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Skills & Resources */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Skill Gaps</CardTitle>
              </div>
              <CardDescription className="text-xs text-balance">The following skills were identified as missing for a {data.target_role} role.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.missing_skills.map((skill, i) => (
                  <Badge key={i} className="px-3 py-1">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-base">Curated Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {data.missing_skills.map((skill) => (
                  <div key={skill} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{skill}</span>
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      {data.resources[skill]?.map((res, j) => (
                        <a
                          key={j}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 group border border-transparent hover:border-border transition-all"
                        >
                          <span className="text-xs font-medium group-hover:text-primary transition-colors">{res.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-primary text-white border-none shadow-lg">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold">Next Career Milestone</h3>
                <p className="text-xs opacity-90 leading-relaxed">Complete your first 3 milestones to unlock a personalized interview prep session.</p>
              </div>
              <Button size="sm" variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
