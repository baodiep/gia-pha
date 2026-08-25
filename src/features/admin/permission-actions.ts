"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { BranchGrant, Profile, Person } from "@/types/domain";

export interface BranchGrantDetail extends BranchGrant {
  user_profile?: {
    id: string;
    login_name: string;
    phone_normalized: string;
    person?: {
      id: string;
      full_name: string;
    } | null;
  } | null;
  root_person?: {
    id: string;
    full_name: string;
    generation_no: number | null;
    branch_code: string | null;
  } | null;
  granted_by_profile?: {
    id: string;
    login_name: string;
  } | null;
  revoked_by_profile?: {
    id: string;
    login_name: string;
  } | null;
}

export type PermissionActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Lấy danh sách phân quyền quản lý nhánh (Admin only)
 */
export async function getAdminBranchGrants(options?: {
  activeOnly?: boolean;
}): Promise<BranchGrantDetail[]> {
  const { profile } = await requireActiveUser();
  if (!profile.is_admin) {
    throw new Error("Chỉ Admin mới có quyền xem danh sách phân quyền nhánh");
  }

  const supabase = await createClient();

  let query = supabase
    .from("branch_grants")
    .select(`
      *,
      user_profile:user_id(id, login_name, phone_normalized, person:person_id(id, full_name)),
      root_person:root_person_id(id, full_name, generation_no, branch_code),
      granted_by_profile:granted_by(id, login_name),
      revoked_by_profile:revoked_by(id, login_name)
    `)
    .order("created_at", { ascending: false });

  if (options?.activeOnly) {
    query = query.is("revoked_at", null);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Không thể tải danh sách phân quyền: ${error.message}`);
  }

  return (data || []) as BranchGrantDetail[];
}

/**
 * Lấy danh sách tài khoản ACTIVE hợp lệ để cấp quyền quản lý nhánh
 */
export async function getActiveEligibleAccounts(): Promise<Array<{
  id: string;
  login_name: string;
  phone_normalized: string;
  full_name: string | null;
}>> {
  const { profile } = await requireActiveUser();
  if (!profile.is_admin) {
    throw new Error("Chỉ Admin mới có quyền xem danh sách tài khoản");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, login_name, phone_normalized, person:person_id(full_name)")
    .eq("status", "ACTIVE")
    .order("login_name", { ascending: true });

  if (error) {
    throw new Error(`Không thể tải danh sách tài khoản: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    login_name: row.login_name,
    phone_normalized: row.phone_normalized,
    full_name: row.person?.full_name || null,
  }));
}

/**
 * Cấp quyền quản lý từ một nút gốc (Root person)
 */
export async function grantBranchPermission(
  targetUserId: string,
  rootPersonId: string
): Promise<PermissionActionResult<BranchGrant>> {
  try {
    const { profile: adminProfile, userId: adminId } = await requireActiveUser();
    if (!adminProfile.is_admin) {
      return { success: false, error: "Chỉ Admin mới có quyền cấp quyền quản lý nhánh" };
    }

    const admin = createAdminClient();

    // Check if target user is ACTIVE
    const { data: targetProfile, error: profileErr } = await admin
      .from("profiles")
      .select("id, status, login_name")
      .eq("id", targetUserId)
      .single();

    if (profileErr || !targetProfile || targetProfile.status !== "ACTIVE") {
      return { success: false, error: "Tài khoản được cấp quyền phải ở trạng thái ACTIVE (Đang hoạt động)" };
    }

    // Check if person exists and not deleted
    const { data: rootPerson, error: personErr } = await admin
      .from("persons")
      .select("id, full_name, deleted_at")
      .eq("id", rootPersonId)
      .single();

    if (personErr || !rootPerson || rootPerson.deleted_at) {
      return { success: false, error: "Thành viên gốc không tồn tại hoặc đã bị xóa" };
    }

    // Check if already has active grant for this root_person_id
    const { data: existingGrant } = await admin
      .from("branch_grants")
      .select("id")
      .eq("user_id", targetUserId)
      .eq("root_person_id", rootPersonId)
      .is("revoked_at", null)
      .maybeSingle();

    if (existingGrant) {
      return { success: false, error: "Tài khoản này đã có quyền quản lý nhánh này rồi" };
    }

    // Insert 1 branch_grant record (dynamic evaluation, never materialize descendants)
    const { data: grantData, error: grantErr } = await admin
      .from("branch_grants")
      .insert({
        user_id: targetUserId,
        root_person_id: rootPersonId,
        granted_by: adminId,
      })
      .select("*")
      .single();

    if (grantErr) {
      return { success: false, error: grantErr.message };
    }

    // Audit log
    await admin.from("audit_logs").insert({
      actor_user_id: adminId,
      action: "BRANCH_GRANT_CREATE",
      entity_type: "BRANCH_GRANTS",
      entity_id: grantData.id,
      new_value: {
        user_id: targetUserId,
        root_person_id: rootPersonId,
      },
    });

    return {
      success: true,
      data: grantData as BranchGrant,
      message: `Đã cấp quyền quản lý nhánh từ cụ/ông/bà ${rootPerson.full_name} cho tài khoản ${targetProfile.login_name}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cấp quyền",
    };
  }
}

/**
 * Thu hồi quyền quản lý nhánh (Soft revoke with timestamp, not hard delete)
 */
export async function revokeBranchPermission(grantId: string): Promise<PermissionActionResult> {
  try {
    const { profile: adminProfile, userId: adminId } = await requireActiveUser();
    if (!adminProfile.is_admin) {
      return { success: false, error: "Chỉ Admin mới có quyền thu hồi quyền quản lý nhánh" };
    }

    const admin = createAdminClient();

    const { data: grant, error: fetchErr } = await admin
      .from("branch_grants")
      .select("*")
      .eq("id", grantId)
      .is("revoked_at", null)
      .single();

    if (fetchErr || !grant) {
      return { success: false, error: "Bản ghi phân quyền không tồn tại hoặc đã được thu hồi trước đó" };
    }

    const now = new Date().toISOString();

    const { error: updateErr } = await admin
      .from("branch_grants")
      .update({
        revoked_at: now,
        revoked_by: adminId,
      })
      .eq("id", grantId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Audit log
    await admin.from("audit_logs").insert({
      actor_user_id: adminId,
      action: "BRANCH_GRANT_REVOKE",
      entity_type: "BRANCH_GRANTS",
      entity_id: grantId,
      old_value: {
        user_id: grant.user_id,
        root_person_id: grant.root_person_id,
      },
      new_value: {
        revoked_at: now,
        revoked_by: adminId,
      },
    });

    return {
      success: true,
      message: "Đã thu hồi quyền quản lý nhánh thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi thu hồi quyền",
    };
  }
}
