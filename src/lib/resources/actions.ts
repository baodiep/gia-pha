"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { FamilyResource, ResourceType } from "@/types/domain";
import { z } from "zod";

const resourceInputSchema = z.object({
  title: z.string().min(2, "Tiêu đề tối thiểu 2 ký tự").max(200, "Tiêu đề quá dài"),
  description: z.string().max(2000).optional().nullable(),
  resourceType: z.enum(["ALBUM", "DOCUMENT", "VIDEO", "WEBSITE", "OTHER"]),
  externalUrl: z.string().url("Đường dẫn phải là URL hợp lệ (http:// hoặc https://)"),
  thumbnailUrl: z.string().url("Ảnh thu nhỏ phải là URL hợp lệ").optional().nullable().or(z.literal("")),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;

/**
 * Member / Public: Get published family resources
 */
export async function getPublishedFamilyResourcesAction(typeFilter?: ResourceType): Promise<{
  success: boolean;
  data: FamilyResource[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("family_resources")
      .select("*")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (typeFilter) {
      query = query.eq("resource_type", typeFilter);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data as FamilyResource[] };
  } catch (err: unknown) {
    return { success: false, data: [], error: err instanceof Error ? err.message : "Lỗi tải tư liệu" };
  }
}

/**
 * Admin: Get all resources (including DRAFT / ARCHIVED)
 */
export async function getAdminFamilyResourcesAction(): Promise<{
  success: boolean;
  data: FamilyResource[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, data: [], error: "Không có quyền quản trị" };
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("family_resources")
      .select("*")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data as FamilyResource[] };
  } catch (err: unknown) {
    return { success: false, data: [], error: err instanceof Error ? err.message : "Lỗi tải dữ liệu" };
  }
}

/**
 * Admin: Create or update a family resource
 */
export async function saveAdminFamilyResourceAction(
  resourceId: string | null,
  input: ResourceInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên mới có quyền cập nhật tư liệu" };
    }

    const parsed = resourceInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const val = parsed.data;
    const adminClient = createAdminClient();

    const payload = {
      title: val.title.trim(),
      description: val.description?.trim() || null,
      resource_type: val.resourceType,
      url: val.externalUrl.trim(),
      thumbnail_url: val.thumbnailUrl ? val.thumbnailUrl.trim() : null,
      is_published: val.isPublished,
      display_order: val.displayOrder,
      updated_at: new Date().toISOString(),
    };

    if (resourceId) {
      // Update
      const { data: oldRes } = await adminClient
        .from("family_resources")
        .select("*")
        .eq("id", resourceId)
        .single();

      const { error } = await adminClient
        .from("family_resources")
        .update(payload)
        .eq("id", resourceId);

      if (error) return { success: false, error: error.message };

      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "UPDATE_FAMILY_RESOURCE",
        entity_type: "FAMILY_RESOURCE",
        entity_id: resourceId,
        old_value: oldRes,
        new_value: payload,
      });

      return { success: true, message: "Đã cập nhật tư liệu thành công" };
    } else {
      // Insert
      const { data: newRes, error } = await adminClient
        .from("family_resources")
        .insert({
          ...payload,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "CREATE_FAMILY_RESOURCE",
        entity_type: "FAMILY_RESOURCE",
        entity_id: newRes.id,
        old_value: null,
        new_value: newRes,
      });

      return { success: true, message: "Đã thêm tư liệu mới thành công" };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi lưu tư liệu" };
  }
}

/**
 * Admin: Soft delete a family resource
 */
export async function deleteAdminFamilyResourceAction(
  resourceId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên mới có quyền xóa tư liệu" };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("family_resources")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", resourceId);

    if (error) return { success: false, error: error.message };

    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "DELETE_FAMILY_RESOURCE",
      entity_type: "FAMILY_RESOURCE",
      entity_id: resourceId,
      old_value: { id: resourceId },
      new_value: { deleted_at: new Date().toISOString(), is_published: false },
    });

    return { success: true, message: "Đã xóa tư liệu thành công" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi xóa tư liệu" };
  }
}
