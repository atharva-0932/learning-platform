"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerAutomatedFollowUp } from "@/actions/follow-up-actions";
import { updateJobApplication } from "@/lib/api";
import { toast } from "sonner";

interface FollowUpButtonProps {
  userId: string;
  jobId: string;
  recruiterEmail: string | null;
  companyName: string;
  jobTitle: string;
  onSuccess?: () => void;
}

export function FollowUpButton({
  userId,
  jobId,
  recruiterEmail,
  companyName,
  jobTitle,
  onSuccess,
}: FollowUpButtonProps) {
  const [isSending, setIsSending] = useState(false);

  const handleFollowUp = async () => {
    if (!recruiterEmail?.trim()) {
      toast.error("Recruiter email required", {
        description: "Add a recruiter email to this application to send a follow-up.",
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await triggerAutomatedFollowUp({
        userId,
        jobId,
        recruiterEmail: recruiterEmail.trim(),
        companyName,
        jobTitle,
      });

      if (result.error) {
        toast.error("Follow-up failed", { description: result.error });
        return;
      }

      await updateJobApplication(userId, jobId, {
        follow_up_sent: true,
        last_follow_up_at: new Date().toISOString(),
      });

      toast.success("Follow-up sent", {
        description: `A personalized email was drafted and sent for ${companyName}.`,
      });
      onSuccess?.();
    } catch (err) {
      toast.error("Follow-up failed", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleFollowUp}
      disabled={isSending || !recruiterEmail?.trim()}
      title={
        !recruiterEmail?.trim()
          ? "Add recruiter email to enable"
          : "Draft and send a follow-up email via n8n"
      }
    >
      {isSending ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
      ) : (
        <Send className="w-4 h-4 mr-1.5" />
      )}
      {isSending ? "Sending..." : "Follow Up"}
    </Button>
  );
}
