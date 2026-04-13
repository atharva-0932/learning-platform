import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/app/auth/actions";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { GitHubAuthButton } from "@/components/auth/github-auth-button";

const brandFeatures = [
  "ATS-optimised resume in minutes",
  "Personalised AI career roadmap",
  "Voice-powered mock interviews",
];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-[#0a0a0f] p-12 lg:flex">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            SKILL<span className="text-primary">SPHERE</span>
          </span>
        </Link>

        {/* Headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tighter text-white">
              Your next role
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)",
                }}
              >
                starts here.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/60">
              Join thousands of job seekers who have landed roles faster with AI-powered career guidance.
            </p>
          </div>

          <ul className="space-y-3">
            {brandFeatures.map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm text-white/70">{feat}</span>
              </li>
            ))}
          </ul>

          <p className="text-sm text-white/40">Used by 10,000+ job seekers worldwide</p>
        </div>

        {/* Bottom decorative card */}
        <div className="relative z-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
          <p className="mb-1 text-sm font-medium text-white">
            &ldquo;SKILLSPHERE helped me go from 2 interviews per month to 8 — and I landed my dream job in 6 weeks.&rdquo;
          </p>
          <p className="text-xs text-white/40">— Product Designer at a Series B startup</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground">
              SKILL<span className="text-primary">SPHERE</span>
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-11"
              />
            </div>

            {params?.error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {params.error}
              </p>
            )}

            <Button
              formAction={signup}
              className="h-11 w-full gap-2 bg-[#f59e0b] font-semibold text-white hover:bg-[#f59e0b]/90"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <GoogleAuthButton text="Sign up with Google" />
            <GitHubAuthButton text="Sign up with GitHub" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
