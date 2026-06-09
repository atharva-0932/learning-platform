-- Job Ready portal one-time unlock via Razorpay Standard Checkout

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS job_ready_portal_unlocked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.job_ready_portal_unlocked_at IS
  'Set when user completes Razorpay payment for the Job Ready portal (company research, mock interview, job listings).';

CREATE TABLE IF NOT EXISTS public.razorpay_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 100),
  currency TEXT NOT NULL DEFAULT 'INR',
  receipt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  razorpay_payment_id TEXT,
  product TEXT NOT NULL DEFAULT 'job_ready_portal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS razorpay_orders_user_id_idx ON public.razorpay_orders(user_id);
CREATE INDEX IF NOT EXISTS razorpay_orders_status_idx ON public.razorpay_orders(status);

ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY razorpay_orders_select_own ON public.razorpay_orders
  FOR SELECT
  USING (auth.uid() = user_id);
