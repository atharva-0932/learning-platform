"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SplineInteractive() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
    <Card className="w-full min-h-[70vh] md:h-[85vh] bg-gradient-to-b from-background via-primary/5 to-muted/30 relative overflow-hidden border-0 rounded-none border-b border-border">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#8b5cf6"
      />

      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-6 md:p-12 relative z-10 flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Your Career,{" "}
            <span className="text-primary">Engineered by AI</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-lg text-base md:text-lg leading-relaxed">
            Career roadmaps, ATS-optimized resumes, interview prep, and job tracking—all in one place. Land your dream role with AI by your side.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:bg-muted hover:border-primary/50 px-8 py-6"
              >
                Explore Features
              </Button>
            </Link>
          </div>
        </div>

        {/* Right content - 3D scene */}
        <div className="flex-1 relative min-h-[280px] md:min-h-[400px]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
    </motion.section>
  );
}
