"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Bell, Mic } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 80, damping: 20 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Briefcase,
    title: "Career Recommender",
    description:
      "AI-powered analysis of your skills and interests to suggest the perfect career paths tailored just for you.",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description:
      "Create stunning, ATS-optimized resumes with intelligent suggestions and modern templates.",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: Bell,
    title: "Smart Follow-Up",
    description:
      "Track where you applied and get reminded of the optimal time to send a follow-up (5–7 days).",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: Mic,
    title: "Mock Interview",
    description:
      "Practice with AI interviewers, get real-time feedback, and build confidence for the big day.",
    color: "bg-primary text-primary-foreground",
  },
];

export function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      className="relative py-24 bg-muted/30 border-t border-border"
      id="features"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything You Need to{" "}
            <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Comprehensive tools designed to accelerate your career growth at
            every stage of your professional journey.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative group cursor-pointer"
              >
                {/* Card */}
                <div
                  className={`relative p-8 rounded-2xl bg-card border border-border transition-all duration-300 ${
                    isHovered ? "shadow-lg border-primary/30 scale-[1.02]" : "shadow-sm"
                  }`}
                >
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-6 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                      <span>Learn more</span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
