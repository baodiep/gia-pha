"use server";

import { generateMathCaptcha, verifyMathCaptcha, generateSecure8DigitPin, CaptchaChallenge } from "@/lib/auth/captcha";
import { normalizePhone } from "@/lib/auth/identity";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { PasswordResetRequest } from "@/types/domain";

export async function getNewCaptchaAction(): Promise<CaptchaChallenge> {
  return generateMathCaptcha();
}

/**
 * Public endpoint: Submit password reset request with CAPTCHA
 * Security policy: Generic public response (does not reveal if account exists)
 */
export async function submitPasswordResetRequestAction(
  phoneInput: string,
  captchaToken: string,
  captchaAnswer: string,
  note?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (!verifyMathCaptcha(captchaToken, captchaAnswer)) {
      return {
        success: false,
        message: "Mã xác thực CAPTCHA không chính xác hoặc đã hết hạn (5 phút). Vui lòng thử lại.",
        error: "CAPTCHA_INVALID",
      };
    }

    const normalized = normalizePhone(phoneInput);
    if (!normalized || normalized.length < 10) {
      return {
        success: false,
        message: "Số điện thoại không đúng định dạng",
        error: "PHONE_INVALID",
      };
    }

    const adminClient = createAdminClient();

    // Check if account exists
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, status, phone_normalized")
      .eq("phone_normalized", normalized)
      .maybeSingle();

    if (profile && profile.status === "ACTIVE") {
      // Check if there is already a PENDING request
      const { data: existingPending } = await adminClient
        .from("password_reset_requests")
        .select("id")
        .eq("user_id", profile.id)
        .eq("status", "PENDING")
        .maybeSingle();

      if (!existingPending) {
        // Create request
        await adminClient.from("password_reset_requests").insert({
          phone_input: phoneInput,
          phone_normalized: normalized,
          user_id: profile.id,
          status: "PENDING",
          note: note || null,
        });

        // Notify Admins
        const { data: admins } = await adminClient
          .from("profiles")
          .select("id")
          .eq("is_admin", true)
          .eq("status", "ACTIVE");

        if (admins && admins.length > 0) {
          const notifs = admins.map((adm) => ({
            user_id: adm.id,
            type: "PASSWORD_RESET_REQUEST",
            title: "Yêu cầu cấp lại mật khẩu",
            body: `Tài khoản (${normalized}) vừa gửi yêu cầu cấp lại mật khẩu.`,
            link_url: "/admin/password-resets",
            is_read: false,
          }));
          await adminClient.from("notifications").insert(notifs);
        }
      }
    }

    // Always return generic success message to prevent user enumeration
    return {
      success: true,
      message:
        "Yêu cầu cấp lại mật khẩu đã được tiếp nhận. Ban Quản trị dòng họ sẽ xem xét và cấp mật khẩu tạm cho bạn.",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.",
      error: err instanceof Error ? err.message : "SERVER_ERROR",
    };
  }
}

/**
 * Admin: Get list of password reset requests
 */
export async function getAdminPasswordResetRequestsAction(): Promise<{
  success: boolean;
  requests: PasswordResetRequest[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, requests: [], error: "Không có quyền truy cập" };
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("password_reset_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, requests: [], error: error.message };
    }

    return { success: true, requests: data as PasswordResetRequest[] };
  } catch (err: unknown) {
    return { success: false, requests: [], error: err instanceof Error ? err.message : "Lỗi tải dữ liệu" };
  }
}

/**
 * Admin: Reset password for user (RANDOM_8_DIGIT or MANUAL)
 */
export async function executeAdminPasswordResetAction(
  requestId: string,
  method: "RANDOM_8_DIGIT" | "MANUAL",
  manualPassword?: string,
  forceMustChange = true
): Promise<{
  success: boolean;
  temporaryPassword?: string;
  mustChangePassword?: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên (Admin) mới có quyền reset mật khẩu" };
    }

    const adminClient = createAdminClient();

    const { data: req, error: reqErr } = await adminClient
      .from("password_reset_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) {
      return { success: false, error: "Không tìm thấy yêu cầu này" };
    }

    if (req.status !== "PENDING") {
      return { success: false, error: `Yêu cầu này đã được xử lý (${req.status})` };
    }

    if (!req.user_id) {
      return { success: false, error: "Yêu cầu không gắn với tài khoản người dùng hợp lệ" };
    }

    let tempPassword = "";
    let mustChange = forceMustChange;

    if (method === "RANDOM_8_DIGIT") {
      tempPassword = generateSecure8DigitPin();
      mustChange = true; // Always forced for 8-digit random
    } else {
      if (!manualPassword || manualPassword.length < 6) {
        return { success: false, error: "Mật khẩu nhập tay tối thiểu 6 ký tự" };
      }
      tempPassword = manualPassword;
    }

    // 1. Update Supabase Auth User Password
    const { error: authErr } = await adminClient.auth.admin.updateUserById(req.user_id, {
      password: tempPassword,
    });

    if (authErr) {
      return { success: false, error: `Lỗi cập nhật mật khẩu Supabase: ${authErr.message}` };
    }

    // 2. Set must_change_password flag on Profile
    await adminClient
      .from("profiles")
      .update({ must_change_password: mustChange })
      .eq("id", req.user_id);

    // 3. Mark request COMPLETED
    await adminClient
      .from("password_reset_requests")
      .update({
        status: "COMPLETED",
        handled_by: user.id,
        handled_at: new Date().toISOString(),
        handle_method: method,
      })
      .eq("id", requestId);

    // 4. Audit log (without plaintext password)
    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "ADMIN_RESET_PASSWORD",
      entity_type: "PASSWORD_RESET_REQUEST",
      entity_id: requestId,
      old_value: { status: "PENDING" },
      new_value: {
        status: "COMPLETED",
        user_id: req.user_id,
        method,
        must_change_password: mustChange,
      },
    });

    return {
      success: true,
      temporaryPassword: tempPassword,
      mustChangePassword: mustChange,
      message: `Đã reset mật khẩu thành công bằng phương thức ${method === "RANDOM_8_DIGIT" ? "8 chữ số ngẫu nhiên" : "nhập tay"}.`,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi reset mật khẩu" };
  }
}

/**
 * Admin: Reject password reset request
 */
export async function rejectAdminPasswordResetAction(
  requestId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên (Admin) mới có quyền từ chối yêu cầu" };
    }

    const adminClient = createAdminClient();

    await adminClient
      .from("password_reset_requests")
      .update({
        status: "REJECTED",
        handled_by: user.id,
        handled_at: new Date().toISOString(),
        handle_method: "REJECTED",
      })
      .eq("id", requestId);

    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "REJECT_PASSWORD_RESET",
      entity_type: "PASSWORD_RESET_REQUEST",
      entity_id: requestId,
      old_value: { status: "PENDING" },
      new_value: { status: "REJECTED" },
    });

    return { success: true, message: "Đã từ chối yêu cầu reset mật khẩu" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi xử lý" };
  }
}
