-- Migration: Add menu_visibility column to system_settings for toggling nav menu items
alter table public.system_settings
  add column if not exists menu_visibility jsonb not null default '{"tree": true, "events": true, "memorials": true}'::jsonb;
