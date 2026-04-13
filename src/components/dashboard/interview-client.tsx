"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Star,
  Lightbulb,
  Brain,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateTargetRoleForm } from "@/components/dashboard/update-target-role-form";
import { JobOpeningsCrewPanel } from "@/components/dashboard/job-openings-crew-panel";

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
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1200;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValue(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{displayValue}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}

function CountUpScore({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 1600;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 200);
    return () => clearTimeout(t);
  }, [target]);
  return <>{val}</>;
}

export function InterviewClient({
  userId,
  targetRole,
  skills,
  isSubscribed,
  subscribeUrl,
}: {
  userId: string;
  targetRole: string | null;
  skills: string[];
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

  const overallScore = Math.round(
    (sessionResults.confidence + sessionResults.technicalAccuracy + sessionResults.clarity) / 3
  );

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-background"
      style={{
        backgroundImage: "radial-gradient(rgba(139,92,246,0.12) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Radial fade to make dot grid subtle at edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, transparent 40%, hsl(var(--background)) 100%)",
        }}
        aria-hidden
      />

      {/* Full-width page header strip */}
      <div className="relative z-10 border-b border-border/60 bg-card/80 px-6 py-4 backdrop-blur-sm lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                Job Ready
              </h1>
              <p className="text-xs text-muted-foreground">AI-powered mock interview</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Target role badge */}
            {targetRole && (
              <span className="rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-1 text-xs font-semibold text-[#f59e0b]">
                {targetRole}
              </span>
            )}

            {/* Session state dot */}
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5">
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  isSessionActive
                    ? speakerMode === "ai"
                      ? "animate-pulse bg-violet-500"
                      : speakerMode === "user"
                        ? "animate-pulse bg-emerald-500"
                        : "bg-muted-foreground"
                    : "bg-muted-foreground"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {isSessionActive
                  ? speakerMode === "ai"
                    ? "AI speaking"
                    : speakerMode === "user"
                      ? "You speaking"
                      : "Waiting"
                  : "Idle"}
              </span>
            </div>

            {targetRole ? (
              <UpdateTargetRoleForm userId={userId} currentRole={targetRole} onSuccess={() => router.refresh()} />
            ) : (
              <div className="flex items-center gap-2">
                <UpdateTargetRoleForm userId={userId} currentRole="" onSuccess={() => router.refresh()} />
                <span className="text-xs text-muted-foreground">or</span>
                <Link href="/dashboard" className="text-xs font-medium text-primary hover:underline">
                  Upload resume
                </Link>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 p-6 lg:p-8 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Center - Voice Orb */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-sm flex flex-col items-center">
              {/* Voice Orb */}
              <div className="mb-6">
                <VoiceOrb isActive={isSessionActive} speakerMode={speakerMode} />
              </div>

              {/* Pre-session warm-up card */}
              {!isSessionActive && transcript.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-6 w-full max-w-md rounded-2xl border border-border/50 bg-muted/30 p-5"
                >
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Before you start
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: Mic, text: "Speak clearly and at a natural pace", color: "text-violet-400", bg: "bg-violet-500/10" },
                      { icon: Brain, text: "Use the STAR method for behavioural questions", color: "text-sky-400", bg: "bg-sky-500/10" },
                      { icon: Lightbulb, text: "It's OK to take a moment before answering", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
                    ].map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${tip.bg}`}>
                          <tip.icon className={`h-3.5 w-3.5 ${tip.color}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">{tip.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Interview type badge */}
              {(isSessionActive || targetRole) && transcript.length > 0 && (
                <div className="mb-5 rounded-full border border-border bg-muted px-4 py-1.5">
                  <span className="text-sm text-foreground">
                    <Target className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
                    {displayRole}
                  </span>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                {!isSessionActive ? (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <button
                      onClick={handleStartSession}
                      className="relative inline-flex items-center gap-2 rounded-full bg-primary px-12 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all"
                    >
                      {/* Pulse ring */}
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20" />
                      <Phone className="h-5 w-5" />
                      Start Interview
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-3">
                    <motion.div whileTap={{ scale: 0.92 }}>
                      <button
                        onClick={handleToggleMute}
                        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                          isMuted
                            ? "border-[#f59e0b]/60 bg-[#f59e0b]/15 text-[#f59e0b]"
                            : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.96 }}>
                      <button
                        onClick={handleEndSession}
                        className="flex items-center gap-2 rounded-full bg-destructive px-8 py-3.5 text-base font-bold text-destructive-foreground shadow-lg shadow-destructive/20 transition-all hover:bg-destructive/90"
                      >
                        <PhoneOff className="h-5 w-5" />
                        End Session
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Live Transcription */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm flex h-full flex-col">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">Live Transcription</h2>
                {isSessionActive && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>

              <div
                ref={transcriptRef}
                className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[400px] pr-2"
              >
                {!isSessionActive && transcript.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                    Transcript will appear here when the call starts...
                  </div>
                ) : (
                  transcript.map((msg, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl border p-3 transition-all duration-300 ${
                        msg.speaker === "ai"
                          ? "border-primary/20 bg-primary/10"
                          : "border-emerald-500/20 bg-emerald-500/10"
                      }`}
                    >
                      <span
                        className={`mb-1 block text-xs font-semibold ${
                          msg.speaker === "ai" ? "text-primary" : "text-emerald-400"
                        }`}
                      >
                        {msg.speaker === "ai" ? "AI Interviewer" : "You"}
                      </span>
                      <p className="text-sm text-muted-foreground">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {isSessionActive && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted p-3 text-center">
                      <p className="text-lg font-bold text-foreground">
                        {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, "0")}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="rounded-xl bg-muted p-3 text-center">
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

        {targetRole && (
          <section className="mt-10 max-w-7xl mx-auto w-full">
            <JobOpeningsCrewPanel targetRole={targetRole} skills={skills} />
          </section>
        )}
      </div>

      {/* Results Overlay */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="m-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground">Session Summary</h2>
                  <p className="text-sm text-muted-foreground">{displayRole} Interview</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowResults(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {isSubscribed ? (
              <>
                {/* Overall score count-up */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-8 flex flex-col items-center"
                >
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-700 shadow-xl shadow-primary/30">
                    <span className="text-4xl font-extrabold text-primary-foreground">
                      <CountUpScore target={overallScore} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Overall Score</p>
                </motion.div>

                {/* Score Bars */}
                <div className="mb-6 rounded-2xl bg-muted p-6">
                  <h3 className="mb-5 text-base font-semibold text-foreground">Performance Metrics</h3>
                  <div className="space-y-5">
                    <ScoreBar label="Confidence Score" value={sessionResults.confidence} color="bg-violet-500" />
                    <ScoreBar label="Technical Accuracy" value={sessionResults.technicalAccuracy} color="bg-emerald-500" />
                    <ScoreBar label="Clarity & Communication" value={sessionResults.clarity} color="bg-sky-500" />
                  </div>
                </div>

                {/* Improvements */}
                <div className="rounded-2xl bg-muted p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
                    <h3 className="text-base font-semibold text-foreground">Areas for Improvement</h3>
                  </div>
                  <div className="space-y-3">
                    {sessionResults.mistakes.map((mistake, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.08 }}
                        className="rounded-xl border border-border bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f59e0b]/15">
                            <ChevronRight className="h-4 w-4 text-[#f59e0b]" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{mistake.issue}</span>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                {mistake.type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-500" />
                              {mistake.suggestion}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 rounded-2xl bg-muted p-6">
                  <h3 className="mb-2 text-base font-semibold text-foreground">Interview Completed!</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Great work! Detailed skill analysis, scoring trends, and actionable feedback are available for subscribers.
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
                <div className="rounded-2xl border border-dashed border-primary/40 bg-muted p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Detailed Report Locked</h3>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Subscribe to unlock detailed scoring, mistakes analysis, and personalised improvement suggestions after every interview.
                  </p>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={subscribeUrl}>Subscribe to Unlock Report</Link>
                  </Button>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => { setShowResults(false); handleStartSession(); }}
                className="flex-1 rounded-xl py-6"
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setShowResults(false)} className="flex-1 rounded-xl py-6">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
