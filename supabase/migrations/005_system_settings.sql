-- Migration: Create system_settings table for Logo, Brand Title, and Subtitle customization
create table if not exists public.system_settings (
  id text primary key default 'default',
  app_title text not null default 'Gia Phả Dòng Họ',
  app_subtitle text not null default 'Sơ đồ cây phả hệ',
  logo_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policy 1: Everyone (public & authenticated) can view brand settings
create policy "system_settings_select_all"
  on public.system_settings for select
  using (true);

-- Policy 2: Only Active Admins can update brand settings
create policy "system_settings_update_admin"
  on public.system_settings for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
        and profiles.status = 'ACTIVE'
    )
  );

-- Policy 3: Only Active Admins can insert brand settings
create policy "system_settings_insert_admin"
  on public.system_settings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
        and profiles.status = 'ACTIVE'
    )
  );

-- Seed default initial row
insert into public.system_settings (id, app_title, app_subtitle, logo_url)
values ('default', 'Gia Phả Dòng Họ', 'Sơ đồ cây phả hệ', null)
on conflict (id) do nothing;
