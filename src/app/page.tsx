import { LandingPageClient } from "@/components/landing/landing-page-client";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPageClient user={user} />;
}
