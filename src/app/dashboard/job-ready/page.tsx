import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InterviewClient } from "@/components/dashboard/interview-client";
import { PAYMENTS_PATH, hasPaymentProviderCustomer } from "@/lib/razorpay";

export default async function JobReadyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, goals")
    .eq("user_id", user.id)
    .single();

  const { data: userSkillsData } = await supabase
    .from("user_skills")
    .select("skills(name)")
    .eq("user_id", user.id);

  const skills = (userSkillsData || []).map((item: any) => item.skills?.name).filter(Boolean) as string[];

  const targetRole = profile?.goals?.target_role ?? null;
  const normalizedStatus = String(profile?.subscription_status ?? "").toLowerCase();
  const normalizedPlan = String(profile?.plan ?? profile?.subscription_plan ?? "").toLowerCase();
  const hasPaidStatus = ["active", "trialing", "paid", "premium", "pro"].includes(normalizedStatus);
  const hasPaidPlan = normalizedPlan.length > 0 && !["free", "basic", "starter"].includes(normalizedPlan);
  const hasSubscriptionFlag =
    profile?.is_subscribed === true || profile?.subscribed === true;
  const isSubscribed = Boolean(
    hasSubscriptionFlag ||
      hasPaidStatus ||
      hasPaidPlan ||
      hasPaymentProviderCustomer(profile as Record<string, unknown> | null),
  );
  const subscribeUrl = PAYMENTS_PATH;

  return (
    <InterviewClient
      userId={user.id}
      targetRole={targetRole}
      skills={skills}
      isSubscribed={isSubscribed}
      subscribeUrl={subscribeUrl}
    />
  );
}
