-- READ ONLY. Run in Supabase SQL Editor and export the single JSON result.
-- Contains schema/routine definitions, NOT order/customer rows or auth credentials.
-- Review before sharing: an existing routine could contain hardcoded secrets.
SELECT jsonb_build_object(
  'generated_at', now(),
  'tables', (SELECT jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity)) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'),
  'columns', (SELECT jsonb_agg(to_jsonb(x)) FROM (SELECT table_name,column_name,data_type,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position)x),
  'policies', (SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE schemaname IN ('public','storage')),
  'routines', (SELECT jsonb_agg(jsonb_build_object('name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),'security_definer',p.prosecdef,'settings',p.proconfig,'definition',pg_get_functiondef(p.oid),'acl',p.proacl)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f'),
  'grants', (SELECT jsonb_agg(to_jsonb(g)) FROM information_schema.role_table_grants g WHERE g.table_schema='public' AND g.grantee IN ('anon','authenticated','PUBLIC')),
  'triggers', (SELECT jsonb_agg(jsonb_build_object('table',c.relname,'definition',pg_get_triggerdef(t.oid))) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal)
) AS monsela_security_audit;
