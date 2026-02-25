-- Fix 1: Remove overly permissive private rooms policy that exposes passcodes
DROP POLICY IF EXISTS "Anyone can view private rooms by ID" ON public.review_rooms;

-- Replace with: only allow viewing private rooms through the safe view (creator already has a separate policy)
-- Non-owners access private rooms via review_rooms_safe view which excludes passcode

-- Fix 2: Restrict comments to authenticated users only (prevent public PII scraping)
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Authenticated users can view comments"
  ON public.comments FOR SELECT
  USING (auth.uid() IS NOT NULL);
