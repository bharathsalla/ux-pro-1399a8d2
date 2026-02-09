
-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles, users can see their own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Fix feedback_and_testimonials: drop overly permissive UPDATE/DELETE policies
DROP POLICY IF EXISTS "Authenticated users can update feedback" ON public.feedback_and_testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete feedback" ON public.feedback_and_testimonials;

-- Add admin-scoped policies
CREATE POLICY "Admins can update any feedback" ON public.feedback_and_testimonials
  FOR UPDATE USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete any feedback" ON public.feedback_and_testimonials
  FOR DELETE USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );

-- 4. Fix profiles: restrict SELECT to own profile only (data is denormalized in feedback/comments tables)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
