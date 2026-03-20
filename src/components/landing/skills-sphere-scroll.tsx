"use client";

import Link from "next/link";
import { FullScreenScrollFX } from "./full-screen-scroll-fx";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import "./full-screen-scroll-fx.css";

const SKILLSPHERE_SECTIONS = [
  {
    id: "career",
    background: "linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0f0a1e 100%)",
    leftLabel: "Career Roadmaps",
    title: "Discover Your Path",
    rightLabel: "AI-Powered",
    renderBackground: () => (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/70" />
      </>
    ),
  },
  {
    id: "resume",
    background: "linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0f0a1e 100%)",
    leftLabel: "ATS Optimized",
    title: "Craft Your Story",
    rightLabel: "Smart Templates",
    renderBackground: () => (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/70" />
      </>
    ),
  },
  {
    id: "followup",
    background: "linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0f0a1e 100%)",
    leftLabel: "Track Applications",
    title: "Never Miss a Follow-Up",
    rightLabel: "5-7 Day Reminder",
    renderBackground: () => (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/70" />
      </>
    ),
  },
  {
    id: "interview",
    background: "linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0f0a1e 100%)",
    leftLabel: "Real-Time Feedback",
    title: "Practice With AI",
    rightLabel: "Build Confidence",
    renderBackground: () => (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/70" />
      </>
    ),
  },
];

export function SkillsSphereScroll() {
  return (
    <FullScreenScrollFX
      sections={SKILLSPHERE_SECTIONS}
      header={
        <>
          <span>SKILLSPHERE</span>
          <span>Your Career, Engineered by AI</span>
        </>
      }
      footer="Everything you need to land your dream role"
      endContent={
        <div className="flex flex-col items-center gap-6">
          <p className="text-muted-foreground text-lg max-w-2xl text-center">
            Ready to transform your career journey?
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      }
      colors={{
        text: "rgba(255,255,255,0.95)",
        overlay: "rgba(0,0,0,0.45)",
        pageBg: "hsl(var(--background))",
        stageBg: "#0f0a1e",
      }}
      showProgress
      className="w-full"
    />
  );
}
