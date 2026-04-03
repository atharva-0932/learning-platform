"use server";

const N8N_WEBHOOK_URL =
  process.env.N8N_FOLLOW_UP_WEBHOOK_URL ||
  "https://nonsocialistic-natisha-slabbery.ngrok-free.dev/webhook/job-follow-up";

export async function triggerAutomatedFollowUp(params: {
  userId: string;
  jobId: string;
  recruiterEmail: string;
  companyName: string;
  jobTitle: string;
}) {
  const { userId, jobId, recruiterEmail, companyName, jobTitle } = params;

  const trimmedEmail = recruiterEmail?.trim();
  if (!trimmedEmail) {
    return { error: "Recruiter email is required to send a follow-up." };
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        recruiterEmail: trimmedEmail,
        companyName: companyName?.trim() || "",
        jobTitle: jobTitle?.trim() || "",
        userId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("n8n webhook error:", response.status, text);
      return { error: `Failed to send follow-up: ${response.statusText}` };
    }

    return { success: true };
  } catch (err) {
    console.error("Follow-up request error:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to send follow-up",
    };
  }
}
