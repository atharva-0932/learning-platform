-- Create job_applications table for Smart Follow-Up tracking
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  optimal_follow_up_at TIMESTAMP WITH TIME ZONE,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  job_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for efficient user lookups
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_optimal_follow_up ON public.job_applications(optimal_follow_up_at) WHERE optimal_follow_up_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own job applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job applications" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications" ON public.job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications" ON public.job_applications
  FOR DELETE USING (auth.uid() = user_id);
