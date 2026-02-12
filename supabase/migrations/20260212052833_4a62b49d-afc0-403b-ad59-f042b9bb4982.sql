
-- Table to track internal room shares between FixUX users
CREATE TABLE public.room_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.review_rooms(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_to_email TEXT NOT NULL,
  shared_to_user UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_shares ENABLE ROW LEVEL SECURITY;

-- Anyone can view shares they sent or received
CREATE POLICY "Users can view own shares"
  ON public.room_shares FOR SELECT
  USING (
    shared_by = auth.uid() OR shared_to_user = auth.uid()
    OR shared_to_email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Authenticated users can create shares
CREATE POLICY "Authenticated users can create shares"
  ON public.room_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

-- Sender can delete shares
CREATE POLICY "Sender can delete shares"
  ON public.room_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- Recipient can update status (e.g. mark as seen)
CREATE POLICY "Recipient can update share status"
  ON public.room_shares FOR UPDATE
  USING (
    shared_to_user = auth.uid()
    OR shared_to_email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_shares;
