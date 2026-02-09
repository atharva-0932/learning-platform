export async function parseResume(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse resume");
    }

    return response.json();
}

export async function syncProfile(userId: string, profile: any, skills: string[]) {
    const response = await fetch("/api/sync-profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            profile,
            skills,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync profile");
    }

    return response.json();
}
export async function getCareerAssessment(userId: string, targetRole: string, resumeText: string) {
    const response = await fetch("/api/career-assessment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            target_role: targetRole,
            resume_text: resumeText,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get career assessment");
    }

    return response.json();
}
