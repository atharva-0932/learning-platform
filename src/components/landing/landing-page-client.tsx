"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Preloader from "@/components/ui/preloader";
import { Navbar } from "@/components/landing/navbar";
import { SplineInteractive } from "@/components/landing/spline-interactive";
import { HeroScrollSection } from "@/components/landing/hero-scroll-section";
import { Footer } from "@/components/landing/footer";

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
      <main className="min-h-screen bg-background text-foreground">
        <Navbar user={user} onSignupClick={signupIntent} />
        <SplineInteractive
          user={user}
          onGetStartedClick={signupIntent}
        />
        <HeroScrollSection />
        <Footer />
      </main>
    </>
  );
}
