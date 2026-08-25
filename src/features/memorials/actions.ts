"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/features/auth/actions";

export interface MemorialPerson {
  id: string;
  fullName: string;
  gender: string;
  birthDate: string | null;
  deathDate: string | null;
  deathLunarDay: number | null;
  deathLunarMonth: number | null;
  deathLunarIsLeapMonth: boolean;
  deathAnniversaryNote: string | null;
  generationNo: number | null;
  branchCode: string | null;
  avatarUrl: string | null;
  hometown: string | null;
  birthPlace: string | null;
}

export interface MemorialFilterOptions {
  branchCode?: string;
  generationNo?: number;
  search?: string;
}

/**
 * Lấy danh sách thành viên đã mất (DECEASED) phục vụ trang Memorials
 */
export async function getDeceasedMembers(
  options?: MemorialFilterOptions
): Promise<MemorialPerson[]> {
  await requireActiveUser();
  const supabase = await createClient();

  let query = supabase
    .from("persons")
    .select("id, full_name, gender, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, generation_no, branch_code, avatar_url, hometown, birth_place")
    .eq("life_status", "DECEASED")
    .is("deleted_at", null)
    .order("generation_no", { ascending: true, nullsFirst: false })
    .order("death_date", { ascending: false, nullsFirst: false });

  if (options?.branchCode) {
    query = query.eq("branch_code", options.branchCode);
  }
  if (options?.generationNo) {
    query = query.eq("generation_no", options.generationNo);
  }
  if (options?.search) {
    query = query.ilike("full_name", `%${options.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Không thể tải danh sách ngày giỗ tưởng niệm: ${error.message}`);
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    fullName: p.full_name,
    gender: p.gender,
    birthDate: p.birth_date,
    deathDate: p.death_date,
    deathLunarDay: p.death_lunar_day,
    deathLunarMonth: p.death_lunar_month,
    deathLunarIsLeapMonth: p.death_lunar_is_leap_month,
    deathAnniversaryNote: p.death_anniversary_note,
    generationNo: p.generation_no,
    branchCode: p.branch_code,
    avatarUrl: p.avatar_url,
    hometown: p.hometown,
    birthPlace: p.birth_place,
  }));
}
