"use client";

import { useEffect, useState, useRef } from "react";
import {
  GraduationCap,
  Play,
  Clock,
  Target,
  ChevronDown,
  ExternalLink,
  Star,
  Zap,
  CheckCircle2,
  Circle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Course {
  title: string;
  platform: "Coursera" | "Udemy" | "YouTube";
  price: string;
  duration: string;
  rating: number;
  url: string;
}

interface SkillNode {
  id: string;
  skill: string;
  category: string;
  priority: "Critical" | "Important" | "Nice to Have";
  status: "completed" | "in-progress" | "locked";
  description: string;
  courses: Course[];
}

const skillRoadmap: SkillNode[] = [
  {
    id: "1",
    skill: "Advanced TypeScript",
    category: "Programming",
    priority: "Critical",
    status: "completed",
    description:
      "Master generics, conditional types, and advanced type inference to write safer, more maintainable code.",
    courses: [
      {
        title: "TypeScript: The Complete Developer's Guide",
        platform: "Udemy",
        price: "$14.99",
        duration: "27 hours",
        rating: 4.8,
        url: "#",
      },
      {
        title: "Advanced TypeScript Masterclass",
        platform: "Coursera",
        price: "Free",
        duration: "20 hours",
        rating: 4.6,
        url: "#",
      },
      {
        title: "No BS TS by Matt Pocock",
        platform: "YouTube",
        price: "Free",
        duration: "8 hours",
        rating: 4.9,
        url: "#",
      },
    ],
  },
  {
    id: "2",
    skill: "System Design",
    category: "Architecture",
    priority: "Critical",
    status: "in-progress",
    description:
      "Learn to design scalable, distributed systems. Essential for senior engineering roles and technical interviews.",
    courses: [
      {
        title: "Grokking Modern System Design",
        platform: "Coursera",
        price: "$39/month",
        duration: "40 hours",
        rating: 4.7,
        url: "#",
      },
      {
        title: "System Design Interview Course",
        platform: "Udemy",
        price: "$19.99",
        duration: "35 hours",
        rating: 4.5,
        url: "#",
      },
      {
        title: "System Design Primer",
        platform: "YouTube",
        price: "Free",
        duration: "15 hours",
        rating: 4.8,
        url: "#",
      },
    ],
  },
  {
    id: "3",
    skill: "Cloud Architecture (AWS)",
    category: "DevOps",
    priority: "Important",
    status: "locked",
    description:
      "Understand cloud infrastructure, serverless patterns, and cost optimization strategies on AWS.",
    courses: [
      {
        title: "AWS Solutions Architect Professional",
        platform: "Coursera",
        price: "$49/month",
        duration: "60 hours",
        rating: 4.8,
        url: "#",
      },
      {
        title: "Ultimate AWS Certified Solutions Architect",
        platform: "Udemy",
        price: "$16.99",
        duration: "50 hours",
        rating: 4.7,
        url: "#",
      },
      {
        title: "AWS Full Course 2024",
        platform: "YouTube",
        price: "Free",
        duration: "12 hours",
        rating: 4.4,
        url: "#",
      },
    ],
  },
  {
    id: "4",
    skill: "Machine Learning Fundamentals",
    category: "AI/ML",
    priority: "Important",
    status: "locked",
    description:
      "Build a solid foundation in ML algorithms, neural networks, and practical implementation with Python.",
    courses: [
      {
        title: "Machine Learning Specialization",
        platform: "Coursera",
        price: "$49/month",
        duration: "80 hours",
        rating: 4.9,
        url: "#",
      },
      {
        title: "Complete Machine Learning & Data Science Bootcamp",
        platform: "Udemy",
        price: "$17.99",
        duration: "44 hours",
        rating: 4.6,
        url: "#",
      },
      {
        title: "ML Course by Andrew Ng",
        platform: "YouTube",
        price: "Free",
        duration: "25 hours",
        rating: 4.9,
        url: "#",
      },
    ],
  },
  {
    id: "5",
    skill: "Technical Leadership",
    category: "Soft Skills",
    priority: "Nice to Have",
    status: "locked",
    description:
      "Develop skills to lead engineering teams, make architectural decisions, and mentor junior developers.",
    courses: [
      {
        title: "Engineering Leadership Professional Certificate",
        platform: "Coursera",
        price: "$39/month",
        duration: "30 hours",
        rating: 4.5,
        url: "#",
      },
      {
        title: "Tech Lead Mastery",
        platform: "Udemy",
        price: "$24.99",
        duration: "18 hours",
        rating: 4.4,
        url: "#",
      },
      {
        title: "Engineering Management 101",
        platform: "YouTube",
        price: "Free",
        duration: "6 hours",
        rating: 4.3,
        url: "#",
      },
    ],
  },
];

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const numStars = 80;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.y += star.speed;
        star.opacity += (Math.random() - 0.5) * 0.02;
        star.opacity = Math.max(0.1, Math.min(0.7, star.opacity));

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${star.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-60"
    />
  );
}

function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{animatedValue}%</span>
        <span className="text-xs text-muted-foreground">Ready</span>
      </div>
    </div>
  );
}

function SkillNodeCard({
  node,
  index,
  isExpanded,
  onToggle,
}: {
  node: SkillNode;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const statusIcon = {
    completed: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    "in-progress": <Zap className="w-6 h-6 text-primary animate-pulse" />,
    locked: <Circle className="w-6 h-6 text-muted-foreground" />,
  };

  const priorityColors = {
    Critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    Important: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "Nice to Have": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };

  const platformColors = {
    Coursera: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Udemy: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    YouTube: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div
      className={`relative transition-all duration-500 ${
        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
      }`}
    >
      {/* Timeline connector */}
      {index < skillRoadmap.length - 1 && (
        <div
          className={`absolute left-[19px] top-14 w-0.5 transition-all duration-500 ${
            node.status === "completed" ? "bg-emerald-500" : "bg-border"
          }`}
          style={{ height: isExpanded ? "calc(100% - 40px)" : "calc(100% - 20px)" }}
        />
      )}

      {/* Node */}
      <div className="flex gap-4">
        {/* Status indicator */}
        <div
          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            node.status === "completed"
              ? "bg-emerald-500/20"
              : node.status === "in-progress"
              ? "bg-primary/20"
              : "bg-muted"
          }`}
        >
          {statusIcon[node.status]}
        </div>

        {/* Card */}
        <div
          className={`flex-1 rounded-2xl border transition-all duration-300 overflow-hidden ${
            node.status === "locked"
              ? "bg-muted/30 border-border opacity-60"
              : "bg-card border-border hover:border-primary/30 hover:shadow-lg"
          }`}
        >
          <button
            type="button"
            onClick={onToggle}
            disabled={node.status === "locked"}
            className="w-full p-5 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={priorityColors[node.priority]}>
                    {node.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {node.category}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{node.skill}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{node.description}</p>
              </div>
              {node.status !== "locked" && (
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>
          </button>

          {/* Expanded content */}
          <div
            className={`transition-all duration-500 ease-out overflow-hidden ${
              isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-5 pb-5 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Recommended Courses
              </h4>
              <div className="space-y-3">
                {node.courses.map((course, courseIndex) => (
                  <a
                    key={courseIndex}
                    href={course.url}
                    className="block p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${platformColors[course.platform]}`}>
                            {course.platform}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {course.rating}
                          </span>
                        </div>
                        <h5 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {course.title}
                        </h5>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-semibold ${
                            course.price === "Free" ? "text-emerald-500" : "text-foreground"
                          }`}
                        >
                          {course.price}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningPage() {
  const [mounted, setMounted] = useState(false);
  const [expandedNode, setExpandedNode] = useState<string | null>("2");

  useEffect(() => {
    setMounted(true);
  }, []);

  const completedSkills = skillRoadmap.filter((s) => s.status === "completed").length;
  const totalSkills = skillRoadmap.length;
  const readinessScore = Math.round((completedSkills / totalSkills) * 100);
  const skillsToMaster = totalSkills - completedSkills;

  return (
    <div className="relative min-h-screen">
      {/* Animated star field background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <StarField />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Learning Roadmap</h1>
          </div>
          <p className="text-muted-foreground">
            Your personalized path to career advancement
          </p>
        </div>

        {/* Summary Card */}
        <div
          className={`transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <CircularProgress value={readinessScore} size={140} />

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Readiness</p>
                  <p className="text-3xl font-bold text-foreground">{readinessScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {readinessScore >= 80
                      ? "Excellent progress!"
                      : readinessScore >= 50
                      ? "Good momentum"
                      : "Keep learning"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Skills to Master</p>
                  <p className="text-3xl font-bold text-foreground">{skillsToMaster}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    remaining on roadmap
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Career Impact</p>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-lg font-semibold text-emerald-500">+34%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    salary potential
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Target className="w-4 h-4" />
                  Update Goals
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Roadmap Timeline */}
        <div
          className={`transition-all duration-500 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Skill Roadmap</h2>
          <div className="space-y-6">
            {skillRoadmap.map((node, index) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                index={index}
                isExpanded={expandedNode === node.id}
                onToggle={() =>
                  setExpandedNode(expandedNode === node.id ? null : node.id)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
