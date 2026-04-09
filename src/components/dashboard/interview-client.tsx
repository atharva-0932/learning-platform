"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateTargetRoleForm } from "@/components/dashboard/update-target-role-form";

const VAPI_ASSISTANT_ID = "f3f950cc-601d-441f-8d38-67e5383cf706";

type TranscriptMessage = {
  speaker: "ai" | "user";
  text: string;
};

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

export function InterviewClient({
  userId,
  targetRole,
  isSubscribed,
  subscribeUrl,
}: {
  userId: string;
  targetRole: string | null;
  isSubscribed: boolean;
  subscribeUrl: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<"idle" | "ai" | "user">("idle");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const callStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayRole = targetRole || "General Role";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Vapi client (client-side only)
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) {
      setError("Vapi API key not configured");
      return;
    }
    vapiRef.current = new Vapi(key);
    return () => {
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, []);

  // Vapi event listeners
  useEffect(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    const onCallStart = () => {
      setIsSessionActive(true);
      setIsMuted(false);
      setTranscript([]);
      setSpeakerMode("ai");
      setShowResults(false);
      setError(null);
      setCallDuration(0);
      callStartTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }, 1000);
    };

    const onCallEnd = () => {
      setIsSessionActive(false);
      setSpeakerMode("idle");
      setShowResults(true);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };

    const onSpeechStart = () => setSpeakerMode("ai");
    const onSpeechEnd = () => setSpeakerMode("idle");

    const onMessage = (message: { type?: string; role?: string; transcript?: string }) => {
      if (message.type === "transcript" && message.transcript && message.role) {
        const speaker = message.role === "user" ? "user" : "ai";
        if (speaker === "user") setSpeakerMode("user");
        setTranscript((prev) => [...prev, { speaker, text: message.transcript ?? "" }]);
      }
    };

    const onError = (e: unknown) => {
      setError(e instanceof Error ? e.message : "Connection error");
      setIsSessionActive(false);
      setSpeakerMode("idle");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const handleStartSession = useCallback(() => {
    setError(null);
    const assistantOverrides = {
      variableValues: {
        target_role: targetRole || "a general professional role",
      },
    };
    vapiRef.current?.start(VAPI_ASSISTANT_ID, assistantOverrides);
  }, [targetRole]);

  const handleEndSession = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  const handleToggleMute = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi || !isSessionActive) return;
    const next = !isMuted;
    vapi.setMuted(next);
    setIsMuted(next);
  }, [isSessionActive, isMuted]);

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
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {targetRole ? (
              <UpdateTargetRoleForm
                userId={userId}
                currentRole={targetRole}
                onSuccess={() => router.refresh()}
              />
            ) : (
              <div className="flex items-center gap-3">
                <UpdateTargetRoleForm
                  userId={userId}
                  currentRole=""
                  onSuccess={() => router.refresh()}
                />
                <span className="text-muted-foreground text-sm">or</span>
                <Link href="/dashboard" className="text-sm text-primary hover:underline font-medium">
                  Upload your resume
                </Link>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
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
              {(isSessionActive || targetRole) && (
                <div className="mb-6 px-4 py-2 bg-muted rounded-full border border-border">
                  <span className="text-sm text-foreground">
                    Interview for: {displayRole}
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
                      onClick={handleToggleMute}
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
                {!isSessionActive && transcript.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Transcript will appear here when the call starts...
                  </div>
                ) : (
                  transcript.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl transition-all duration-300 ${
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
                        {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, "0")}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-xl">
                      <p className="text-lg font-bold text-foreground">
                        {transcript.filter((m) => m.speaker === "ai").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Exchanges</p>
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
                    {displayRole} Interview
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
            {isSubscribed ? (
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
            ) : (
              <div className="bg-muted rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Interview Completed
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Great work! Detailed skill analysis, scoring trends, and actionable feedback are
                  available for subscribers.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground">Session duration</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {transcript.filter((m) => m.speaker === "ai").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Questions asked</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Score */}
            {isSubscribed && (
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
            )}

            {/* Mistakes to Fix */}
            {isSubscribed ? (
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
            ) : (
              <div className="bg-muted rounded-2xl p-6 border border-dashed border-primary/40">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Detailed Report Locked
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe to unlock detailed scoring, mistakes analysis, and personalized
                  improvement suggestions after every interview.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <a href={subscribeUrl}>Subscribe to Unlock Report</a>
                </Button>
              </div>
            )}

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
