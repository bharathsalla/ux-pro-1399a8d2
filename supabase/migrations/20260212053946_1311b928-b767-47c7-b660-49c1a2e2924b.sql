
-- Add passcode column to room_shares so internal shares can include the room passcode
ALTER TABLE public.room_shares ADD COLUMN passcode TEXT DEFAULT NULL;
