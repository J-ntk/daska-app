-- ============================================================
-- Phase 8 migration — run this in Supabase SQL Editor
-- (adds language preference for i18n)
-- ============================================================

alter table profiles add column if not exists language text not null default 'en'
  check (language in ('en','el','ru','uk','de','fr','it','es','zh','ja'));
