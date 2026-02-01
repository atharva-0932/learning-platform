"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock conversation data
const mockConversation = [
  {
    speaker: "ai",
    text: "Hello! Welcome to your technical interview. Let's start with a question about your experience. Can you tell me about a challenging project you've worked on?",
  },
  {
    speaker: "user",
    text: "Sure, I recently led the development of a real-time analytics dashboard that processed millions of events per day...",
  },
  {
    speaker: "ai",
    text: "That sounds impressive. What were the main technical challenges you faced with handling that scale?",
  },
  {
    speaker: "user",
    text: "The biggest challenge was optimizing our database queries. We had to implement caching strategies and eventually moved to a time-series database...",
  },
  {
    speaker: "ai",
    text: "Great approach. Now, let's move to a coding question. How would you implement a function to find the longest palindrome in a string?",
  },
];

const sessionResults = {
  confidence: 78,
  technicalAccuracy: 85,
  clarity: 72,
  mistakes: [
    {
      type: "Technical",
      issue: "Missed edge case in palindrome explanation",
      suggestion:
        "Remember to mention handling single characters and empty strings",
    },
    {
      type: "Communication",
      issue: "Filler words detected (um, like)",
      suggestion:
        "Practice pausing instead of using filler words for more impact",
    },
    {
      type: "Structure",
      issue: "Answer lacked clear structure",
      suggestion:
        "Use the STAR method: Situation, Task, Action, Result for behavioral questions",
    },
  ],
};

// Voice Orb Component with Canvas
function VoiceOrb({
  isActive,
  speakerMode,
}: {
  isActive: boolean;
  speakerMode: "idle" | "ai" | "user";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;

    const getColor = () => {
      switch (speakerMode) {
        case "ai":
          return { r: 139, g: 92, b: 246 }; // Violet
        case "user":
          return { r: 16, g: 185, b: 129 }; // Emerald
        default:
          return { r: 71, g: 85, b: 105 }; // Slate
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      const color = getColor();
      const baseRadius = 80;
      const pulseIntensity = isActive ? 20 : 5;
      const waveCount = isActive ? 4 : 2;

      // Draw outer glow layers
      for (let i = 3; i >= 0; i--) {
        const glowRadius =
          baseRadius +
          30 +
          i * 20 +
          Math.sin(time * 2 + i) * (isActive ? 10 : 3);
        const alpha = 0.05 - i * 0.01;

        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          glowRadius
        );
        gradient.addColorStop(
          0,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
        );
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw pulsing rings
      if (isActive) {
        for (let i = 0; i < 3; i++) {
          const ringProgress = ((time * 0.5 + i * 0.33) % 1) * 1;
          const ringRadius = baseRadius + ringProgress * 60;
          const ringAlpha = (1 - ringProgress) * 0.3;

          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw main orb with wave distortion
      ctx.beginPath();
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
        let radius = baseRadius;

        for (let w = 1; w <= waveCount; w++) {
          radius +=
            Math.sin(angle * (w + 2) + time * (w + 1)) *
            (pulseIntensity / (w * 1.5));
        }

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Main orb gradient
      const orbGradient = ctx.createRadialGradient(
        centerX - 20,
        centerY - 20,
        0,
        centerX,
        centerY,
        baseRadius + pulseIntensity
      );
      orbGradient.addColorStop(
        0,
        `rgba(${Math.min(color.r + 50, 255)}, ${Math.min(color.g + 50, 255)}, ${Math.min(color.b + 50, 255)}, 0.9)`
      );
      orbGradient.addColorStop(
        0.5,
        `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`
      );
      orbGradient.addColorStop(
        1,
        `rgba(${Math.max(color.r - 30, 0)}, ${Math.max(color.g - 30, 0)}, ${Math.max(color.b - 30, 0)}, 0.9)`
      );

      ctx.fillStyle = orbGradient;
      ctx.fill();

      // Inner highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - 25,
        centerY - 25,
        0,
        centerX,
        centerY,
        baseRadius * 0.6
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Center icon area
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, speakerMode]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-[300px] h-[300px]"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {speakerMode === "ai" ? (
          <Volume2 className="w-8 h-8 text-white/80" />
        ) : speakerMode === "user" ? (
          <Mic className="w-8 h-8 text-white/80" />
        ) : (
          <MicOff className="w-8 h-8 text-white/50" />
        )}
      </div>
    </div>
  );
}

// Score Bar Component
function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">
          {animatedValue}%
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const [mounted, setMounted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<"idle" | "ai" | "user">(
    "idle"
  );
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate conversation flow
  useEffect(() => {
    if (!isSessionActive || transcriptIndex >= mockConversation.length) return;

    const currentMessage = mockConversation[transcriptIndex];
    setSpeakerMode(currentMessage.speaker as "ai" | "user");

    const duration = currentMessage.text.length * 50 + 1000;
    const timer = setTimeout(() => {
      if (transcriptIndex < mockConversation.length - 1) {
        setTranscriptIndex((prev) => prev + 1);
      } else {
        setSpeakerMode("idle");
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isSessionActive, transcriptIndex]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcriptIndex]);

  const handleStartSession = useCallback(() => {
    setIsSessionActive(true);
    setTranscriptIndex(0);
    setSpeakerMode("ai");
    setShowResults(false);
  }, []);

  const handleEndSession = useCallback(() => {
    setIsSessionActive(false);
    setSpeakerMode("idle");
    setShowResults(true);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Mock Interview
            </h1>
          </div>
          <p className="text-muted-foreground">
            Practice with AI and get real-time feedback
          </p>
        </div>

        {/* Main Content */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Center - Voice Orb */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center shadow-sm">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSessionActive
                      ? speakerMode === "ai"
                        ? "bg-primary animate-pulse"
                        : speakerMode === "user"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-muted-foreground"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {isSessionActive
                    ? speakerMode === "ai"
                      ? "AI is speaking..."
                      : speakerMode === "user"
                        ? "You are speaking..."
                        : "Waiting..."
                    : "Ready to start"}
                </span>
              </div>

              {/* Voice Orb */}
              <div className="mb-8">
                <VoiceOrb isActive={isSessionActive} speakerMode={speakerMode} />
              </div>

              {/* Interview Type Indicator */}
              {isSessionActive && (
                <div className="mb-6 px-4 py-2 bg-muted rounded-full border border-border">
                  <span className="text-sm text-foreground">
                    Technical Interview - Senior Developer
                  </span>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                {!isSessionActive ? (
                  <Button
                    onClick={handleStartSession}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-lg transition-all hover:scale-105"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Start Interview
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsMuted(!isMuted)}
                      variant="outline"
                      size="lg"
                      className={`rounded-full w-14 h-14 p-0 border-border bg-transparent ${
                        isMuted
                          ? "bg-destructive/20 border-destructive/50 text-destructive"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {isMuted ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>

                    <Button
                      onClick={handleEndSession}
                      size="lg"
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-6 text-lg rounded-2xl"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Session
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Live Transcription */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-6 h-full flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Live Transcription</h2>
              </div>

              <div
                ref={transcriptRef}
                className="flex-1 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px] pr-2"
              >
                {!isSessionActive && transcriptIndex === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Transcript will appear here...
                  </div>
                ) : (
                  mockConversation.slice(0, transcriptIndex + 1).map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl transition-all duration-300 ${
                        index === transcriptIndex
                          ? "animate-in fade-in slide-in-from-bottom-2"
                          : ""
                      } ${
                        msg.speaker === "ai"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-emerald-500/10 border border-emerald-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium ${
                            msg.speaker === "ai"
                              ? "text-primary"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {msg.speaker === "ai" ? "AI Interviewer" : "You"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Stats */}
              {isSessionActive && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted rounded-xl">
                      <p className="text-lg font-bold text-foreground">
                        {Math.floor(transcriptIndex * 1.5)}:
                        {String(transcriptIndex * 23).padStart(2, "0")}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-xl">
                      <p className="text-lg font-bold text-foreground">
                        {transcriptIndex + 1}/{mockConversation.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Overlay */}
      {showResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 bg-card border border-border rounded-3xl p-8 animate-in zoom-in-95 duration-300 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Session Summary
                  </h2>
                  <p className="text-muted-foreground">
                    Technical Interview - 5 questions
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResults(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Score Bars */}
            <div className="bg-muted rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Performance Metrics
              </h3>
              <div className="space-y-6">
                <ScoreBar
                  label="Confidence Score"
                  value={sessionResults.confidence}
                  color="bg-violet-500"
                />
                <ScoreBar
                  label="Technical Accuracy"
                  value={sessionResults.technicalAccuracy}
                  color="bg-emerald-500"
                />
                <ScoreBar
                  label="Clarity & Communication"
                  value={sessionResults.clarity}
                  color="bg-blue-500"
                />
              </div>
            </div>

            {/* Overall Score */}
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary mb-3">
                  <span className="text-4xl font-bold text-primary-foreground">
                    {Math.round(
                      (sessionResults.confidence +
                        sessionResults.technicalAccuracy +
                        sessionResults.clarity) /
                        3
                    )}
                  </span>
                </div>
                <p className="text-muted-foreground">Overall Score</p>
              </div>
            </div>

            {/* Mistakes to Fix */}
            <div className="bg-muted rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Areas for Improvement
                </h3>
              </div>
              <div className="space-y-4">
                {sessionResults.mistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className="p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {mistake.issue}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                            {mistake.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />
                          {mistake.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowResults(false);
                  handleStartSession();
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
                className="flex-1 border-border bg-transparent text-foreground hover:bg-muted py-6 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
