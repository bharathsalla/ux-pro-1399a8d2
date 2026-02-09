-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can update approval status" ON public.feedback_and_testimonials;

-- The existing "Users can update own feedback" policy already covers user updates.
-- For admin approval, we use a broader authenticated policy since admin is passcode-based.
CREATE POLICY "Authenticated users can update feedback"
ON public.feedback_and_testimonials
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);