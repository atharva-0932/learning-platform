-- Optional override for Pip checkpoint / quiz result emails (falls back to auth email when null).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quiz_notification_email TEXT;

COMMENT ON COLUMN public.profiles.quiz_notification_email IS 'If set, quiz result emails go here; otherwise use auth user email.';
