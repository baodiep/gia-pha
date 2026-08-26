export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type LifeStatus = "LIVING" | "DECEASED" | "UNKNOWN";
export type ParentRelationshipType = "BIOLOGICAL" | "ADOPTED" | "STEP";
export type UnionStatus = "MARRIED" | "PARTNER" | "DIVORCED" | "ENDED";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type EventVisibility = "ALL_MEMBERS" | "BRANCH" | "ADMIN_ONLY";

// MVP2 Enums
export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProfileChangeStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PasswordResetStatus = "PENDING" | "COMPLETED" | "REJECTED" | "EXPIRED";
export type ResourceType = "ALBUM" | "DOCUMENT" | "VIDEO" | "WEBSITE" | "OTHER";
export type RsvpStatus = "GOING" | "MAYBE" | "DECLINED";
export type NotificationType =
  | "SYSTEM"
  | "CLAIM_REQUEST"
  | "CLAIM_RESOLVED"
  | "PROFILE_CHANGE_REQUEST"
  | "PROFILE_CHANGE_RESOLVED"
  | "PASSWORD_RESET_REQUEST"
  | "EVENT_REMINDER"
  | "MEMORIAL_REMINDER"
  | "CONTRIBUTION_NEW";

export interface Profile {
  id: string;
  phone_normalized: string;
  login_name: string;
  person_id: string | null;
  status: AccountStatus;
  is_admin: boolean;
  must_change_password: boolean;
  activated_at: string | null;
  activated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  full_name: string;
  gender: Gender;
  life_status: LifeStatus;
  birth_date: string | null;
  death_date: string | null;
  death_lunar_day: number | null;
  death_lunar_month: number | null;
  death_lunar_is_leap_month: boolean;
  death_anniversary_note: string | null;
  birth_place: string | null;
  hometown: string | null;
  bio: string | null;
  avatar_url: string | null;
  generation_no: number | null;
  branch_code: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface BranchGrant {
  id: string;
  user_id: string;
  root_person_id: string;
  granted_by: string;
  created_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
}

export interface PersonClaimRequest {
  id: string;
  user_id: string;
  person_id: string;
  note: string | null;
  status: ClaimStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileChangeRequest {
  id: string;
  user_id: string;
  person_id: string;
  requested_changes: Record<string, unknown>;
  reason: string | null;
  status: ProfileChangeStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface PasswordResetRequest {
  id: string;
  phone_input: string;
  phone_normalized: string;
  user_id: string | null;
  status: PasswordResetStatus;
  note: string | null;
  ip_address: string | null;
  user_agent: string | null;
  handled_by: string | null;
  handled_at: string | null;
  handle_method: "RANDOM_8_DIGIT" | "MANUAL" | "REJECTED" | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  url: string;
  thumbnail_url: string | null;
  is_published: boolean;
  display_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  guest_count: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link_url: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  inapp_enabled: boolean;
  push_enabled: boolean;
  memorial_reminder_days: number;
  event_reminder_days: number;
  contribution_notify: boolean;
  updated_at: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_token: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributionSettings {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_code_url: string | null;
  fund_purpose_title: string;
  fund_description: string | null;
  transfer_syntax_guide: string | null;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface Contribution {
  id: string;
  contributor_name: string;
  phone: string | null;
  phone_normalized: string | null;
  user_id: string | null;
  person_id: string | null;
  amount: number;
  purpose: string;
  contribution_date: string;
  receipt_code: string | null;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}



