
-- Add rectangle dimensions to room_comments for area-based annotations
ALTER TABLE public.room_comments
ADD COLUMN rect_w numeric DEFAULT NULL,
ADD COLUMN rect_h numeric DEFAULT NULL;
