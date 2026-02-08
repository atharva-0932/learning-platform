import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('bio, education, goals')
    .eq('user_id', user.id)
    .single();

  // Fetch user skills
  const { data: userSkillsData } = await supabase
    .from('user_skills')
    .select('skills(name)')
    .eq('user_id', user.id);

  // Extract skill names
  const skills = userSkillsData?.map((item: any) => item.skills?.name).filter(Boolean) || [];

  // Build profile data object if it exists
  const profileData = profile ? {
    bio: profile.bio,
    skills: skills,
    education: profile.education || [],
    experience: [], // Note: experience not stored separately yet
    targetRole: profile.goals?.target_role
  } : null;

  return <DashboardContent user={user} profileData={profileData} />;
}
