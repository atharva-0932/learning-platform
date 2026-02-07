"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  FileText,
  GraduationCap,
  Mic,
  TrendingUp,
  Target,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const quickActions = [
  {
    title: "Career Recommender",
    description: "Discover your perfect career path",
    icon: Briefcase,
    href: "/dashboard/career",
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "Resume Builder",
    description: "Create a stunning resume",
    icon: FileText,
    href: "/dashboard/resume",
    color: "bg-blue-500 text-white",
  },
  {
    title: "Learning Academy",
    description: "Upgrade your skills",
    icon: GraduationCap,
    href: "/dashboard/learning",
    color: "bg-emerald-500 text-white",
  },
  {
    title: "Mock Interview",
    description: "Practice with AI",
    icon: Mic,
    href: "/dashboard/interview",
    color: "bg-amber-500 text-white",
  },
];

const stats = [
  {
    title: "Profile Strength",
    value: "85%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  {
    title: "Career Matches",
    value: "24",
    change: "+3",
    icon: Target,
    color: "text-primary",
  },
  {
    title: "Hours Learned",
    value: "42",
    change: "+8",
    icon: Clock,
    color: "text-blue-500",
  },
  {
    title: "Achievements",
    value: "12",
    change: "+2",
    icon: Award,
    color: "text-amber-500",
  },
];

const recentActivity = [
  {
    title: "Completed Python Fundamentals",
    time: "2 hours ago",
    type: "learning",
  },
  {
    title: "Updated Resume - Software Engineer",
    time: "5 hours ago",
    type: "resume",
  },
  {
    title: "Mock Interview: Technical Lead",
    time: "1 day ago",
    type: "interview",
  },
  {
    title: "New career match: Data Scientist",
    time: "2 days ago",
    type: "career",
  },
];

export function DashboardContent({ user }: { user: any }) {
  const [mounted, setMounted] = useState(false);
  const userName = user?.email?.split('@')[0] || "User";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome section */}
      <div
        className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-primary">{userName}</span>
        </h1>
        <p className="text-muted-foreground">
          {"Let's continue building your dream career."}
        </p>
      </div>

      {/* Stats grid */}
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-emerald-500 font-medium">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div
        className={`transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <div className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer h-full">
                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                    <ArrowRight className="w-4 h-4 text-primary mt-4 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom section */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        {/* Recent activity */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                AI Career Assistant
              </h2>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            {"Based on your profile, I've identified 3 new career opportunities that match your skills. Would you like me to analyze them?"}
          </p>

          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Analyze Now
            </Button>
            <Button
              variant="outline"
              className="border-border hover:border-primary hover:bg-primary/5 bg-transparent text-foreground"
            >
              Ask a Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
