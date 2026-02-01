"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Star,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const industries = [
  "Technology & Software",
  "Finance & Banking",
  "Healthcare & Medical",
  "Marketing & Advertising",
  "Education & Training",
  "Manufacturing & Engineering",
  "Consulting & Strategy",
  "Creative & Design",
];

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

export default function CareerPage() {
  const [mounted, setMounted] = useState(false);
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [industry, setIndustry] = useState("");
  const [showResults, setShowResults] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = () => {
    setShowResults(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div
        className={`transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Input Form */}
        <div
          className={`transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Profile Your Future
              </h2>
            </div>

            <div className="space-y-6">
              {/* Core Skills Input */}
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-foreground font-medium">
                  Core Skills
                </Label>
                <Input
                  id="skills"
                  placeholder="e.g., Python, Machine Learning, Project Management"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="bg-background border-border focus:border-primary focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple skills with commas
                </p>
              </div>

              {/* Hidden Interests Textarea */}
              <div className="space-y-2">
                <Label
                  htmlFor="interests"
                  className="text-foreground font-medium"
                >
                  Hidden Interests
                </Label>
                <Textarea
                  id="interests"
                  placeholder="Tell us about your passions, hobbies, and what excites you outside of work. These often reveal unexpected career paths..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={4}
                  className="bg-background border-border focus:border-primary focus:ring-primary/20 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your interests can unlock unique career opportunities
                </p>
              </div>

              {/* Target Industry Dropdown */}
              <div className="space-y-2">
                <Label
                  htmlFor="industry"
                  className="text-foreground font-medium"
                >
                  Target Industry
                </Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary/20">
                    <SelectValue placeholder="Select your target industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {industries.map((ind) => (
                      <SelectItem
                        key={ind}
                        value={ind}
                        className="cursor-pointer hover:bg-muted"
                      >
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Recommendations
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Our AI analyzes millions of career paths to find your perfect
                match
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Results */}
        <div
          className={`space-y-4 transition-all duration-500 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {showResults && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-foreground">
                  AI Recommendations
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
                  className={`bg-card border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                    hoveredCard === index
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
          )}

          {!showResults && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Discover Your Path?
              </h3>
              <p className="text-muted-foreground">
                Fill in your profile details and let our AI find your perfect
                career matches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
