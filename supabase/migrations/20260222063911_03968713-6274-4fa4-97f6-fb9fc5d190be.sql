-- Allow students to update payment_status on their own applications
CREATE POLICY "Students can update own payment_status"
ON public.bus_pass_applications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);