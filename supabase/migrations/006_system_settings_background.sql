-- Migration: Add tree_background_url column to system_settings table
alter table public.system_settings 
add column if not exists tree_background_url text;
