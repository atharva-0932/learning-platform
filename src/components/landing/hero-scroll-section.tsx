"use client";

import React from "react";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Briefcase, FileText, Bell, Mic } from "lucide-react";

export function HeroScrollSection() {
  return (
    <div className="flex flex-col overflow-hidden pb-16 pt-[200px] bg-gradient-to-b from-muted/30 to-background">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              Everything you need to{" "}
              <br />
              <span className="text-4xl md:text-[5rem] font-bold mt-1 leading-none text-primary">
                Land Your Dream Role
              </span>
            </h2>
          </>
        }
      >
        <div className="relative h-full w-full">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt="Career success"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-center"
            draggable={false}
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { icon: Briefcase, label: "Career Roadmaps" },
                { icon: FileText, label: "ATS Resumes" },
                { icon: Bell, label: "Smart Follow-Up" },
                { icon: Mic, label: "AI Interviews" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
