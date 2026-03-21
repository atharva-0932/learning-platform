import { Navbar } from "@/components/landing/navbar";
import { SplineInteractive } from "@/components/landing/spline-interactive";
import { HeroScrollSection } from "@/components/landing/hero-scroll-section";
import { Footer } from "@/components/landing/footer";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar user={user} />
      <SplineInteractive />
      <HeroScrollSection />
      <Footer />
    </main>
  );
}
