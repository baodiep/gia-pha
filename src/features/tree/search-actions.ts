"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/features/auth/actions";
import { Person } from "@/types/domain";

export interface SearchPersonResult {
  id: string;
  fullName: string;
  gender: string;
  lifeStatus: string;
  birthDate: string | null;
  deathDate: string | null;
  generationNo: number | null;
  branchCode: string | null;
  avatarUrl: string | null;
}

export interface AncestorPathResult {
  targetPersonId: string;
  ancestorIds: string[]; // List of person IDs from root down to target
  subtreePersonIds: string[]; // Target person + direct relatives
}

/**
 * Tìm kiếm thành viên theo từ khóa (họ tên, chi nhánh, đời, năm sinh)
 */
export async function searchPersons(query: string): Promise<SearchPersonResult[]> {
  await requireActiveUser();
  if (!query || query.trim().length === 0) {
    return [];
  }

  const supabase = await createClient();
  const trimmed = query.trim();

  // Parse if query is a year (e.g. 1980) or generation number
  const isNumeric = /^\d+$/.test(trimmed);
  const numValue = isNumeric ? parseInt(trimmed, 10) : null;

  let dbQuery = supabase
    .from("persons")
    .select("id, full_name, gender, life_status, birth_date, death_date, generation_no, branch_code, avatar_url")
    .is("deleted_at", null);

  if (isNumeric && numValue !== null) {
    if (numValue <= 100) {
      // Could be generation number or year
      dbQuery = dbQuery.or(`full_name.ilike.%${trimmed}%,branch_code.ilike.%${trimmed}%,generation_no.eq.${numValue}`);
    } else {
      // Year search (e.g. birth_date starts with 1980)
      dbQuery = dbQuery.or(`full_name.ilike.%${trimmed}%,branch_code.ilike.%${trimmed}%,birth_date.gte.${trimmed}-01-01,birth_date.lte.${trimmed}-12-31`);
    }
  } else {
    dbQuery = dbQuery.or(`full_name.ilike.%${trimmed}%,branch_code.ilike.%${trimmed}%,hometown.ilike.%${trimmed}%`);
  }

  const { data, error } = await dbQuery.limit(20);
  if (error) {
    throw new Error(`Tìm kiếm thất bại: ${error.message}`);
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    fullName: p.full_name,
    gender: p.gender,
    lifeStatus: p.life_status,
    birthDate: p.birth_date,
    deathDate: p.death_date,
    generationNo: p.generation_no,
    branchCode: p.branch_code,
    avatarUrl: p.avatar_url,
  }));
}

/**
 * Lấy đường dẫn tổ tiên (Ancestor path) và subtree cần thiết để render và focus node trên cây
 */
export async function getAncestorPath(targetPersonId: string): Promise<AncestorPathResult> {
  await requireActiveUser();
  const supabase = await createClient();

  // Query parent_child relations
  const { data: relations } = await supabase
    .from("parent_child")
    .select("parent_id, child_id, is_lineage_relation");

  const rels = relations || [];

  // Find all ancestors of targetPersonId
  const ancestorSet = new Set<string>();
  const queue = [targetPersonId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const r of rels) {
      if (r.child_id === current && !ancestorSet.has(r.parent_id)) {
        ancestorSet.add(r.parent_id);
        queue.push(r.parent_id);
      }
    }
  }

  // Find direct children and spouses of targetPersonId
  const subtreeSet = new Set<string>([targetPersonId, ...ancestorSet]);
  for (const r of rels) {
    if (r.parent_id === targetPersonId) {
      subtreeSet.add(r.child_id);
    }
  }

  return {
    targetPersonId,
    ancestorIds: Array.from(ancestorSet),
    subtreePersonIds: Array.from(subtreeSet),
  };
}
