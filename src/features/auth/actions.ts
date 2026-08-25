"use server";

import { z } from "zod";
import { normalizePhone, toInternalEmail, toLoginName } from "@/lib/auth/identity";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { assertActiveAccount } from "@/lib/auth/guards";
import { Profile } from "@/types/domain";

const registerSchema = z.object({
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
});

const loginSchema = z.object({
  loginNameOrPhone: z.string().min(1, "Vui lòng nhập số điện thoại hoặc tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type ActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

/**
 * Self-registration:
 * Creates user with status PENDING. User cannot log in to view data until Admin activates.
 */
export async function registerAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      fullName: formData.get("fullName") as string,
    };

    const validated = registerSchema.parse(rawData);
    const phoneNormalized = normalizePhone(validated.phone);
    const loginName = toLoginName(phoneNormalized);
    const internalEmail = toInternalEmail(phoneNormalized);

    const admin = createAdminClient();

    // Check if profile exists
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("phone_normalized", phoneNormalized)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: false,
        error: "Số điện thoại này đã được đăng ký tài khoản trong hệ thống.",
      };
    }

    // Create auth user in Supabase Auth
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: validated.fullName,
        phone: phoneNormalized,
      },
    });

    if (authError || !authUser.user) {
      return {
        success: false,
        error: authError?.message || "Không thể tạo tài khoản xác thực",
      };
    }

    // Insert profile with status PENDING
    const { error: profileError } = await admin.from("profiles").insert({
      id: authUser.user.id,
      phone_normalized: phoneNormalized,
      login_name: loginName,
      status: "PENDING",
      is_admin: false,
      must_change_password: false,
    });

    if (profileError) {
      // Rollback auth user
      await admin.auth.admin.deleteUser(authUser.user.id);
      return {
        success: false,
        error: "Không thể lưu thông tin hồ sơ tài khoản",
      };
    }

    return {
      success: true,
      message: `Đăng ký thành công cho ${validated.fullName} (${loginName}). Vui lòng chờ Ban Quản Trị kích hoạt trước khi đăng nhập.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng ký";
    return { success: false, error: message };
  }
}

/**
 * Login action with phone or visible login name + password
 */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      loginNameOrPhone: formData.get("loginNameOrPhone") as string,
      password: formData.get("password") as string,
    };

    const validated = loginSchema.parse(rawData);
    const phoneNormalized = normalizePhone(validated.loginNameOrPhone);
    const internalEmail = toInternalEmail(phoneNormalized);

    const supabase = await createClient();

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: validated.password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Thông tin đăng nhập hoặc mật khẩu không chính xác.",
      };
    }

    // Check application profile status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Không tìm thấy hồ sơ người dùng trong hệ thống.",
      };
    }

    const userProfile = profile as Profile;

    if (userProfile.status === "PENDING") {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Tài khoản của bạn đang chờ Admin phê duyệt kích hoạt.",
      };
    }

    if (userProfile.status === "SUSPENDED") {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Ban Quản Trị.",
      };
    }

    return {
      success: true,
      data: {
        profile: userProfile,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng nhập";
    return { success: false, error: message };
  }
}

/**
 * Logout action
 */
export async function logoutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

/**
 * Get current active user profile safely along with display name
 */
export async function getCurrentUserWithPerson(): Promise<{
  profile: Profile;
  displayName: string;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, person:persons(full_name)")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.status !== "ACTIVE") {
      return null;
    }

    const userProfile = profile as Profile & { person?: { full_name: string } | null };
    const rawFullName = session.user.user_metadata?.full_name;
    const displayName = userProfile.person?.full_name || rawFullName || userProfile.login_name;

    return {
      profile: userProfile,
      displayName,
    };
  } catch {
    return null;
  }
}

/**
 * Get current active user profile safely without throwing
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const result = await getCurrentUserWithPerson();
  return result?.profile || null;
}


/**
 * Server helper to get current session and require ACTIVE status
 */
export async function requireActiveUser(): Promise<{ profile: Profile; userId: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const userProfile = profile as Profile;
  assertActiveAccount(userProfile);

  return {
    userId: session.user.id,
    profile: userProfile,
  };
}

/**
 * Admin action to activate a pending account
 */
export async function adminActivateAccount(userId: string): Promise<ActionResult> {
  const { profile: adminProfile, userId: adminId } = await requireActiveUser();
  if (!adminProfile.is_admin) {
    return { success: false, error: "Chỉ Admin mới có quyền kích hoạt tài khoản" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      status: "ACTIVE",
      activated_at: new Date().toISOString(),
      activated_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "Không thể kích hoạt tài khoản" };
  }

  return { success: true, message: "Kích hoạt tài khoản thành công" };
}

/**
 * Update user profile details (full name and/or password)
 */
export async function updateProfileDetailsAction(formData: FormData): Promise<ActionResult> {
  try {
    const { profile, userId } = await requireActiveUser();
    const fullName = (formData.get("fullName") as string)?.trim();
    const currentPassword = (formData.get("currentPassword") as string)?.trim();
    const newPassword = (formData.get("newPassword") as string)?.trim();

    const supabase = await createClient();
    const admin = createAdminClient();

    // 1. Update Full Name if provided
    if (fullName && fullName.length >= 2) {
      // If profile is linked to a person in `persons` table, update person's full_name as well
      if (profile.person_id) {
        await admin
          .from("persons")
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq("id", profile.person_id);
      }

      // Update auth user metadata
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: fullName },
      });
    }

    // 2. Change password if requested
    if (newPassword) {
      if (newPassword.length < 6) {
        return { success: false, error: "Mật khẩu mới phải có tối thiểu 6 ký tự" };
      }

      if (!currentPassword) {
        return { success: false, error: "Vui lòng nhập mật khẩu hiện tại để xác nhận đổi mật khẩu" };
      }

      // Verify current password by signing in
      const internalEmail = toInternalEmail(profile.phone_normalized);
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password: currentPassword,
      });

      if (verifyError) {
        return { success: false, error: "Mật khẩu hiện tại không chính xác" };
      }

      // Update to new password
      const { error: updatePwdError } = await admin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (updatePwdError) {
        return { success: false, error: "Không thể cập nhật mật khẩu mới: " + updatePwdError.message };
      }

      // If user had must_change_password flag, reset it
      if (profile.must_change_password) {
        await admin
          .from("profiles")
          .update({ must_change_password: false, updated_at: new Date().toISOString() })
          .eq("id", userId);
      }
    }

    return {
      success: true,
      message: "Cập nhật thông tin tài khoản thành công!",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật thông tin";
    return { success: false, error: message };
  }
}

