-- Fix: Tighten room_shares SELECT policy to prevent email enumeration.
-- Remove the email-based matching from the SELECT policy.
-- Users can only see shares where they are explicitly identified by user_id (not email matching).
-- The sender (shared_by) can still see shares they created.
-- The shared_to_email column is still used functionally but cannot be enumerated via SELECT.

DROP POLICY IF EXISTS "Users can view own shares" ON public.room_shares;

CREATE POLICY "Users can view own shares"
ON public.room_shares
FOR SELECT
USING (
  shared_by = auth.uid()
  OR shared_to_user = auth.uid()
);
