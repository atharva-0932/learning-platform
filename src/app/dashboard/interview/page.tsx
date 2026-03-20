import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InterviewClient } from "@/components/dashboard/interview-client";

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("goals")
    .eq("user_id", user.id)
    .single();

  const targetRole = profile?.goals?.target_role ?? null;

  return <InterviewClient targetRole={targetRole} />;
}
