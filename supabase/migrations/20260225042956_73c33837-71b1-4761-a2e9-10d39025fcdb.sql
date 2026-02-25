-- Add explicit deny policies to prevent privilege escalation on user_roles
CREATE POLICY "Prevent user role self-assignment"
  ON public.user_roles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Prevent user role modification"
  ON public.user_roles FOR UPDATE
  USING (false);

CREATE POLICY "Prevent user role deletion"
  ON public.user_roles FOR DELETE
  USING (false);