-- Allow authenticated users to delete feedback (admin will use this)
CREATE POLICY "Authenticated users can delete feedback"
ON public.feedback_and_testimonials
FOR DELETE
USING (true);
