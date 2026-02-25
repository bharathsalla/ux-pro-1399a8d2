
-- Tighten reactions SELECT policy: users should only see their own reactions
-- Aggregate counts are stored on feedback_and_testimonials table directly
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;

CREATE POLICY "Users can view own reactions"
  ON public.reactions FOR SELECT
  USING (auth.uid() = user_id);
