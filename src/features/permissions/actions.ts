"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { PermissionService, LineageRelation, SpouseUnion } from "@/lib/permissions/permission-service";

export type PermissionActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Lấy danh sách các root person ID mà user được cấp quyền quản lý nhánh
 */
export async function getManagedBranches(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branch_grants")
    .select("root_person_id")
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (error) {
    throw new Error(`Không thể lấy danh sách nhánh quản lý: ${error.message}`);
  }

  return (data || []).map((row) => row.root_person_id);
}

/**
 * Lấy danh sách toàn bộ Person IDs mà user hiện tại có quyền chỉnh sửa
 */
export async function getEditablePersonIds(userId: string, isAdmin: boolean): Promise<Set<string>> {
  if (isAdmin) {
    // Admin có quyền chỉnh sửa tất cả mọi người
    return new Set<string>(["*"]);
  }

  const rootPersonIds = await getManagedBranches(userId);
  if (rootPersonIds.length === 0) {
    return new Set<string>();
  }

  const supabase = await createClient();

  // Lấy quan hệ cha-con trực hệ và hôn phối để tính recursive
  const [{ data: relationsData }, { data: unionsData }] = await Promise.all([
    supabase.from("parent_child").select("parent_id, child_id, is_lineage_relation"),
    supabase.from("unions").select("partner1_id, partner2_id"),
  ]);

  const relations: LineageRelation[] = (relationsData || []).map((r) => ({
    parentId: r.parent_id,
    childId: r.child_id,
    isLineageRelation: r.is_lineage_relation,
  }));

  const unions: SpouseUnion[] = (unionsData || []).map((u) => ({
    partner1Id: u.partner1_id,
    partner2Id: u.partner2_id,
  }));

  return PermissionService.computeEditablePersonIds(rootPersonIds, relations, unions);
}

/**
 * Cấp quyền quản lý nhánh cho User (Chỉ Admin)
 */
export async function grantBranchAccess(
  targetUserId: string,
  rootPersonId: string
): Promise<PermissionActionResult> {
  try {
    const { profile, userId: adminId } = await requireActiveUser();
    if (!PermissionService.canGrantBranch(profile)) {
      return { success: false, error: "Chỉ Admin mới có quyền cấp quyền quản lý nhánh" };
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("branch_grants")
      .insert({
        user_id: targetUserId,
        root_person_id: rootPersonId,
        granted_by: adminId,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Người dùng này đã được cấp quyền trên nhánh này" };
      }
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data,
      message: "Cấp quyền quản lý nhánh thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cấp quyền nhánh",
    };
  }
}

/**
 * Thu hồi quyền quản lý nhánh (Chỉ Admin)
 */
export async function revokeBranchAccess(
  grantId: string
): Promise<PermissionActionResult> {
  try {
    const { profile, userId: adminId } = await requireActiveUser();
    if (!PermissionService.canGrantBranch(profile)) {
      return { success: false, error: "Chỉ Admin mới có quyền thu hồi quyền quản lý nhánh" };
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("branch_grants")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: adminId,
      })
      .eq("id", grantId)
      .is("revoked_at", null);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Thu hồi quyền quản lý nhánh thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi thu hồi quyền nhánh",
    };
  }
}
