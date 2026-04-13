"use client";

import { motion } from "framer-motion";
import { Briefcase, FileText, Mic, Bell } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Career Recommender",
    description:
      "AI maps a step-by-step roadmap from where you are to your target role, with weekly milestones you can actually follow.",
    badge: "Roadmap",
  },
  {
    icon: FileText,
    title: "Resume Intelligence",
    description:
      "Upload your resume and get an ATS score, keyword gaps, and a rewritten version tailored for each job description.",
    badge: "ATS Score",
  },
  {
    icon: Mic,
    title: "Voice Mock Interviews",
    description:
      "Practice with a real-time AI interviewer that adapts questions to your target role, then grades your answers live.",
    badge: "Voice AI",
  },
  {
    icon: Bell,
    title: "Smart Follow-Up",
    description:
      "Track every application and get nudges at exactly the right time — so you never let a hot lead go cold.",
    badge: "Tracker",
  },
];

export function Features() {
  return (
    <section id="features" className="relative bg-background py-28 overflow-hidden">
      {/* Subtle top separator glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl"
          >
            Everything you need,
            <br />
            <span className="gradient-text">built in.</span>
          </motion.h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.025 }}
              className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/[0.08]"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] transition-colors group-hover:bg-[#f59e0b]/20">
                <feat.icon className="h-5 w-5" />
              </div>

              {/* Badge */}
              <span className="mb-3 self-start rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#f59e0b]">
                {feat.badge}
              </span>

              <h3 className="mb-2 text-lg font-bold text-foreground">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feat.description}</p>

              {/* Bottom border glow on hover */}
              <div className="absolute bottom-0 left-6 right-6 h-px scale-x-0 rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
