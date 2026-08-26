"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { getEditablePersonIds } from "@/features/permissions/actions";
import { recordAuditLog } from "@/features/admin/audit-actions";
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
 * Move child node to a new parent node (Re-parenting)
 * - Admin: Allowed to move to any valid parent node without restriction.
 * - Branch Manager: Both childId and newParentId MUST be within their authorized branch.
 *   If newParentId is outside the branch, action is blocked with an error prompting them to contact Admin.
 */
export async function moveChildToNewParent(
  childId: string,
  newParentId: string,
  oldParentId?: string
): Promise<RelationshipActionResult> {
  try {
    const { profile, userId } = await requireActiveUser();
    const supabase = await createClient();

    if (childId === newParentId) {
      return { success: false, error: "Không thể chọn chính mình làm cha/mẹ" };
    }

    // 1. Permission checks
    if (!profile.is_admin) {
      const editableSet = await getEditablePersonIds(userId, false);
      if (!editableSet.has(childId)) {
        return {
          success: false,
          error: "Bạn không có quyền quản lý thành viên này để thực hiện di chuyển",
        };
      }
      if (!editableSet.has(newParentId)) {
        return {
          success: false,
          error:
            "Nút cha đích nằm ngoài phạm vi chi nhánh bạn phụ trách. Vui lòng liên hệ Quản trị viên (Admin) để thực hiện di chuyển liên chi nhánh.",
        };
      }
    }

    // 2. Cycle detection check
    const { data: existingRelations, error: fetchError } = await supabase
      .from("parent_child")
      .select("parent_id, child_id");

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Filter out old relation to test new edge
    const edges: RelationEdge[] = (existingRelations || [])
      .filter((r) => !(r.child_id === childId && (!oldParentId || r.parent_id === oldParentId)))
      .map((r) => ({
        parentId: r.parent_id,
        childId: r.child_id,
      }));

    if (wouldCreateCycle(newParentId, childId, edges)) {
      return {
        success: false,
        error: "Không thể di chuyển: Việc này sẽ tạo thành vòng lặp phả hệ (người này không thể là con của chính hậu duệ của mình)",
      };
    }

    // 3. Query existing parent relationships of this child
    const { data: currentParents } = await supabase
      .from("parent_child")
      .select("*")
      .eq("child_id", childId);

    const oldParentList = currentParents || [];

    // 4. Update or replace parent relationship
    if (oldParentId) {
      // Remove specific old parent relation
      await supabase
        .from("parent_child")
        .delete()
        .eq("child_id", childId)
        .eq("parent_id", oldParentId);
    } else if (oldParentList.length > 0) {
      // If no specific oldParentId provided, replace the first lineage relation
      await supabase
        .from("parent_child")
        .delete()
        .eq("child_id", childId);
    }

    // Insert new parent_child relation
    const { data: newRelation, error: insertError } = await supabase
      .from("parent_child")
      .insert({
        parent_id: newParentId,
        child_id: childId,
        relationship_type: "BIOLOGICAL",
        is_lineage_relation: true,
        display_order: 1,
      })
      .select("*")
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // 5. Update generation_no if new parent has generation_no
    const { data: newParent } = await supabase
      .from("persons")
      .select("generation_no")
      .eq("id", newParentId)
      .single();

    if (newParent && typeof newParent.generation_no === "number") {
      await supabase
        .from("persons")
        .update({ generation_no: newParent.generation_no + 1 })
        .eq("id", childId);
    }

    // 6. Record Audit log
    await recordAuditLog({
      action: "MOVE_NODE",
      entityType: "PARENT_CHILD",
      entityId: childId,
      oldValue: { oldParentIds: oldParentList.map((p) => p.parent_id) },
      newValue: { newParentId },
    });

    return {
      success: true,
      data: newRelation,
      message: "Di chuyển thành viên sang nút cha mới thành công!",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi di chuyển node",
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
