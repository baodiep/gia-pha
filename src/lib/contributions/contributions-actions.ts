"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { normalizePhone } from "@/lib/auth/identity";
import { Contribution } from "@/types/domain";
import { z } from "zod";

const contributionInputSchema = z.object({
  contributorName: z.string().min(2, "Tên người đóng góp tối thiểu 2 ký tự").max(100),
  phone: z.string().optional().nullable().or(z.literal("")),
  amount: z.number().int().positive("Số tiền đóng góp phải lớn hơn 0"),
  purpose: z.string().min(2, "Mục đích đóng góp tối thiểu 2 ký tự").max(200),
  contributionDate: z.string().min(10, "Ngày đóng góp không hợp lệ"),
  receiptCode: z.string().max(50).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  userId: z.string().uuid().optional().nullable().or(z.literal("")),
});

export type ContributionInput = z.infer<typeof contributionInputSchema>;

export interface ContributionFilterOptions {
  search?: string;
  phone?: string;
  purpose?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ContributionStats {
  totalAmount: number;
  totalTransactions: number;
  uniqueContributors: number;
}

/**
 * Member / Public / Admin: Get contributions list with filters & stats
 */
export async function getContributionsListAction(filters?: ContributionFilterOptions): Promise<{
  success: boolean;
  contributions: Contribution[];
  stats: ContributionStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("contributions")
      .select("*")
      .is("deleted_at", null)
      .order("contribution_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters?.phone) {
      const normPhone = normalizePhone(filters.phone);
      if (normPhone) {
        query = query.eq("phone_normalized", normPhone);
      }
    }

    if (filters?.fromDate) {
      query = query.gte("contribution_date", filters.fromDate);
    }

    if (filters?.toDate) {
      query = query.lte("contribution_date", filters.toDate);
    }

    if (filters?.minAmount !== undefined) {
      query = query.gte("amount", filters.minAmount);
    }

    if (filters?.maxAmount !== undefined) {
      query = query.lte("amount", filters.maxAmount);
    }

    const { data, error } = await query;
    if (error) {
      return {
        success: false,
        contributions: [],
        stats: { totalAmount: 0, totalTransactions: 0, uniqueContributors: 0 },
        error: error.message,
      };
    }

    let list = (data || []) as Contribution[];

    // Client-side / JS filtering for search / case-insensitive contains
    if (filters?.search) {
      const kw = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.contributor_name.toLowerCase().includes(kw) ||
          (c.purpose && c.purpose.toLowerCase().includes(kw)) ||
          (c.receipt_code && c.receipt_code.toLowerCase().includes(kw))
      );
    }

    if (filters?.purpose) {
      const pkw = filters.purpose.toLowerCase().trim();
      list = list.filter((c) => c.purpose && c.purpose.toLowerCase().includes(pkw));
    }

    // Calculate aggregated stats
    const totalAmount = list.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalTransactions = list.length;
    const uniqueNames = new Set(list.map((c) => c.contributor_name.trim().toLowerCase()));

    return {
      success: true,
      contributions: list,
      stats: {
        totalAmount,
        totalTransactions,
        uniqueContributors: uniqueNames.size,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      contributions: [],
      stats: { totalAmount: 0, totalTransactions: 0, uniqueContributors: 0 },
      error: err instanceof Error ? err.message : "Lỗi tải sổ công đức",
    };
  }
}

/**
 * Admin: Create or update contribution entry
 */
export async function saveAdminContributionAction(
  contributionId: string | null,
  input: ContributionInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên mới có quyền ghi chép sổ đóng góp" };
    }

    const parsed = contributionInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const val = parsed.data;
    const adminClient = createAdminClient();

    const normPhone = val.phone ? normalizePhone(val.phone) : null;

    const payload = {
      contributor_name: val.contributorName.trim(),
      phone: val.phone?.trim() || null,
      phone_normalized: normPhone,
      amount: val.amount,
      purpose: val.purpose.trim(),
      contribution_date: val.contributionDate,
      receipt_code: val.receiptCode?.trim() || null,
      note: val.note?.trim() || null,
      user_id: val.userId ? val.userId : null,
      updated_at: new Date().toISOString(),
    };

    if (contributionId) {
      // Update
      const { data: oldData } = await adminClient
        .from("contributions")
        .select("*")
        .eq("id", contributionId)
        .single();

      const { error } = await adminClient
        .from("contributions")
        .update(payload)
        .eq("id", contributionId);

      if (error) return { success: false, error: error.message };

      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "UPDATE_CONTRIBUTION",
        entity_type: "CONTRIBUTION",
        entity_id: contributionId,
        old_value: oldData,
        new_value: payload,
      });

      return { success: true, message: "Đã cập nhật mục đóng góp thành công." };
    } else {
      // Insert
      const { data: newRec, error } = await adminClient
        .from("contributions")
        .insert({
          ...payload,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "CREATE_CONTRIBUTION",
        entity_type: "CONTRIBUTION",
        entity_id: newRec.id,
        old_value: null,
        new_value: newRec,
      });

      return { success: true, message: "Đã ghi nhận đóng góp vào sổ công đức." };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi lưu đóng góp" };
  }
}

/**
 * Admin: Soft delete contribution entry
 */
export async function deleteAdminContributionAction(
  contributionId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên mới có quyền xóa mục đóng góp" };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("contributions")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq("id", contributionId);

    if (error) return { success: false, error: error.message };

    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "DELETE_CONTRIBUTION",
      entity_type: "CONTRIBUTION",
      entity_id: contributionId,
      old_value: { id: contributionId },
      new_value: { deleted_at: new Date().toISOString() },
    });

    return { success: true, message: "Đã xóa mục đóng góp thành công." };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi xóa mục đóng góp" };
  }
}
