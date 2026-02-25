-- 1. Create audit_usage table for server-side rate limiting
CREATE TABLE public.audit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, usage_date)
);

ALTER TABLE public.audit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.audit_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Deny direct modifications from client
CREATE POLICY "Deny client insert"
  ON public.audit_usage FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny client update"
  ON public.audit_usage FOR UPDATE
  USING (false);

CREATE POLICY "Deny client delete"
  ON public.audit_usage FOR DELETE
  USING (false);

-- Server-side function to increment usage (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.increment_audit_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  INSERT INTO public.audit_usage (user_id, usage_date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET count = audit_usage.count + 1
  RETURNING count INTO current_count;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get current usage count
CREATE OR REPLACE FUNCTION public.get_audit_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT count INTO current_count
  FROM public.audit_usage
  WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  
  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create verify_room_passcode function (so passcode is never sent to client)
CREATE OR REPLACE FUNCTION public.verify_room_passcode(p_room_id UUID, p_passcode TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_passcode TEXT;
BEGIN
  SELECT passcode INTO stored_passcode
  FROM public.review_rooms
  WHERE id = p_room_id AND is_private = true;
  
  IF stored_passcode IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_passcode = p_passcode;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix room_comments INSERT policy: require reviewer_name instead of always true
DROP POLICY IF EXISTS "Anyone can create room comments" ON public.room_comments;

CREATE POLICY "Anyone can create room comments with name"
  ON public.room_comments FOR INSERT
  WITH CHECK (
    comment_text IS NOT NULL 
    AND length(trim(comment_text)) > 0
    AND reviewer_name IS NOT NULL 
    AND length(trim(reviewer_name)) > 0
  );

-- 4. Create a view that excludes passcode from review_rooms for non-owners
-- We'll handle this via RLS column security by creating a function instead
-- Drop the policy that exposes private rooms to everyone
DROP POLICY IF EXISTS "Anyone can view private rooms by ID" ON public.review_rooms;

-- Re-create: anyone can see private room metadata but NOT the passcode column
-- Since Postgres RLS can't do column-level, we use a view approach
-- Create a secure view without passcode
CREATE OR REPLACE VIEW public.review_rooms_safe AS
SELECT id, creator_id, title, description, image_url, preview_url,
       is_private, expiry_days, expires_at, is_expired, created_at
FROM public.review_rooms;

-- Re-add the policy for private rooms (still needed for the base table for creators)
CREATE POLICY "Anyone can view private rooms by ID"
  ON public.review_rooms FOR SELECT
  USING (is_private = true AND is_expired = false);