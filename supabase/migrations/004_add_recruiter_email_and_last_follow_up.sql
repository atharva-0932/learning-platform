-- Add recruiter_email and last_follow_up_at for Automated Follow-up feature
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS recruiter_email TEXT,
  ADD COLUMN IF NOT EXISTS last_follow_up_at TIMESTAMP WITH TIME ZONE;
