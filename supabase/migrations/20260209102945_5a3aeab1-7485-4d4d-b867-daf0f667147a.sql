-- Add profile_link and is_approved columns to feedback_and_testimonials
ALTER TABLE public.feedback_and_testimonials 
ADD COLUMN profile_link TEXT NOT NULL DEFAULT '',
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Update RLS: allow admins (or anyone for now) to update approval status
-- Since admin is passcode-based (not auth-based), we allow authenticated users to update
CREATE POLICY "Anyone can update approval status"
ON public.feedback_and_testimonials
FOR UPDATE
USING (true)
WITH CHECK (true);