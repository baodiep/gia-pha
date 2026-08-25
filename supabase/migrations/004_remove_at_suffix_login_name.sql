-- Migration: Update profiles constraint and data to remove @ suffix from login_name
-- Run this in Supabase SQL editor if database contains previous @ suffix data

-- 1. Remove existing constraint
alter table public.profiles drop constraint if exists login_name_phone_suffix;

-- 2. Clean existing data in profiles table
update public.profiles 
set login_name = rtrim(login_name, '@') 
where login_name like '%@';

-- 3. Add clean constraint matching normalized phone
alter table public.profiles 
add constraint login_name_phone_match check (login_name = phone_normalized);
