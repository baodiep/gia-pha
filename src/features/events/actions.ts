"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { getManagedBranches, getEditablePersonIds } from "@/features/permissions/actions";
import { familyEventInputSchema, FamilyEventInput } from "./validation";
import { EventStatus, EventVisibility } from "@/types/domain";

export interface FamilyEvent {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: EventStatus;
  visibility: EventVisibility;
  root_person_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  root_person?: {
    id: string;
    full_name: string;
    branch_code: string | null;
  } | null;
}

export type EventActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Lấy danh sách sự kiện dòng họ theo phân quyền người xem
 */
export async function getFamilyEvents(options?: {
  scope?: "all" | "upcoming" | "past";
}): Promise<FamilyEvent[]> {
  const { profile, userId } = await requireActiveUser();
  const supabase = await createClient();

  const now = new Date().toISOString();

  let query = supabase
    .from("family_events")
    .select("*, root_person:root_person_id(id, full_name, branch_code)")
    .order("starts_at", { ascending: true });

  if (options?.scope === "upcoming") {
    query = query.gte("starts_at", now);
  } else if (options?.scope === "past") {
    query = query.lt("starts_at", now);
  }

  // Non-admin can only see PUBLISHED events
  if (!profile.is_admin) {
    query = query.eq("status", "PUBLISHED");
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Không thể tải danh sách sự kiện: ${error.message}`);
  }

  const events = (data || []) as FamilyEvent[];

  if (profile.is_admin) {
    return events;
  }

  // Filter visibility for regular members:
  // - ALL_MEMBERS: always visible
  // - BRANCH: visible only if root_person_id in editable set / managed branches
  const editableSet = await getEditablePersonIds(userId, false);

  return events.filter((ev) => {
    if (ev.visibility === "ALL_MEMBERS") return true;
    if (ev.visibility === "BRANCH" && ev.root_person_id) {
      return editableSet.has(ev.root_person_id);
    }
    return false;
  });
}

/**
 * Tạo mới sự kiện dòng họ (Admin or Branch Manager)
 */
export async function createFamilyEvent(input: FamilyEventInput): Promise<EventActionResult<FamilyEvent>> {
  try {
    const { profile, userId } = await requireActiveUser();
    const validated = familyEventInputSchema.parse(input);

    // Permission check
    if (!profile.is_admin && validated.visibility === "ADMIN_ONLY") {
      return { success: false, error: "Chỉ Admin mới có quyền tạo sự kiện nội bộ Admin" };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("family_events")
      .insert({
        title: validated.title,
        description: validated.description || null,
        starts_at: validated.startsAt,
        ends_at: validated.endsAt || null,
        location: validated.location || null,
        status: validated.status,
        visibility: validated.visibility,
        root_person_id: validated.rootPersonId || null,
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as FamilyEvent,
      message: "Tạo sự kiện dòng họ thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo sự kiện",
    };
  }
}

/**
 * Cập nhật sự kiện dòng họ
 */
export async function updateFamilyEvent(
  id: string,
  input: FamilyEventInput
): Promise<EventActionResult<FamilyEvent>> {
  try {
    const { profile } = await requireActiveUser();
    const validated = familyEventInputSchema.parse(input);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("family_events")
      .update({
        title: validated.title,
        description: validated.description || null,
        starts_at: validated.startsAt,
        ends_at: validated.endsAt || null,
        location: validated.location || null,
        status: validated.status,
        visibility: validated.visibility,
        root_person_id: validated.rootPersonId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as FamilyEvent,
      message: "Cập nhật sự kiện thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật sự kiện",
    };
  }
}

/**
 * Hủy sự kiện
 */
export async function cancelFamilyEvent(id: string): Promise<EventActionResult> {
  try {
    await requireActiveUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from("family_events")
      .update({
        status: "CANCELLED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Đã hủy sự kiện",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi hủy sự kiện",
    };
  }
}
