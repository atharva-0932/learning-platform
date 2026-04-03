async function parseErrorResponse(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  try {
    const err = JSON.parse(text) as { error?: string };
    return err.error || fallback;
  } catch {
    return text || `${response.status} ${response.statusText}` || fallback;
  }
}

export async function parseResume(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to parse resume"));
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
        throw new Error(await parseErrorResponse(response, "Failed to sync profile"));
    }

    return response.json();
}
export async function updateRoadmapProgress(userId: string, milestoneTitle: string, completed: boolean) {
    const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, milestone_title: milestoneTitle, completed }),
    });
    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to update progress"));
    }
}

export async function getRoadmap(userId: string, targetRole?: string) {
    const params = new URLSearchParams({ user_id: userId });
    if (targetRole) params.set("target_role", targetRole);
    const response = await fetch(`/api/roadmap?${params}`);
    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to fetch roadmap"));
    }
    return response.json();
}

export async function getJobApplications(userId: string) {
    const response = await fetch(`/api/job-applications?user_id=${userId}`);
    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to fetch job applications"));
    }
    return response.json();
}

export async function createJobApplication(userId: string, data: { company: string; role: string; applied_at?: string; optimal_follow_up_at?: string; notes?: string; job_url?: string; status?: string; recruiter_email?: string }) {
    const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ...data }),
    });
    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to create job application"));
    }
    return response.json();
}

export async function updateJobApplication(userId: string, id: string, data: Partial<{ company: string; role: string; applied_at: string; optimal_follow_up_at: string; status: string; follow_up_sent: boolean; notes: string; job_url: string; recruiter_email: string; last_follow_up_at: string }>) {
    const response = await fetch(`/api/job-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ...data }),
    });
    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to update job application"));
    }
    return response.json();
}

export async function deleteJobApplication(userId: string, id: string) {
    const response = await fetch(`/api/job-applications/${id}?user_id=${userId}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, "Failed to delete job application"));
    }
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
        throw new Error(await parseErrorResponse(response, "Failed to get career assessment"));
    }

    return response.json();
}
