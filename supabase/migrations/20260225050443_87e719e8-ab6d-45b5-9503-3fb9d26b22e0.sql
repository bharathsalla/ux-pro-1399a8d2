-- Allow authenticated users to view private rooms (they'll access via review_rooms_safe which excludes passcode)
-- Passcode verification happens via the verify_room_passcode RPC function
CREATE POLICY "Authenticated users can view non-expired private rooms"
  ON public.review_rooms FOR SELECT
  USING (is_private = true AND is_expired = false AND auth.uid() IS NOT NULL);
