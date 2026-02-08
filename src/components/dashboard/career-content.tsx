"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeUploadForm } from "@/components/dashboard/resume-upload-form";

const careerRecommendations = [
  {
    matchScore: 94,
    title: "AI Solutions Architect",
    company: "Tech Forward Inc.",
    marketGrowth: 28,
    reasoning:
      "Your strong foundation in machine learning, combined with your communication skills and project leadership experience, positions you perfectly for this emerging role. The AI industry is experiencing explosive growth, and architects who can bridge technical implementation with business strategy are in high demand.",
    matchingSkills: ["Machine Learning", "System Design", "Python", "Leadership"],
    salary: "$180k - $250k",
  },
  {
    matchScore: 87,
    title: "Senior Data Scientist",
    company: "Analytics Corp",
    marketGrowth: 22,
    reasoning:
      "Your analytical mindset and experience with statistical modeling align well with this position. The company values candidates who can translate complex data insights into actionable business recommendations, which matches your documented interest in strategic problem-solving.",
    matchingSkills: ["Data Analysis", "Python", "Statistics", "Visualization"],
    salary: "$150k - $200k",
  },
  {
    matchScore: 79,
    title: "Product Manager - AI",
    company: "Innovation Labs",
    marketGrowth: 18,
    reasoning:
      "Your unique blend of technical knowledge and user empathy makes you an excellent candidate for AI product management. This role requires someone who can understand both the technical possibilities and user needs, bridging the gap between engineering teams and stakeholders.",
    matchingSkills: ["Product Strategy", "Agile", "Technical Writing", "UX"],
    salary: "$140k - $190k",
  },
];

export function CareerContent({ user, assessment }: { user: any, assessment?: any }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div
        className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Career Recommender
          </h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered career matches based on your skills, interests, and goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Upload / Assessment Details */}
        <div
          className={`transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm h-fit sticky top-24">
            {!assessment || isEditing ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Profile Your Future
                    </h2>
                  </div>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Upload your resume to get a personalized career assessment and role recommendations.
                  </p>
                  <ResumeUploadForm userId={user.id} onSuccess={() => setIsEditing(false)} />
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Assessment Results
                  </h2>
                  <Badge variant="outline" className="text-primary border-primary">
                    {assessment.target_role}
                  </Badge>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Readiness Score</span>
                    <span className="text-3xl font-bold text-primary">{assessment.score}%</span>
                  </div>
                  <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${assessment.score}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Key Strengths
                    </h3>
                    <div className="grid gap-2">
                      {assessment.feedback?.strengths?.map((str: string, i: number) => (
                        <div key={i} className="text-sm text-muted-foreground bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                          {str}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Areas for Improvement
                    </h3>
                    <div className="grid gap-2">
                      {assessment.feedback?.improvements?.map((imp: string, i: number) => (
                        <div key={i} className="text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                          {imp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                  Update Resume / Target Role
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Results */}
        <div
          className={`space-y-4 transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          {assessment ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Recommended Paths
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0"
                >
                  {careerRecommendations.length} matches found
                </Badge>
              </div>

              {careerRecommendations.map((career, index) => (
                <div
                  key={index}
                  className={`bg-card border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${hoveredCard === index
                    ? "shadow-lg border-primary/30 scale-[1.01]"
                    : "shadow-sm hover:shadow-md"
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Header with Match Score */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {career.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {career.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {career.matchScore}%
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Match Score
                      </div>
                    </div>
                  </div>

                  {/* Market Growth Indicator */}
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {career.marketGrowth}% market growth
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      this year
                    </span>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {career.reasoning}
                    </p>
                  </div>

                  {/* Matching Skills Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {career.matchingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Salary Range
                      </span>
                      <p className="font-semibold text-foreground">
                        {career.salary}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary bg-transparent"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Explore Path
                    </Button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Discover Your Path?
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Upload your resume to unlock personalized career recommendations and insights tailored to your profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
