-- Migration 006: MVP2 Database Foundations

-- Enums
create type public.claim_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.profile_change_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.password_reset_status as enum ('PENDING', 'COMPLETED', 'REJECTED', 'EXPIRED');
create type public.resource_type as enum ('ALBUM', 'DOCUMENT', 'VIDEO', 'WEBSITE', 'OTHER');
create type public.rsvp_status as enum ('GOING', 'MAYBE', 'DECLINED');
create type public.notification_type as enum (
  'SYSTEM',
  'CLAIM_REQUEST',
  'CLAIM_RESOLVED',
  'PROFILE_CHANGE_REQUEST',
  'PROFILE_CHANGE_RESOLVED',
  'PASSWORD_RESET_REQUEST',
  'EVENT_REMINDER',
  'MEMORIAL_REMINDER',
  'CONTRIBUTION_NEW'
);

-- 1. Person Claim Requests ("Đây là tôi")
create table public.person_claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.persons(id) on delete cascade,
  note text,
  status public.claim_status not null default 'PENDING',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_person_claim_user on public.person_claim_requests(user_id);
create index idx_person_claim_person on public.person_claim_requests(person_id);
create index idx_person_claim_status on public.person_claim_requests(status);
create index idx_person_claim_created_at on public.person_claim_requests(created_at desc);

-- 2. Profile Change Requests (Đề nghị cập nhật thông tin hồ sơ)
create table public.profile_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.persons(id) on delete cascade,
  requested_changes jsonb not null,
  reason text,
  status public.profile_change_status not null default 'PENDING',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profile_change_user on public.profile_change_requests(user_id);
create index idx_profile_change_person on public.profile_change_requests(person_id);
create index idx_profile_change_status on public.profile_change_requests(status);
create index idx_profile_change_created_at on public.profile_change_requests(created_at desc);

-- 3. Password Reset Requests (Quên mật khẩu & yêu cầu Admin reset)
create table public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  phone_input text not null,
  phone_normalized text not null,
  user_id uuid references auth.users(id) on delete cascade,
  status public.password_reset_status not null default 'PENDING',
  note text,
  ip_address inet,
  user_agent text,
  handled_by uuid references auth.users(id) on delete set null,
  handled_at timestamptz,
  handle_method text check (handle_method in ('RANDOM_8_DIGIT', 'MANUAL', 'REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_password_reset_phone on public.password_reset_requests(phone_normalized);
create index idx_password_reset_status on public.password_reset_requests(status);
create index idx_password_reset_user on public.password_reset_requests(user_id);
create index idx_password_reset_created_at on public.password_reset_requests(created_at desc);

-- 4. External Family Resources & Albums (Tư liệu dòng họ - liên kết ngoài)
create table public.family_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  resource_type public.resource_type not null default 'DOCUMENT',
  url text not null,
  thumbnail_url text,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null
);

create index idx_family_resources_published on public.family_resources(is_published) where deleted_at is null;
create index idx_family_resources_type on public.family_resources(resource_type) where deleted_at is null;
create index idx_family_resources_display_order on public.family_resources(display_order asc, created_at desc);

-- 5. Event Attendees (RSVPs)
create table public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.family_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.rsvp_status not null default 'GOING',
  guest_count integer not null default 0 check (guest_count >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index idx_event_attendees_event on public.event_attendees(event_id);
create index idx_event_attendees_user on public.event_attendees(user_id);
create index idx_event_attendees_status on public.event_attendees(status);

-- 6. Notifications (In-app notifications)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null default 'SYSTEM',
  title text not null,
  body text not null,
  link_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_read on public.notifications(user_id, is_read);
create index idx_notifications_user_created on public.notifications(user_id, created_at desc);

-- 7. Notification Preferences (Cài đặt nhận thông báo)
create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inapp_enabled boolean not null default true,
  push_enabled boolean not null default false,
  memorial_reminder_days integer not null default 3 check (memorial_reminder_days between 0 and 30),
  event_reminder_days integer not null default 3 check (event_reminder_days between 0 and 30),
  contribution_notify boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 8. Browser Push Subscriptions (Web Push)
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_token text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_push_subscriptions_user on public.push_subscriptions(user_id);

-- 9. Contribution Settings (Cấu hình QR & tài khoản quỹ họ)
create table public.contribution_settings (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  qr_code_url text,
  fund_purpose_title text not null default 'Quỹ Dòng Họ',
  fund_description text,
  transfer_syntax_guide text,
  is_active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 10. Contributions (Danh sách đóng góp quỹ họ)
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  contributor_name text not null,
  phone text,
  phone_normalized text,
  user_id uuid references auth.users(id) on delete set null,
  person_id uuid references public.persons(id) on delete set null,
  amount numeric(15, 2) not null check (amount > 0),
  purpose text not null default 'Quỹ dòng họ',
  contribution_date date not null default current_date,
  receipt_code text,
  note text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null
);

create index idx_contributions_date on public.contributions(contribution_date desc) where deleted_at is null;
create index idx_contributions_phone on public.contributions(phone_normalized) where deleted_at is null;
create index idx_contributions_amount on public.contributions(amount) where deleted_at is null;
create index idx_contributions_user on public.contributions(user_id) where deleted_at is null;
create index idx_contributions_person on public.contributions(person_id) where deleted_at is null;
create index idx_contributions_created_at on public.contributions(created_at desc);

-- Enable RLS on all MVP2 tables (policies configured in T022)
alter table public.person_claim_requests enable row level security;
alter table public.profile_change_requests enable row level security;
alter table public.password_reset_requests enable row level security;
alter table public.family_resources enable row level security;
alter table public.event_attendees enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.contribution_settings enable row level security;
alter table public.contributions enable row level security;
