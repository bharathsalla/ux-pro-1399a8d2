-- Fix security definer view by setting it to SECURITY INVOKER
ALTER VIEW public.review_rooms_safe SET (security_invoker = on);