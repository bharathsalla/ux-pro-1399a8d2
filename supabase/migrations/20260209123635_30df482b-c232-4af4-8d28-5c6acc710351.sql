
-- Fix: Only show approved feedback publicly, users can see their own
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback_and_testimonials;

CREATE POLICY "Public can view approved feedback or own" 
  ON public.feedback_and_testimonials
  FOR SELECT 
  USING (is_approved = true OR auth.uid() = user_id);
