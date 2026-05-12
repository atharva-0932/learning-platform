-- Async roadmap generation queue (producer: FastAPI, consumer: AWS worker).

CREATE TABLE IF NOT EXISTS public.roadmap_generation_jobs (
  job_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  context JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  error_message TEXT,
  result_bundle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roadmap_generation_jobs IS
  'Archie roadmap generator jobs enqueued via SQS; backend service_role writes, worker completes.';

CREATE INDEX IF NOT EXISTS idx_roadmap_generation_jobs_status_created
  ON public.roadmap_generation_jobs (status, created_at DESC);

ALTER TABLE public.roadmap_generation_jobs ENABLE ROW LEVEL SECURITY;
