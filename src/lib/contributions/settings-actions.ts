"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { ContributionSettings } from "@/types/domain";
import { z } from "zod";

const contributionSettingsSchema = z.object({
  fundPurposeTitle: z.string().min(2, "Tiêu đề quỹ tối thiểu 2 ký tự").max(200),
  fundDescription: z.string().max(2000).optional().nullable(),
  bankName: z.string().min(2, "Tên ngân hàng tối thiểu 2 ký tự").max(100),
  accountNumber: z.string().min(3, "Số tài khoản tối thiểu 3 ký tự").max(50),
  accountHolder: z.string().min(2, "Tên chủ tài khoản tối thiểu 2 ký tự").max(100),
  qrCodeUrl: z.string().url("URL ảnh mã QR không hợp lệ").optional().nullable().or(z.literal("")),
  transferSyntaxGuide: z.string().max(200).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type ContributionSettingsInput = z.infer<typeof contributionSettingsSchema>;

/**
 * Member / Public: Get active contribution settings
 */
export async function getActiveContributionSettingsAction(): Promise<{
  success: boolean;
  settings?: ContributionSettings | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contribution_settings")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, settings: data as ContributionSettings | null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi tải thông tin quỹ" };
  }
}

/**
 * Admin: Get current contribution settings (active or inactive)
 */
export async function getAdminContributionSettingsAction(): Promise<{
  success: boolean;
  settings?: ContributionSettings | null;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Không có quyền truy cập" };
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("contribution_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, settings: data as ContributionSettings | null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi tải cấu hình quỹ" };
  }
}

/**
 * Admin: Save or update contribution settings
 */
export async function saveAdminContributionSettingsAction(
  input: ContributionSettingsInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên mới có quyền cấu hình thông tin quỹ" };
    }

    const parsed = contributionSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const val = parsed.data;
    const adminClient = createAdminClient();

    const { data: existing } = await adminClient
      .from("contribution_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const payload = {
      fund_purpose_title: val.fundPurposeTitle.trim(),
      fund_description: val.fundDescription?.trim() || null,
      bank_name: val.bankName.trim(),
      account_number: val.accountNumber.trim(),
      account_holder: val.accountHolder.trim(),
      qr_code_url: val.qrCodeUrl ? val.qrCodeUrl.trim() : null,
      transfer_syntax_guide: val.transferSyntaxGuide?.trim() || null,
      is_active: val.isActive,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await adminClient
        .from("contribution_settings")
        .update(payload)
        .eq("id", existing.id);

      if (error) return { success: false, error: error.message };

      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "UPDATE_CONTRIBUTION_SETTINGS",
        entity_type: "CONTRIBUTION_SETTINGS",
        entity_id: existing.id,
        old_value: existing,
        new_value: payload,
      });

      return { success: true, message: "Đã cập nhật thông tin quỹ dòng họ thành công." };
    } else {
      const { data: newRec, error } = await adminClient
        .from("contribution_settings")
        .insert(payload)
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "CREATE_CONTRIBUTION_SETTINGS",
        entity_type: "CONTRIBUTION_SETTINGS",
        entity_id: newRec.id,
        old_value: null,
        new_value: newRec,
      });

      return { success: true, message: "Đã lưu cấu hình quỹ dòng họ thành công." };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi lưu cấu hình quỹ" };
  }
}
