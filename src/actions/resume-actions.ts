"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { parseResume } from "@/lib/resume-parser";

export async function uploadResumeAndAnalyze(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to upload a resume" };
        }

        const file = formData.get("resume") as File;
        const role = formData.get("role") as string;

        if (!file || !role) {
            return { error: "Resume and target role are required" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await parseResume(buffer);

        // Mock Scoring Logic (Keyword Matching)
        const keywords = role.toLowerCase().split(" ");
        let matchCount = 0;
        const resumeLower = text.toLowerCase();

        keywords.forEach((keyword) => {
            if (resumeLower.includes(keyword)) {
                matchCount++;
            }
        });

        // Basic scoring algorithm
        let score = Math.min(Math.round((matchCount / keywords.length) * 100) + 40, 95); // Base score + matches
        if (score > 100) score = 100;

        // Generate basic feedback based on score
        const feedback = {
            strengths: [
                "Resume format interacts well with parser",
                `Contains relevant keywords for ${role}`,
                "Clear professional experience section detected"
            ],
            improvements: [
                "Include more quantifiable achievements",
                "Add a dedicated skills section if missing",
                "Tailor resume summary to the specific job description"
            ]
        };

        const { error } = await supabase
            .from("user_assessments")
            .insert({
                user_id: user.id,
                target_role: role,
                resume_text: text, // Storing parsed text for potential future analysis
                score: score,
                feedback: feedback,
            });

        if (error) {
            console.error("Database error:", error);
            return { error: "Failed to save assessment" };
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/career");
        return { success: true };

    } catch (error) {
        console.error("Resume upload error:", error);
        return { error: "Failed to process resume" };
    }
}
