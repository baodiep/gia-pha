"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/features/auth/actions";
import {
  parentChildInputSchema,
  ParentChildInput,
  unionInputSchema,
  UnionInput,
} from "./validation";
import { wouldCreateCycle, RelationEdge } from "./cycle-detection";

export type RelationshipActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Add a parent-child relationship
 */
export async function addParentChild(input: ParentChildInput): Promise<RelationshipActionResult> {
  try {
    await requireActiveUser();
    const validated = parentChildInputSchema.parse(input);

    const supabase = await createClient();

    // Fetch existing parent-child relations to prevent cycle
    const { data: existingRelations, error: fetchError } = await supabase
      .from("parent_child")
      .select("parent_id, child_id");

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const edges: RelationEdge[] = (existingRelations || []).map((r) => ({
      parentId: r.parent_id,
      childId: r.child_id,
    }));

    if (wouldCreateCycle(validated.parentId, validated.childId, edges)) {
      return {
        success: false,
        error: "Không thể thêm quan hệ: Việc này sẽ tạo thành vòng lặp phả hệ (cycle detected)",
      };
    }

    const { data, error } = await supabase
      .from("parent_child")
      .insert({
        parent_id: validated.parentId,
        child_id: validated.childId,
        relationship_type: validated.relationshipType,
        is_lineage_relation: validated.isLineageRelation,
        display_order: validated.displayOrder,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Quan hệ cha/mẹ-con này đã tồn tại" };
      }
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data,
      message: "Thêm quan hệ cha/mẹ-con thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi thêm quan hệ",
    };
  }
}

/**
 * Remove parent-child relationship
 */
export async function removeParentChild(parentId: string, childId: string): Promise<RelationshipActionResult> {
  try {
    await requireActiveUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from("parent_child")
      .delete()
      .eq("parent_id", parentId)
      .eq("child_id", childId);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Đã xóa quan hệ cha/mẹ-con",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa quan hệ",
    };
  }
}

/**
 * Add or update union (Spouse/Partner)
 */
export async function addUnion(input: UnionInput): Promise<RelationshipActionResult> {
  try {
    await requireActiveUser();
    const validated = unionInputSchema.parse(input);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("unions")
      .insert({
        partner1_id: validated.partner1Id,
        partner2_id: validated.partner2Id,
        status: validated.status,
        marriage_date: validated.marriageDate || null,
        ended_date: validated.endedDate || null,
        note: validated.note || null,
      })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data,
      message: "Thêm thông tin hôn phối thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi thêm hôn phối",
    };
  }
}

/**
 * Update parent-child display order (Thứ tự con cái: 1, 2, 3...)
 */
export async function updateParentChildOrder(childId: string, displayOrder: number): Promise<RelationshipActionResult> {
  try {
    await requireActiveUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from("parent_child")
      .update({ display_order: displayOrder })
      .eq("child_id", childId);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Cập nhật thứ tự thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật thứ tự",
    };
  }
}

/**
 * Remove union
 */
export async function removeUnion(unionId: string): Promise<RelationshipActionResult> {
  try {
    await requireActiveUser();
    const supabase = await createClient();

    const { error } = await supabase.from("unions").delete().eq("id", unionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Đã xóa quan hệ hôn phối",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa hôn phối",
    };
  }
}
