"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-muted/30" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">
            Powered by Advanced AI
          </span>
        </div>

        {/* Main heading */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="text-foreground text-balance">Your Career,</span>
          <br />
          <span className="text-primary text-balance">Engineered by AI</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 text-pretty ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Transform your professional journey with intelligent career
          recommendations, AI-crafted resumes, and personalized interview
          coaching.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg group"
            >
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="border-border hover:border-primary hover:bg-primary/5 text-foreground font-medium px-8 py-6 text-lg bg-transparent"
          >
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { value: "50K+", label: "Users" },
            { value: "95%", label: "Success Rate" },
            { value: "200+", label: "Career Paths" },
            { value: "24/7", label: "AI Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
