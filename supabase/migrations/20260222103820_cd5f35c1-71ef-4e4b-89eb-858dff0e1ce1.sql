
-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.bus_pass_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'card',
  transaction_id TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Students can view their own payments
CREATE POLICY "Students can view own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

-- Students can insert own payments
CREATE POLICY "Students can insert own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);
