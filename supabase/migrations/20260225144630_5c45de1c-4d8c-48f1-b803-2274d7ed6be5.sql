-- Fix: Drop the policy that exposes passcode column to all authenticated users on review_rooms.
-- Non-owner authenticated users should use the review_rooms_safe view (which excludes passcode).
-- Owners already have their own SELECT policy ("Creator can view own rooms") that covers all their rooms.
DROP POLICY IF EXISTS "Authenticated users can view non-expired private rooms" ON public.review_rooms;

-- Ensure the safe view is accessible to authenticated users
GRANT SELECT ON public.review_rooms_safe TO authenticated;
GRANT SELECT ON public.review_rooms_safe TO anon;
