"use client";

import React from "react"

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const structuralGaps = [
  {
    id: "1",
    title: "Missing Professional Summary",
    priority: "High",
    description:
      "Add a 2-3 sentence professional summary at the top of your resume to immediately capture recruiter attention and highlight your value proposition.",
  },
  {
    id: "2",
    title: "Inconsistent Date Formatting",
    priority: "Medium",
    description:
      "Use a consistent date format throughout (e.g., 'Jan 2023 - Present' or '01/2023 - Present'). Currently mixing formats in work experience section.",
  },
  {
    id: "3",
    title: "Education Section Placement",
    priority: "Low",
    description:
      "Consider moving education section below work experience since you have 5+ years of professional experience.",
  },
];

const keywordOptimizations = [
  {
    id: "1",
    title: "Add 'Agile' and 'Scrum' Keywords",
    priority: "High",
    description:
      "Your target role mentions Agile methodology 4 times. Add specific examples of Agile/Scrum experience to improve ATS matching by ~15%.",
  },
  {
    id: "2",
    title: "Include Cloud Platform Keywords",
    priority: "High",
    description:
      "Add AWS, Azure, or GCP certifications and experience. 78% of similar job postings require cloud experience.",
  },
  {
    id: "3",
    title: "Quantify Leadership Experience",
    priority: "Medium",
    description:
      "Replace 'led team' with specific metrics like 'Led cross-functional team of 8 engineers' for better impact.",
  },
  {
    id: "4",
    title: "Add Industry-Specific Terminology",
    priority: "Low",
    description:
      "Consider adding terms like 'CI/CD', 'microservices', and 'containerization' to match technical requirements.",
  },
];

const formattingTips = [
  {
    id: "1",
    title: "Reduce Resume to One Page",
    priority: "High",
    description:
      "Your resume is currently 1.5 pages. For most roles with under 10 years experience, a single page is optimal for ATS parsing and recruiter review.",
  },
  {
    id: "2",
    title: "Use Standard Section Headers",
    priority: "Medium",
    description:
      "Rename 'Career Journey' to 'Work Experience' and 'Skills Arsenal' to 'Technical Skills' for better ATS recognition.",
  },
  {
    id: "3",
    title: "Remove Graphics and Icons",
    priority: "Medium",
    description:
      "ATS systems cannot parse icons or graphics. Replace skill rating bars with text descriptions of proficiency levels.",
  },
  {
    id: "4",
    title: "Optimize File Format",
    priority: "Low",
    description:
      "Save as .docx for maximum ATS compatibility. PDF can sometimes cause parsing issues with older systems.",
  },
];

function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    High: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    Medium:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  };

  const icons = {
    High: AlertCircle,
    Medium: AlertTriangle,
    Low: Info,
  };

  const Icon = icons[priority as keyof typeof icons];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}
    >
      <Icon className="w-3 h-3" />
      {priority}
    </span>
  );
}

function CircularProgress({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/50"
        />
        <circle
          cx="96"
          cy="96"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{score}</span>
        <span className="text-sm text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showResults && score < 73) {
      const timer = setTimeout(() => {
        setScore((prev) => Math.min(prev + 1, 73));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [showResults, score]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file.name);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Resume Intelligence
          </h1>
        </div>
        <p className="text-muted-foreground">
          Upload your resume for AI-powered ATS analysis and optimization
          recommendations
        </p>
      </div>

      {/* Upload Section */}
      <div
        className={`transition-all duration-500 delay-100 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
              : uploadedFile
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Analyzing your resume...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Running ATS compatibility checks
                </p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {uploadedFile}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully uploaded and analyzed
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFile(null);
                  setShowResults(false);
                  setScore(0);
                }}
                className="bg-transparent text-foreground"
              >
                Upload Different File
              </Button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    isDragging
                      ? "bg-primary/20 scale-110"
                      : "bg-muted hover:bg-primary/10"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your resume here or{" "}
                    <span className="text-primary">browse</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500 ${
            showResults ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Left Column - Score */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
                ATS Readiness Score
              </h2>
              <div className="flex justify-center mb-6">
                <CircularProgress score={score} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    Structural Issues
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    3 found
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    Keyword Gaps
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    4 found
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    Format Issues
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    4 found
                  </span>
                </div>
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Generate Optimized Resume
              </Button>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="structural" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 rounded-xl mb-6">
                <TabsTrigger
                  value="structural"
                  className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Structural Gaps
                </TabsTrigger>
                <TabsTrigger
                  value="keywords"
                  className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Keywords
                </TabsTrigger>
                <TabsTrigger
                  value="formatting"
                  className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Formatting
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structural" className="space-y-4">
                <Accordion type="single" collapsible className="space-y-3">
                  {structuralGaps.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className={`bg-card border border-border rounded-xl px-4 overflow-hidden transition-all duration-300 ${
                        mounted
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium text-foreground">
                            {item.title}
                          </span>
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {item.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-4">
                <Accordion type="single" collapsible className="space-y-3">
                  {keywordOptimizations.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className={`bg-card border border-border rounded-xl px-4 overflow-hidden transition-all duration-300 ${
                        mounted
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium text-foreground">
                            {item.title}
                          </span>
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {item.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="formatting" className="space-y-4">
                <Accordion type="single" collapsible className="space-y-3">
                  {formattingTips.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className={`bg-card border border-border rounded-xl px-4 overflow-hidden transition-all duration-300 ${
                        mounted
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium text-foreground">
                            {item.title}
                          </span>
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {item.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
