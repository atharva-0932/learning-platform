import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CareerContent } from "@/components/dashboard/career-content";

export default async function CareerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, goals')
        .eq('user_id', user.id)
        .single();

    // Fetch user skills for the fallback assessment
    const { data: userSkillsData } = await supabase
        .from('user_skills')
        .select('skills(name)')
        .eq('user_id', user.id);

    const skills = (userSkillsData || []).map((item: any) => item.skills?.name).filter(Boolean) as string[];

    const { data: assessment } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const enhancedProfile = profile ? {
        ...profile,
        skills
    } : null;

    return <CareerContent user={user} assessment={assessment} profile={enhancedProfile} />;
}
