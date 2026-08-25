"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { personInputSchema, PersonInput } from "./validation";
import { Person } from "@/types/domain";

export type PersonActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Get all active (not soft deleted) persons
 */
export async function getPersons(options?: {
  branchCode?: string;
  generationNo?: number;
  lifeStatus?: string;
  search?: string;
}): Promise<Person[]> {
  await requireActiveUser();
  const supabase = await createClient();

  let query = supabase
    .from("persons")
    .select("*")
    .is("deleted_at", null)
    .order("generation_no", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (options?.branchCode) {
    query = query.eq("branch_code", options.branchCode);
  }
  if (options?.generationNo) {
    query = query.eq("generation_no", options.generationNo);
  }
  if (options?.lifeStatus) {
    query = query.eq("life_status", options.lifeStatus);
  }
  if (options?.search) {
    query = query.ilike("full_name", `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Không thể tải danh sách thành viên: ${error.message}`);
  }

  return (data || []) as Person[];
}

/**
 * Get person detail by ID (only non-deleted)
 */
export async function getPersonById(id: string): Promise<Person | null> {
  await requireActiveUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể tìm thấy thành viên: ${error.message}`);
  }

  return data as Person | null;
}

/**
 * Create new person
 */
export async function createPerson(input: PersonInput): Promise<PersonActionResult<Person>> {
  try {
    await requireActiveUser();
    const validated = personInputSchema.parse(input);

    const supabase = await createClient();

    const insertPayload = {
      full_name: validated.fullName,
      gender: validated.gender,
      life_status: validated.lifeStatus,
      birth_date: validated.birthDate || null,
      death_date: validated.deathDate || null,
      death_lunar_day: validated.deathLunarDay || null,
      death_lunar_month: validated.deathLunarMonth || null,
      death_lunar_is_leap_month: validated.deathLunarIsLeapMonth,
      death_anniversary_note: validated.deathAnniversaryNote || null,
      birth_place: validated.birthPlace || null,
      hometown: validated.hometown || null,
      bio: validated.bio || null,
      avatar_url: validated.avatarUrl || null,
      generation_no: validated.generationNo || null,
      branch_code: validated.branchCode || null,
    };

    const { data, error } = await supabase
      .from("persons")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as Person,
      message: "Thêm thành viên thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo thành viên",
    };
  }
}

/**
 * Update person details
 */
export async function updatePerson(id: string, input: PersonInput): Promise<PersonActionResult<Person>> {
  try {
    await requireActiveUser();
    const validated = personInputSchema.parse(input);

    const supabase = await createClient();

    const updatePayload = {
      full_name: validated.fullName,
      gender: validated.gender,
      life_status: validated.lifeStatus,
      birth_date: validated.birthDate || null,
      death_date: validated.deathDate || null,
      death_lunar_day: validated.deathLunarDay || null,
      death_lunar_month: validated.deathLunarMonth || null,
      death_lunar_is_leap_month: validated.deathLunarIsLeapMonth,
      death_anniversary_note: validated.deathAnniversaryNote || null,
      birth_place: validated.birthPlace || null,
      hometown: validated.hometown || null,
      bio: validated.bio || null,
      avatar_url: validated.avatarUrl || null,
      generation_no: validated.generationNo || null,
      branch_code: validated.branchCode || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("persons")
      .update(updatePayload)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as Person,
      message: "Cập nhật thành viên thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật thành viên",
    };
  }
}

/**
 * Soft delete person (NO HARD DELETE in business UI)
 */
export async function softDeletePerson(id: string): Promise<PersonActionResult> {
  try {
    const { userId } = await requireActiveUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from("persons")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Đã chuyển thành viên vào thùng rác",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa thành viên",
    };
  }
}

/**
 * Restore soft deleted person (Admin or recycle bin feature)
 */
export async function restorePerson(id: string): Promise<PersonActionResult> {
  try {
    const { profile } = await requireActiveUser();
    if (!profile.is_admin) {
      return { success: false, error: "Chỉ Admin mới có quyền khôi phục thành viên" };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("persons")
      .update({
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Khôi phục thành viên thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi khôi phục thành viên",
    };
  }
}
