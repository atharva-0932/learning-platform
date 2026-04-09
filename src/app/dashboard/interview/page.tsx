import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InterviewClient } from "@/components/dashboard/interview-client";
import { getRazorpaySubscribeUrl, hasPaymentProviderCustomer } from "@/lib/razorpay";

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

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
  const subscribeUrl = getRazorpaySubscribeUrl("/pricing");

  return (
    <InterviewClient
      userId={user.id}
      targetRole={targetRole}
      isSubscribed={isSubscribed}
      subscribeUrl={subscribeUrl}
    />
  );
}
