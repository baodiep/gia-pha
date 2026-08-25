export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type LifeStatus = "LIVING" | "DECEASED" | "UNKNOWN";
export type ParentRelationshipType = "BIOLOGICAL" | "ADOPTED" | "STEP";
export type UnionStatus = "MARRIED" | "PARTNER" | "DIVORCED" | "ENDED";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type EventVisibility = "ALL_MEMBERS" | "BRANCH" | "ADMIN_ONLY";

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


