-- Fix function search path security warning
DROP FUNCTION IF EXISTS public.cleanup_old_scans();

CREATE OR REPLACE FUNCTION public.cleanup_old_scans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.scans
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;