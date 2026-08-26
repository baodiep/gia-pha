"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { PersonClaimRequest, ProfileChangeRequest } from "@/types/domain";

export interface ClaimRequestInput {
  personId: string;
  note?: string;
}

export interface ProfileChangeRequestInput {
  personId: string;
  requestedChanges: {
    birth_date?: string | null;
    birth_place?: string | null;
    hometown?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    [key: string]: unknown;
  };
  reason?: string;
}

/**
 * Submit "Đây là tôi" (Person claim request)
 */
export async function submitPersonClaimRequestAction(input: ClaimRequestInput): Promise<{
  success: boolean;
  data?: PersonClaimRequest;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, error: "Bạn cần đăng nhập để gửi yêu cầu nhận hồ sơ" };
    }

    if (user.person_id) {
      return { success: false, error: "Tài khoản của bạn đã được liên kết với một thành viên trên cây gia phả" };
    }

    const supabase = await createClient();

    // Check if user already has a pending claim
    const { data: existingUserPending } = await supabase
      .from("person_claim_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .maybeSingle();

    if (existingUserPending) {
      return { success: false, error: "Bạn đang có một yêu cầu nhận hồ sơ đang chờ duyệt" };
    }

    // Check if target person is already claimed by someone or has active profile
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, phone_normalized")
      .eq("person_id", input.personId)
      .maybeSingle();

    if (targetProfile) {
      return { success: false, error: "Thành viên này đã được liên kết với một tài khoản khác" };
    }

    const adminClient = createAdminClient();
    const { data: created, error: insErr } = await adminClient
      .from("person_claim_requests")
      .insert({
        user_id: user.id,
        person_id: input.personId,
        note: input.note || null,
        status: "PENDING",
      })
      .select("*")
      .single();

    if (insErr || !created) {
      return { success: false, error: `Không thể tạo yêu cầu: ${insErr?.message}` };
    }

    // In-app notification to Admins
    const { data: admins } = await adminClient.from("profiles").select("id").eq("is_admin", true).eq("status", "ACTIVE");
    if (admins && admins.length > 0) {
      const notifs = admins.map((adm) => ({
        user_id: adm.id,
        type: "CLAIM_REQUEST",
        title: "Yêu cầu nhận hồ sơ mới",
        body: `Thành viên (SĐT: ${user.phone_normalized}) vừa gửi yêu cầu nhận hồ sơ 'Đây là tôi'`,
        link_url: "/admin/requests",
        is_read: false,
      }));
      await adminClient.from("notifications").insert(notifs);
    }

    return { success: true, data: created as PersonClaimRequest };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi gửi yêu cầu" };
  }
}

/**
 * Submit Profile Change Request (Đề nghị sửa thông tin)
 */
export async function submitProfileChangeRequestAction(input: ProfileChangeRequestInput): Promise<{
  success: boolean;
  data?: ProfileChangeRequest;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, error: "Bạn cần đăng nhập để gửi yêu cầu sửa đổi hồ sơ" };
    }

    // Allowed fields to request modification
    const safeChanges: Record<string, unknown> = {};
    if (input.requestedChanges.birth_date !== undefined) safeChanges.birth_date = input.requestedChanges.birth_date;
    if (input.requestedChanges.birth_place !== undefined) safeChanges.birth_place = input.requestedChanges.birth_place;
    if (input.requestedChanges.hometown !== undefined) safeChanges.hometown = input.requestedChanges.hometown;
    if (input.requestedChanges.bio !== undefined) safeChanges.bio = input.requestedChanges.bio;
    if (input.requestedChanges.avatar_url !== undefined) safeChanges.avatar_url = input.requestedChanges.avatar_url;

    if (Object.keys(safeChanges).length === 0) {
      return { success: false, error: "Không có thông tin nào được đề nghị thay đổi" };
    }

    const adminClient = createAdminClient();
    const { data: created, error: insErr } = await adminClient
      .from("profile_change_requests")
      .insert({
        user_id: user.id,
        person_id: input.personId,
        requested_changes: safeChanges,
        reason: input.reason || null,
        status: "PENDING",
      })
      .select("*")
      .single();

    if (insErr || !created) {
      return { success: false, error: `Không thể tạo yêu cầu: ${insErr?.message}` };
    }

    // In-app notification to Admins
    const { data: admins } = await adminClient.from("profiles").select("id").eq("is_admin", true).eq("status", "ACTIVE");
    if (admins && admins.length > 0) {
      const notifs = admins.map((adm) => ({
        user_id: adm.id,
        type: "PROFILE_CHANGE_REQUEST",
        title: "Đề nghị cập nhật thông tin hồ sơ",
        body: `Thành viên (SĐT: ${user.phone_normalized}) vừa đề nghị cập nhật hồ sơ thành viên`,
        link_url: "/admin/requests",
        is_read: false,
      }));
      await adminClient.from("notifications").insert(notifs);
    }

    return { success: true, data: created as ProfileChangeRequest };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi gửi yêu cầu" };
  }
}

/**
 * Admin: Review Person Claim Request (APPROVE / REJECT)
 */
export async function reviewPersonClaimRequestAction(
  requestId: string,
  decision: "APPROVE" | "REJECT",
  reviewNote?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên (Admin) mới có quyền duyệt yêu cầu" };
    }

    const adminClient = createAdminClient();
    const { data: req, error: reqErr } = await adminClient
      .from("person_claim_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) {
      return { success: false, error: "Không tìm thấy yêu cầu này" };
    }

    if (req.status !== "PENDING") {
      return { success: false, error: `Yêu cầu này đã được xử lý trước đó (${req.status})` };
    }

    const nextStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";

    // If approved, update user's profile to map person_id
    if (decision === "APPROVE") {
      const { error: profErr } = await adminClient
        .from("profiles")
        .update({ person_id: req.person_id })
        .eq("id", req.user_id);

      if (profErr) {
        return { success: false, error: `Không thể gán hồ sơ thành viên: ${profErr.message}` };
      }
    }

    // Update claim request status
    await adminClient
      .from("person_claim_requests")
      .update({
        status: nextStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote || null,
      })
      .eq("id", requestId);

    // Audit log
    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: decision === "APPROVE" ? "APPROVE_PERSON_CLAIM" : "REJECT_PERSON_CLAIM",
      entity_type: "PERSON_CLAIM_REQUEST",
      entity_id: requestId,
      old_value: { status: "PENDING" },
      new_value: {
        status: nextStatus,
        user_id: req.user_id,
        person_id: req.person_id,
        review_note: reviewNote || null,
      },
    });

    // Notify user
    await adminClient.from("notifications").insert({
      user_id: req.user_id,
      type: "CLAIM_RESOLVED",
      title: decision === "APPROVE" ? "Yêu cầu 'Đây là tôi' đã được duyệt" : "Yêu cầu 'Đây là tôi' đã bị từ chối",
      body: decision === "APPROVE"
        ? "Quản trị viên đã xác nhận và liên kết tài khoản của bạn với hồ sơ thành viên trên cây gia phả."
        : `Yêu cầu nhận hồ sơ của bạn không được chấp thuận. Lý do: ${reviewNote || "Không có ghi chú thêm."}`,
      link_url: "/",
      is_read: false,
    });

    return {
      success: true,
      message: decision === "APPROVE" ? "Đã duyệt và liên kết thành viên thành công" : "Đã từ chối yêu cầu",
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi xử lý yêu cầu" };
  }
}

/**
 * Admin: Review Profile Change Request (APPROVE / REJECT)
 */
export async function reviewProfileChangeRequestAction(
  requestId: string,
  decision: "APPROVE" | "REJECT",
  reviewNote?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên (Admin) mới có quyền duyệt yêu cầu" };
    }

    const adminClient = createAdminClient();
    const { data: req, error: reqErr } = await adminClient
      .from("profile_change_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) {
      return { success: false, error: "Không tìm thấy yêu cầu này" };
    }

    if (req.status !== "PENDING") {
      return { success: false, error: `Yêu cầu này đã được xử lý trước đó (${req.status})` };
    }

    const nextStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";

    // If approved, update person record in database
    if (decision === "APPROVE") {
      const changes = req.requested_changes as Record<string, unknown>;
      const { error: pErr } = await adminClient
        .from("persons")
        .update(changes)
        .eq("id", req.person_id);

      if (pErr) {
        return { success: false, error: `Không thể cập nhật hồ sơ thành viên: ${pErr.message}` };
      }
    }

    // Update request status
    await adminClient
      .from("profile_change_requests")
      .update({
        status: nextStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote || null,
      })
      .eq("id", requestId);

    // Audit log
    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: decision === "APPROVE" ? "APPROVE_PROFILE_CHANGE" : "REJECT_PROFILE_CHANGE",
      entity_type: "PROFILE_CHANGE_REQUEST",
      entity_id: requestId,
      old_value: { status: "PENDING" },
      new_value: {
        status: nextStatus,
        user_id: req.user_id,
        person_id: req.person_id,
        changes: req.requested_changes,
        review_note: reviewNote || null,
      },
    });

    // Notify user
    await adminClient.from("notifications").insert({
      user_id: req.user_id,
      type: "PROFILE_CHANGE_RESOLVED",
      title: decision === "APPROVE" ? "Đề nghị cập nhật thông tin đã được duyệt" : "Đề nghị cập nhật thông tin đã bị từ chối",
      body: decision === "APPROVE"
        ? "Thông tin bạn đề nghị thay đổi đã được Quản trị viên chấp thuận và cập nhật vào gia phả."
        : `Đề nghị cập nhật của bạn không được chấp thuận. Lý do: ${reviewNote || "Không có ghi chú thêm."}`,
      link_url: "/",
      is_read: false,
    });

    return {
      success: true,
      message: decision === "APPROVE" ? "Đã duyệt và cập nhật hồ sơ thành công" : "Đã từ chối đề nghị",
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi xử lý đề nghị" };
  }
}

/**
 * Fetch pending claim & change requests for Admin review
 */
export async function getPendingRequestsAction(): Promise<{
  success: boolean;
  claims: Array<PersonClaimRequest & { user_phone?: string; person_name?: string }>;
  changes: Array<ProfileChangeRequest & { user_phone?: string; person_name?: string }>;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, claims: [], changes: [], error: "Không có quyền truy cập" };
    }

    const adminClient = createAdminClient();

    const [claimsRes, changesRes, profilesRes, personsRes] = await Promise.all([
      adminClient.from("person_claim_requests").select("*").order("created_at", { ascending: false }),
      adminClient.from("profile_change_requests").select("*").order("created_at", { ascending: false }),
      adminClient.from("profiles").select("id, phone_normalized"),
      adminClient.from("persons").select("id, full_name"),
    ]);

    const phoneMap = new Map((profilesRes.data || []).map((p) => [p.id, p.phone_normalized]));
    const nameMap = new Map((personsRes.data || []).map((p) => [p.id, p.full_name]));

    const claims = (claimsRes.data || []).map((c) => ({
      ...c,
      user_phone: phoneMap.get(c.user_id),
      person_name: nameMap.get(c.person_id),
    }));

    const changes = (changesRes.data || []).map((c) => ({
      ...c,
      user_phone: phoneMap.get(c.user_id),
      person_name: nameMap.get(c.person_id),
    }));

    return { success: true, claims, changes };
  } catch (err: unknown) {
    return { success: false, claims: [], changes: [], error: err instanceof Error ? err.message : "Lỗi tải dữ liệu" };
  }
}
