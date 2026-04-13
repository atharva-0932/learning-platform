"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Preloader from "@/components/ui/preloader";
import { Navbar } from "@/components/landing/navbar";
import { SplineInteractive } from "@/components/landing/spline-interactive";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

function CTABanner({ onGetStartedClick, user }: { onGetStartedClick?: () => void; user: User | null }) {
  return (
    <section className="relative overflow-hidden bg-background py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)",
        }}
        aria-hidden
      />
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{
          background: "radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl"
        >
          Your dream role is
          <br />
          <span className="gradient-text">one upload away.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-lg text-muted-foreground"
        >
          Free to start. No credit card. Your personalised roadmap in under 5 minutes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-14 items-center gap-2.5 rounded-xl bg-[#f59e0b] px-10 text-base font-bold text-white transition-all hover:bg-[#f59e0b]/90 hover:shadow-lg hover:shadow-[#f59e0b]/30"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : onGetStartedClick ? (
            <button
              type="button"
              onClick={onGetStartedClick}
              className="inline-flex h-14 items-center gap-2.5 rounded-xl bg-[#f59e0b] px-10 text-base font-bold text-white transition-all hover:bg-[#f59e0b]/90 hover:shadow-lg hover:shadow-[#f59e0b]/30"
            >
              Get started free
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href="/signup"
              className="inline-flex h-14 items-center gap-2.5 rounded-xl bg-[#f59e0b] px-10 text-base font-bold text-white transition-all hover:bg-[#f59e0b]/90 hover:shadow-lg hover:shadow-[#f59e0b]/30"
            >
              Get started free
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export function LandingPageClient({ user }: { user: User | null }) {
  const router = useRouter();
  const [showPreloader, setShowPreloader] = useState(false);

  const startSignupFlow = useCallback(() => {
    setShowPreloader(true);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
    router.push("/signup");
  }, [router]);

  const signupIntent = !user ? startSignupFlow : undefined;

  return (
    <>
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
      <div className="min-h-screen bg-background text-foreground">
        <Navbar user={user} onSignupClick={signupIntent} />
        <SplineInteractive user={user} onGetStartedClick={signupIntent} />
        <Features />
        <HowItWorks />
        <CTABanner onGetStartedClick={signupIntent} user={user} />
        <Footer />
      </div>
    </>
  );
}
