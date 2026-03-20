-- Add new status values for job application color coding
-- Status colors: rejected=red, ghosted=slate, waiting_to_hear_back=amber, interview_called=blue, shortlisted=green
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_status_check CHECK (status IN (
  'applied', 'ghosted', 'waiting_to_hear_back', 'interview_called', 'shortlisted',
  'interviewing', 'offer', 'rejected', 'withdrawn'
));
