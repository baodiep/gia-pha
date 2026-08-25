-- Initial domain schema for Gia Pha MVP 1
create extension if not exists pgcrypto;

create type public.account_status as enum ('PENDING', 'ACTIVE', 'SUSPENDED');
create type public.gender_type as enum ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
create type public.life_status_type as enum ('LIVING', 'DECEASED', 'UNKNOWN');
create type public.parent_relationship_type as enum ('BIOLOGICAL', 'ADOPTED', 'STEP');
create type public.union_status_type as enum ('MARRIED', 'PARTNER', 'DIVORCED', 'ENDED');
create type public.event_status_type as enum ('DRAFT', 'PUBLISHED', 'CANCELLED');
create type public.event_visibility_type as enum ('ALL_MEMBERS', 'BRANCH', 'ADMIN_ONLY');

create table public.persons (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender public.gender_type not null default 'UNKNOWN',
  life_status public.life_status_type not null default 'UNKNOWN',
  birth_date date,
  death_date date,
  death_lunar_day smallint check (death_lunar_day between 1 and 30),
  death_lunar_month smallint check (death_lunar_month between 1 and 12),
  death_lunar_is_leap_month boolean not null default false,
  death_anniversary_note text,
  birth_place text,
  hometown text,
  bio text,
  avatar_url text,
  generation_no integer,
  branch_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  phone_normalized text not null unique,
  login_name text not null unique,
  person_id uuid unique references public.persons(id) on delete set null,
  status public.account_status not null default 'PENDING',
  is_admin boolean not null default false,
  must_change_password boolean not null default false,
  activated_at timestamptz,
  activated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint login_name_phone_suffix check (login_name = phone_normalized || '@')
);

create table public.parent_child (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.persons(id) on delete restrict,
  child_id uuid not null references public.persons(id) on delete restrict,
  relationship_type public.parent_relationship_type not null default 'BIOLOGICAL',
  is_lineage_relation boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(parent_id, child_id),
  check (parent_id <> child_id)
);

create index idx_parent_child_parent on public.parent_child(parent_id);
create index idx_parent_child_child on public.parent_child(child_id);
create index idx_parent_child_lineage on public.parent_child(parent_id, child_id) where is_lineage_relation = true;

create table public.unions (
  id uuid primary key default gen_random_uuid(),
  partner1_id uuid not null references public.persons(id) on delete restrict,
  partner2_id uuid not null references public.persons(id) on delete restrict,
  status public.union_status_type not null default 'MARRIED',
  marriage_date date,
  ended_date date,
  note text,
  created_at timestamptz not null default now(),
  check (partner1_id <> partner2_id)
);

create index idx_unions_partner1 on public.unions(partner1_id);
create index idx_unions_partner2 on public.unions(partner2_id);

create table public.branch_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  root_person_id uuid not null references public.persons(id) on delete restrict,
  granted_by uuid not null references auth.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id)
);

create unique index uq_branch_grants_active_user_root on public.branch_grants(user_id, root_person_id) where revoked_at is null;
create index idx_branch_grants_active_user on public.branch_grants(user_id) where revoked_at is null;
create index idx_branch_grants_active_root on public.branch_grants(root_person_id) where revoked_at is null;

create table public.family_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  status public.event_status_type not null default 'DRAFT',
  visibility public.event_visibility_type not null default 'ALL_MEMBERS',
  root_person_id uuid references public.persons(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((visibility = 'BRANCH' and root_person_id is not null) or (visibility <> 'BRANCH')),
  check (ends_at is null or ends_at >= starts_at)
);

create index idx_family_events_starts_at on public.family_events(starts_at);
create index idx_family_events_status on public.family_events(status);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- Descendants on the lineage graph; includes root.
create or replace function public.get_lineage_descendants(p_root_person_id uuid)
returns table(person_id uuid)
language sql
stable
security invoker
as $$
  with recursive descendants(person_id) as (
    select p_root_person_id
    union
    select pc.child_id
    from public.parent_child pc
    join descendants d on pc.parent_id = d.person_id
    where pc.is_lineage_relation = true
  )
  select person_id from descendants;
$$;

-- RLS enabled now; concrete policies are added by security task after auth helpers are implemented.
alter table public.persons enable row level security;
alter table public.profiles enable row level security;
alter table public.parent_child enable row level security;
alter table public.unions enable row level security;
alter table public.branch_grants enable row level security;
alter table public.family_events enable row level security;
alter table public.audit_logs enable row level security;
