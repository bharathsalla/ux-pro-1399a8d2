
-- Storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

-- Storage policies
CREATE POLICY "Anyone can view room images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

CREATE POLICY "Authenticated users can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'room-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own room images"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Review Rooms table
CREATE TABLE public.review_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  preview_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  passcode TEXT,
  expiry_days INTEGER NOT NULL DEFAULT 7,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_expired BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.review_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-expired public rooms
CREATE POLICY "Anyone can view public rooms"
ON public.review_rooms FOR SELECT
USING (is_private = false AND is_expired = false);

-- Creator can view own rooms (including private/expired)
CREATE POLICY "Creator can view own rooms"
ON public.review_rooms FOR SELECT
USING (auth.uid() = creator_id);

-- Private rooms viewable by anyone (passcode checked in app)
CREATE POLICY "Anyone can view private rooms by ID"
ON public.review_rooms FOR SELECT
USING (is_private = true AND is_expired = false);

-- Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms"
ON public.review_rooms FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Creator can update own rooms
CREATE POLICY "Creator can update own rooms"
ON public.review_rooms FOR UPDATE
USING (auth.uid() = creator_id);

-- Creator can delete own rooms
CREATE POLICY "Creator can delete own rooms"
ON public.review_rooms FOR DELETE
USING (auth.uid() = creator_id);

-- Room Comments table
CREATE TABLE public.room_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.review_rooms(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.room_comments(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL DEFAULT 'Anonymous',
  reviewer_id UUID,
  comment_text TEXT NOT NULL,
  pin_x REAL,
  pin_y REAL,
  pin_number INTEGER,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.room_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on non-expired rooms
CREATE POLICY "Anyone can view room comments"
ON public.room_comments FOR SELECT
USING (true);

-- Anyone can create comments (reviewers don't need login)
CREATE POLICY "Anyone can create room comments"
ON public.room_comments FOR INSERT
WITH CHECK (true);

-- Comment owner or room creator can update (resolve)
CREATE POLICY "Owner can update comments"
ON public.room_comments FOR UPDATE
USING (
  auth.uid() = reviewer_id
  OR auth.uid() IN (SELECT creator_id FROM public.review_rooms WHERE id = room_id)
);

-- Comment owner or room creator can delete
CREATE POLICY "Owner can delete comments"
ON public.room_comments FOR DELETE
USING (
  auth.uid() = reviewer_id
  OR auth.uid() IN (SELECT creator_id FROM public.review_rooms WHERE id = room_id)
);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_comments;
