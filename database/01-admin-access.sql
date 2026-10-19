-- MONSELA: additive admin UI authorization setup.
-- Run in Supabase SQL Editor as the database owner BEFORE deploying the new admin page.
-- This file DOES NOT replace/audit existing store RLS policies or place_order.
-- Replace OWNER_EMAIL_HERE with the EXISTING owner's verified auth email.
-- No existing catalog, customer or order rows are modified.
BEGIN;
CREATE TABLE IF NOT EXISTS public.monsela_admin_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.monsela_admin_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.monsela_admin_members FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.monsela_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.monsela_admin_members m WHERE m.user_id = auth.uid()); $$;
REVOKE ALL ON FUNCTION public.monsela_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.monsela_is_admin() TO authenticated;
DO $setup$
DECLARE owner_email text := 'OWNER_EMAIL_HERE'; owner_id uuid;
BEGIN
  IF owner_email = 'OWNER_EMAIL_HERE' THEN
    RAISE EXCEPTION 'Replace OWNER_EMAIL_HERE with your existing verified administrator email before running.';
  END IF;
  SELECT id INTO owner_id FROM auth.users
    WHERE lower(email)=lower(owner_email) AND email_confirmed_at IS NOT NULL;
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Existing verified owner not found. Nothing was committed.'; END IF;
  INSERT INTO public.monsela_admin_members(user_id) VALUES(owner_id) ON CONFLICT DO NOTHING;
END $setup$;
NOTIFY pgrst, 'reload schema';
COMMIT;
