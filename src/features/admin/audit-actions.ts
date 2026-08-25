"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";
import { restorePerson } from "@/features/persons/actions";
import { Person } from "@/types/domain";

export interface AuditLogItem {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor_profile?: {
    login_name: string;
    phone_normalized: string;
  } | null;
}

export interface DeletedPersonItem extends Person {
  deleted_by_profile?: {
    login_name: string;
  } | null;
}

export type AuditActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Lấy danh sách Audit logs (Admin only)
 */
export async function getAuditLogs(options?: {
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<AuditLogItem[]> {
  try {
    const { profile } = await requireActiveUser();
    if (!profile.is_admin) {
      throw new Error("Chỉ Admin mới có quyền xem Audit log");
    }

    const admin = createAdminClient();

    let query = admin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (options?.action) {
      query = query.eq("action", options.action);
    }
    if (options?.entityType) {
      query = query.eq("entity_type", options.entityType);
    }
    if (options?.startDate) {
      query = query.gte("created_at", options.startDate);
    }
    if (options?.endDate) {
      query = query.lte("created_at", options.endDate);
    }

    const { data: logs, error } = await query;
    if (error) {
      throw new Error(`Không thể tải audit log: ${error.message}`);
    }

    if (!logs || logs.length === 0) {
      return [];
    }

    // Fetch actor profiles manually to avoid foreign key join mismatch
    const actorIds = Array.from(
      new Set(logs.map((l) => l.actor_user_id).filter((id): id is string => !!id))
    );

    let profilesMap: Record<string, { login_name: string; phone_normalized: string }> = {};
    if (actorIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, login_name, phone_normalized")
        .in("id", actorIds);

      if (profiles) {
        profilesMap = Object.fromEntries(
          profiles.map((p) => [p.id, { login_name: p.login_name, phone_normalized: p.phone_normalized }])
        );
      }
    }

    return logs.map((l) => ({
      ...l,
      actor_profile: l.actor_user_id ? profilesMap[l.actor_user_id] || null : null,
    })) as AuditLogItem[];
  } catch (err: unknown) {
    console.error("getAuditLogs error:", err);
    return [];
  }
}


/**
 * Lấy danh sách thành viên trong thùng rác (đã bị xóa mềm)
 */
export async function getTrashPersons(): Promise<DeletedPersonItem[]> {
  const { profile } = await requireActiveUser();
  if (!profile.is_admin) {
    throw new Error("Chỉ Admin mới có quyền xem Thùng rác");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("persons")
    .select("*, deleted_by_profile:deleted_by(login_name)")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    throw new Error(`Không thể tải danh sách thùng rác: ${error.message}`);
  }

  return (data || []) as DeletedPersonItem[];
}

/**
 * Khôi phục thành viên từ thùng rác (Admin or authorized branch manager)
 */
export async function restorePersonFromTrash(personId: string): Promise<AuditActionResult> {
  const res = await restorePerson(personId);
  return {
    success: res.success,
    error: res.error,
    message: res.success ? "Đã khôi phục thành viên thành công" : undefined,
  };
}

/**
 * Ghi lại bản ghi audit log
 */
export async function recordAuditLog(log: {
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    let actorId: string | null = null;
    try {
      const user = await requireActiveUser();
      actorId = user.userId;
    } catch {
      actorId = null;
    }

    await admin.from("audit_logs").insert({
      actor_user_id: actorId,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId || null,
      old_value: log.oldValue || null,
      new_value: log.newValue || null,
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

