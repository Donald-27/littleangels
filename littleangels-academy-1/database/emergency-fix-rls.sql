-- EMERGENCY FIX FOR INFINITE RECURSION IN RLS POLICIES
-- Run these commands in Supabase SQL Editor to immediately unblock all dashboard functionality

-- ===========================================
-- STEP 1: EMERGENCY UNBLOCK (Run First!)
-- ===========================================
-- Safely disable RLS on users by revoking grants first
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.users FROM authenticated, anon;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 2: DIAGNOSTIC QUERIES (Optional)
-- ===========================================
-- Run these to see what's causing the recursion:

-- Show current users policies
SELECT polname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- Find functions that read from users
SELECT n.nspname, p.proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '% from users %';

-- Find any policy in any table that references users
SELECT schemaname, tablename, polname, qual, with_check
FROM pg_policies
WHERE qual ILIKE '%users%' OR with_check ILIKE '%users%';

-- ===========================================
-- STEP 3: INSTALL JWT-BASED HELPERS
-- ===========================================
-- Create non-recursive helper functions that only use JWT claims
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_school_id() 
RETURNS uuid 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'school_id')::uuid,
                  '00000000-0000-0000-0000-000000000000'::uuid)
$$;

CREATE OR REPLACE FUNCTION app.current_role() 
RETURNS user_role 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::user_role,
                  'parent'::user_role)
$$;

CREATE OR REPLACE FUNCTION app.is_admin() 
RETURNS boolean 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER AS $$
  SELECT app.current_role() = 'admin'::user_role
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA app TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app.current_school_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app.current_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app.is_admin() TO anon, authenticated;

-- ===========================================
-- STEP 4: RESET USERS POLICIES 
-- ===========================================
-- Drop all existing users policies (these are recursive)
DO $$ 
DECLARE pol record; 
BEGIN
  FOR pol IN SELECT polname FROM pg_policies WHERE schemaname='public' AND tablename='users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.polname);
  END LOOP;
END $$;

-- Create new non-recursive policies using JWT helpers only
CREATE POLICY "Users can view their profile and school users" ON public.users
  FOR SELECT USING (
    id = auth.uid() OR
    (school_id = app.current_school_id() AND app.current_role() IN ('admin','teacher'))
  );

CREATE POLICY "Users can update their profile" ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (school_id = app.current_school_id());

CREATE POLICY "Admins can manage school users" ON public.users
  FOR ALL USING (school_id = app.current_school_id() AND app.is_admin())
  WITH CHECK (school_id = app.current_school_id() AND app.is_admin());

-- ===========================================
-- STEP 5: RE-ENABLE RLS AND RESTORE GRANTS
-- ===========================================
-- Restore security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- ===========================================
-- STEP 6: VALIDATION TESTS
-- ===========================================
-- Test the fix (these should work without recursion)
SELECT app.current_role(), app.current_school_id();
SELECT 1 FROM public.users WHERE id = auth.uid();
SELECT count(*) FROM public.vehicles;
SELECT count(*) FROM public.students;

-- If all tests pass, the infinite recursion is fixed!