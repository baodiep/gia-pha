"use server";

import { createClient } from "@/lib/supabase/server";
import { findShortestKinshipPath, KinshipPathResult, KinshipNode, ParentChildRel, UnionRel } from "./engine";

export async function calculateKinshipPathAction(
  sourcePersonId: string,
  targetPersonId: string
): Promise<{
  success: boolean;
  data?: KinshipPathResult;
  error?: string;
}> {
  try {
    if (!sourcePersonId || !targetPersonId) {
      return { success: false, error: "Vui lòng chọn đủ 2 thành viên để tra cứu quan hệ" };
    }

    const supabase = await createClient();

    const [personsRes, pcRes, unionsRes] = await Promise.all([
      supabase.from("persons").select("id, full_name, gender, generation_no").is("deleted_at", null),
      supabase.from("parent_child").select("parent_id, child_id, is_lineage_relation"),
      supabase.from("unions").select("partner1_id, partner2_id"),
    ]);

    if (personsRes.error || !personsRes.data) {
      return { success: false, error: "Không thể tải danh sách thành viên" };
    }

    const persons: KinshipNode[] = personsRes.data.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      gender: p.gender,
      generationNo: p.generation_no,
    }));

    const parentChildList: ParentChildRel[] = (pcRes.data || []).map((pc) => ({
      parentId: pc.parent_id,
      childId: pc.child_id,
      isLineage: pc.is_lineage_relation,
    }));

    const unionsList: UnionRel[] = (unionsRes.data || []).map((u) => ({
      partner1Id: u.partner1_id,
      partner2Id: u.partner2_id,
    }));

    const result = findShortestKinshipPath(sourcePersonId, targetPersonId, persons, parentChildList, unionsList);

    if (!result) {
      return { success: false, error: "Không tìm thấy thông tin một trong hai thành viên" };
    }

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Có lỗi xảy ra khi tính toán quan hệ",
    };
  }
}
