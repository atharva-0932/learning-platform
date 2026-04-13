"use client";

import { motion } from "framer-motion";
import { Upload, Map, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "Drop in your existing resume. Our AI parses it in seconds and builds a complete profile — skills, experience, education, target role.",
  },
  {
    number: "02",
    icon: Map,
    title: "Get Your Roadmap",
    description:
      "Receive a personalised, week-by-week learning roadmap with ATS keyword gaps filled, skill priorities ranked, and job listings matched to you.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Land the Role",
    description:
      "Practice with AI voice interviews, track every application, and walk into your next interview with the confidence to close the offer.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-muted/30 py-28 overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl"
          >
            From resume to offer,
            <br />
            <span className="gradient-text">in three steps.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Connector line (desktop) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px lg:block"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.25) 20%, rgba(139,92,246,0.25) 80%, transparent 95%)",
            }}
            aria-hidden
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number + icon circle */}
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-primary/25 bg-card shadow-lg shadow-primary/10">
                {/* Background glow */}
                <div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
                  }}
                  aria-hidden
                />
                <step.icon className="relative z-10 h-8 w-8 text-primary" />
                {/* Step number badge */}
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>

              <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
