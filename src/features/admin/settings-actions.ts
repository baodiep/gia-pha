"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { recordAuditLog } from "@/features/admin/audit-actions";

export interface MenuVisibility {
  tree: boolean;
  events: boolean;
  memorials: boolean;
}

export interface SystemSettings {
  id: string;
  app_title: string;
  app_subtitle: string;
  logo_url: string | null;
  tree_background_url?: string | null;
  menu_visibility?: MenuVisibility;
  updated_at?: string;
  updated_by?: string;
}

const DEFAULT_MENU_VISIBILITY: MenuVisibility = {
  tree: true,
  events: true,
  memorials: true,
};

const DEFAULT_SETTINGS: SystemSettings = {
  id: "default",
  app_title: "Gia Phả Dòng Họ",
  app_subtitle: "Sơ đồ cây phả hệ",
  logo_url: null,
  tree_background_url: null,
  menu_visibility: DEFAULT_MENU_VISIBILITY,
};

const menuVisibilitySchema = z.object({
  tree: z.boolean(),
  events: z.boolean(),
  memorials: z.boolean(),
});

const settingsSchema = z.object({
  appTitle: z.string().min(2, "Tên dòng họ/phần mềm tối thiểu 2 ký tự"),
  appSubtitle: z.string().default("Sơ đồ cây phả hệ"),
  logoUrl: z.string().nullable().optional(),
  treeBackgroundUrl: z.string().nullable().optional(),
  menuVisibility: menuVisibilitySchema.optional(),
});

/**
 * Fetch current system brand settings (safe fallback if table not yet migrated)
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    return data as SystemSettings;
  } catch (err) {
    console.error("Failed to load system settings:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update system brand settings (Admin only)
 */
export async function updateSystemSettingsAction(formData: FormData) {
  try {
    const { profile: adminProfile, userId: adminId } = await requireActiveUser();
    if (!adminProfile.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên (Admin) mới có quyền đổi logo và tên dòng họ" };
    }

    const rawMenuVisibility = formData.get("menuVisibility") as string | null;
    const rawData = {
      appTitle: formData.get("appTitle") as string,
      appSubtitle: (formData.get("appSubtitle") as string) || "Sơ đồ cây phả hệ",
      logoUrl: (formData.get("logoUrl") as string) || null,
      treeBackgroundUrl: (formData.get("treeBackgroundUrl") as string) || null,
      menuVisibility: rawMenuVisibility ? JSON.parse(rawMenuVisibility) : DEFAULT_MENU_VISIBILITY,
    };

    const validated = settingsSchema.parse(rawData);
    const admin = createAdminClient();

    // Get old settings for audit log snapshot
    const oldSettings = await getSystemSettings();

    const payload = {
      id: "default",
      app_title: validated.appTitle,
      app_subtitle: validated.appSubtitle,
      logo_url: validated.logoUrl,
      tree_background_url: validated.treeBackgroundUrl,
      menu_visibility: validated.menuVisibility || DEFAULT_MENU_VISIBILITY,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    };

    const { error } = await admin
      .from("system_settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      return { success: false, error: "Không thể lưu cài đặt: " + error.message };
    }

    // Record audit log
    await recordAuditLog({
      action: "UPDATE_SYSTEM_SETTINGS",
      entityType: "SYSTEM_SETTINGS",
      entityId: "default",
      oldValue: oldSettings as unknown as Record<string, unknown>,
      newValue: payload as unknown as Record<string, unknown>,
    });

    return {
      success: true,
      message: "Cập nhật tên dòng họ và logo thành công!",
      data: payload,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu cài đặt";
    return { success: false, error: message };
  }
}
