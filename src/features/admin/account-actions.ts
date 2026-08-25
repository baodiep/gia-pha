"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { normalizePhone, toLoginName, toInternalEmail } from "@/lib/auth/identity";
import { adminCreateAccountSchema, AdminCreateAccountInput } from "./account-validation";
import { AccountStatus, Profile, Person } from "@/types/domain";

export interface AccountWithPerson extends Profile {
  person?: {
    id: string;
    full_name: string;
    generation_no: number | null;
    branch_code: string | null;
  } | null;
}

export type AdminAccountActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Lấy danh sách tài khoản theo trạng thái
 */
export async function getAdminAccounts(options?: {
  status?: AccountStatus;
  search?: string;
}): Promise<AccountWithPerson[]> {
  const { profile } = await requireActiveUser();
  if (!profile.is_admin) {
    throw new Error("Chỉ Admin mới có quyền truy cập quản lý tài khoản");
  }

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*, person:person_id(id, full_name, generation_no, branch_code)")
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.search) {
    query = query.or(`phone_normalized.ilike.%${options.search}%,login_name.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Không thể tải danh sách tài khoản: ${error.message}`);
  }

  return (data || []) as AccountWithPerson[];
}

/**
 * Admin tạo tài khoản hộ thành viên dòng họ (có temporary password)
 */
export async function adminCreateAccount(
  input: AdminCreateAccountInput
): Promise<AdminAccountActionResult<Profile>> {
  try {
    const { profile: adminProfile, userId: adminId } = await requireActiveUser();
    if (!adminProfile.is_admin) {
      return { success: false, error: "Chỉ Admin mới có quyền tạo tài khoản" };
    }

    const validated = adminCreateAccountSchema.parse(input);
    const phoneNormalized = normalizePhone(validated.phone);
    const loginName = toLoginName(phoneNormalized);
    const internalEmail = toInternalEmail(phoneNormalized);

    const admin = createAdminClient();

    // Check if phone already registered
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("phone_normalized", phoneNormalized)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, error: "Số điện thoại này đã được đăng ký tài khoản" };
    }

    // If person_id provided, check if person is already linked to another account
    if (validated.personId) {
      const { data: linkedProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("person_id", validated.personId)
        .maybeSingle();

      if (linkedProfile) {
        return { success: false, error: "Thành viên này đã được liên kết với một tài khoản khác" };
      }
    }

    // Create auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: validated.temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: validated.fullName,
        phone: phoneNormalized,
      },
    });

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || "Không thể tạo tài khoản xác thực" };
    }

    // Create profile with status ACTIVE (since created by Admin directly) and must_change_password
    const { data: profileData, error: profileError } = await admin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        phone_normalized: phoneNormalized,
        login_name: loginName,
        person_id: validated.personId || null,
        status: "ACTIVE",
        is_admin: validated.isAdmin,
        must_change_password: true,
        activated_at: new Date().toISOString(),
        activated_by: adminId,
      })
      .select("*")
      .single();

    if (profileError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: "Không thể lưu hồ sơ tài khoản" };
    }

    // Ghi audit log
    await admin.from("audit_logs").insert({
      actor_user_id: adminId,
      action: "ACCOUNT_CREATE_BY_ADMIN",
      entity_type: "PROFILES",
      entity_id: authUser.user.id,
      new_value: {
        login_name: loginName,
        phone: phoneNormalized,
        person_id: validated.personId,
        is_admin: validated.isAdmin,
      },
    });

    return {
      success: true,
      data: profileData as Profile,
      message: `Đã tạo thành công tài khoản ${loginName} với mật khẩu tạm`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo tài khoản",
    };
  }
}

/**
 * Kích hoạt tài khoản (PENDING -> ACTIVE) hoặc mở lại tài khoản (SUSPENDED -> ACTIVE)
 */
export async function adminSetAccountStatus(
  targetUserId: string,
  newStatus: AccountStatus
): Promise<AdminAccountActionResult> {
  try {
    const { profile: adminProfile, userId: adminId } = await requireActiveUser();
    if (!adminProfile.is_admin) {
      return { success: false, error: "Chỉ Admin mới có quyền đổi trạng thái tài khoản" };
    }

    const admin = createAdminClient();

    const { data: oldProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "ACTIVE") {
      updatePayload.activated_at = new Date().toISOString();
      updatePayload.activated_by = adminId;
    }

    const { error } = await admin
      .from("profiles")
      .update(updatePayload)
      .eq("id", targetUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Audit log
    await admin.from("audit_logs").insert({
      actor_user_id: adminId,
      action: `ACCOUNT_STATUS_${newStatus}`,
      entity_type: "PROFILES",
      entity_id: targetUserId,
      old_value: { status: oldProfile?.status },
      new_value: { status: newStatus },
    });

    const statusMap = {
      ACTIVE: "kích hoạt",
      SUSPENDED: "khóa",
      PENDING: "đưa về chờ duyệt",
    };

    return {
      success: true,
      message: `Đã ${statusMap[newStatus]} tài khoản thành công`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật trạng thái",
    };
  }
}

/**
 * Liên kết hoặc hủy liên kết tài khoản với hồ sơ Person trong phả hệ
 */
export async function adminLinkPersonToAccount(
  userId: string,
  personId: string | null
): Promise<AdminAccountActionResult> {
  try {
    const { profile: adminProfile, userId: adminId } = await requireActiveUser();
    if (!adminProfile.is_admin) {
      return { success: false, error: "Chỉ Admin mới có quyền liên kết hồ sơ" };
    }

    const admin = createAdminClient();

    if (personId) {
      // Check if person already linked to another account
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("person_id", personId)
        .neq("id", userId)
        .maybeSingle();

      if (existing) {
        return { success: false, error: "Thành viên này đã liên kết với tài khoản khác" };
      }
    }

    const { error } = await admin
      .from("profiles")
      .update({
        person_id: personId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Audit log
    await admin.from("audit_logs").insert({
      actor_user_id: adminId,
      action: personId ? "ACCOUNT_LINK_PERSON" : "ACCOUNT_UNLINK_PERSON",
      entity_type: "PROFILES",
      entity_id: userId,
      new_value: { person_id: personId },
    });

    return {
      success: true,
      message: personId ? "Đã liên kết hồ sơ thành công" : "Đã hủy liên kết hồ sơ",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi liên kết hồ sơ",
    };
  }
}
