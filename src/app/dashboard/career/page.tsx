import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CareerContent } from "@/components/dashboard/career-content";

export default async function CareerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: assessment } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return <CareerContent user={user} assessment={assessment} />;
}
