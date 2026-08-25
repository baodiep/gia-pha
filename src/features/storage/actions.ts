"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { PermissionService } from "@/lib/permissions/permission-service";
import { getEditablePersonIds } from "@/features/permissions/actions";
import { avatarUploadSchema, ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_SIZE_BYTES } from "./validation";


export type StorageActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Upload hoặc thay thế ảnh đại diện của Person
 */
export async function uploadPersonAvatar(
  personId: string,
  formData: FormData
): Promise<StorageActionResult<{ avatarUrl: string }>> {
  try {
    const { profile, userId } = await requireActiveUser();

    // Permission check: Admin or Branch Manager in scope
    if (!profile.is_admin) {
      const editableSet = await getEditablePersonIds(userId, false);
      const isAllowed = PermissionService.canEditPerson(profile, personId, editableSet);
      if (!isAllowed) {
        return {
          success: false,
          error: "Bạn không có quyền chỉnh sửa ảnh đại diện của thành viên này",
        };
      }
    }


    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Vui lòng chọn tệp ảnh" };
    }

    // Validate size & MIME type
    avatarUploadSchema.parse({
      personId,
      fileSize: file.size,
      mimeType: file.type,
    });

    const admin = createAdminClient();

    // Get current person to check old avatar for cleanup
    const { data: currentPerson } = await admin
      .from("persons")
      .select("avatar_url")
      .eq("id", personId)
      .single();

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `persons/${personId}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage bucket 'avatars'
    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Upload ảnh thất bại: ${uploadError.message}` };
    }

    // Get public URL
    const { data: publicUrlData } = admin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const newAvatarUrl = publicUrlData.publicUrl;

    // Update person avatar_url
    const { error: updateError } = await admin
      .from("persons")
      .update({
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", personId);

    if (updateError) {
      return { success: false, error: "Không thể cập nhật hồ sơ thành viên với ảnh mới" };
    }

    // Safely delete old avatar if exists and in same bucket
    if (currentPerson?.avatar_url && currentPerson.avatar_url.includes("/avatars/persons/")) {
      try {
        const oldPath = currentPerson.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await admin.storage.from("avatars").remove([oldPath]);
        }
      } catch (cleanupErr) {
        console.warn("Could not remove old avatar object:", cleanupErr);
      }
    }

    // Audit log
    await admin.from("audit_logs").insert({
      actor_user_id: userId,
      action: "PERSON_AVATAR_UPDATE",
      entity_type: "PERSONS",
      entity_id: personId,
      old_value: { avatar_url: currentPerson?.avatar_url },
      new_value: { avatar_url: newAvatarUrl },
    });

    return {
      success: true,
      data: { avatarUrl: newAvatarUrl },
      message: "Cập nhật ảnh đại diện thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi upload ảnh",
    };
  }
}

/**
 * Xóa ảnh đại diện của Person
 */
export async function removePersonAvatar(personId: string): Promise<StorageActionResult> {
  try {
    const { profile, userId } = await requireActiveUser();

    if (!profile.is_admin) {
      const editableSet = await getEditablePersonIds(userId, false);
      const isAllowed = PermissionService.canEditPerson(profile, personId, editableSet);
      if (!isAllowed) {
        return {
          success: false,
          error: "Bạn không có quyền xóa ảnh đại diện của thành viên này",
        };
      }
    }


    const admin = createAdminClient();

    const { data: currentPerson } = await admin
      .from("persons")
      .select("avatar_url")
      .eq("id", personId)
      .single();

    if (!currentPerson?.avatar_url) {
      return { success: true, message: "Thành viên chưa có ảnh đại diện" };
    }

    // Update database
    await admin
      .from("persons")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", personId);

    // Delete from storage
    if (currentPerson.avatar_url.includes("/avatars/persons/")) {
      const oldPath = currentPerson.avatar_url.split("/avatars/")[1];
      if (oldPath) {
        await admin.storage.from("avatars").remove([oldPath]);
      }
    }

    // Audit log
    await admin.from("audit_logs").insert({
      actor_user_id: userId,
      action: "PERSON_AVATAR_REMOVE",
      entity_type: "PERSONS",
      entity_id: personId,
      old_value: { avatar_url: currentPerson.avatar_url },
      new_value: { avatar_url: null },
    });

    return {
      success: true,
      message: "Đã xóa ảnh đại diện thành công",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa ảnh đại diện",
    };
  }
}
