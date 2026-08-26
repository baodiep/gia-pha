"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { ParsedContributionRow, parseContributionExcel, ContributionParseResult } from "./excel-parser";

export interface ContributionImportPreviewResult {
  parseResult: ContributionParseResult;
  matchedAccountsCount: number;
  duplicateWarningsCount: number;
  rowsWithAccountMatches: Array<
    ParsedContributionRow & {
      matchedUserId: string | null;
      matchedUserLogin: string | null;
      isSuspiciousDuplicate: boolean;
    }
  >;
}

/**
 * Preview Excel upload with account matching & duplicate detection
 */
export async function previewContributionImportAction(
  base64Buffer: string
): Promise<{ success: boolean; data?: ContributionImportPreviewResult; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên mới có quyền nhập dữ liệu đóng góp" };
    }

    const binary = Buffer.from(base64Buffer, "base64");
    const parseResult = parseContributionExcel(binary.buffer);

    if (parseResult.totalRows === 0) {
      return { success: false, error: "File Excel rỗng hoặc không đúng cấu trúc mẫu" };
    }

    const adminClient = createAdminClient();

    // Fetch existing users to match by normalized phone
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, phone_normalized, login_name")
      .eq("status", "ACTIVE");

    const phoneToUserMap = new Map<string, { id: string; login_name: string }>();
    (profiles || []).forEach((p) => {
      if (p.phone_normalized) {
        phoneToUserMap.set(p.phone_normalized, { id: p.id, login_name: p.login_name });
      }
    });

    // Fetch recent contributions to check for suspicious duplicate entries
    const { data: existingContribs } = await adminClient
      .from("contributions")
      .select("contributor_name, amount, purpose, contribution_date")
      .is("deleted_at", null);

    let matchedCount = 0;
    let duplicateWarningsCount = 0;

    const rowsWithAccountMatches = parseResult.rows.map((row) => {
      let matchedUserId: string | null = null;
      let matchedUserLogin: string | null = null;

      if (row.phoneNormalized && phoneToUserMap.has(row.phoneNormalized)) {
        const match = phoneToUserMap.get(row.phoneNormalized)!;
        matchedUserId = match.id;
        matchedUserLogin = match.login_name;
        matchedCount++;
      }

      // Check duplicate combination: Name + Amount + Date
      const isDuplicate = (existingContribs || []).some(
        (ex) =>
          ex.contributor_name.toLowerCase().trim() === row.contributorName.toLowerCase().trim() &&
          ex.amount === row.amount &&
          ex.contribution_date === row.contributionDate
      );

      if (isDuplicate) {
        duplicateWarningsCount++;
        row.warnings.push("Phát hiện đóng góp trùng khớp Họ tên + Số tiền + Ngày trong hệ thống");
        if (row.status === "VALID") {
          row.status = "WARNING";
        }
      }

      return {
        ...row,
        matchedUserId,
        matchedUserLogin,
        isSuspiciousDuplicate: isDuplicate,
      };
    });

    return {
      success: true,
      data: {
        parseResult,
        matchedAccountsCount: matchedCount,
        duplicateWarningsCount,
        rowsWithAccountMatches,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Lỗi xử lý xem trước file Excel",
    };
  }
}

/**
 * Execute transactional import for valid and approved rows
 */
export async function executeContributionImportAction(
  rowsToImport: Array<{
    contributorName: string;
    phone: string | null;
    phoneNormalized: string | null;
    amount: number;
    purpose: string;
    contributionDate: string;
    receiptCode: string | null;
    note: string | null;
    userId: string | null;
  }>
): Promise<{
  success: boolean;
  importedCount: number;
  skippedCount: number;
  message?: string;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, importedCount: 0, skippedCount: 0, error: "Không có quyền thực hiện" };
    }

    if (!rowsToImport || rowsToImport.length === 0) {
      return { success: false, importedCount: 0, skippedCount: 0, error: "Không có dòng dữ liệu nào để nhập" };
    }

    const adminClient = createAdminClient();

    const insertPayloads = rowsToImport.map((r) => ({
      contributor_name: r.contributorName.trim(),
      phone: r.phone ? r.phone.trim() : null,
      phone_normalized: r.phoneNormalized,
      amount: r.amount,
      purpose: r.purpose.trim(),
      contribution_date: r.contributionDate,
      receipt_code: r.receiptCode ? r.receiptCode.trim() : null,
      note: r.note ? r.note.trim() : null,
      user_id: r.userId || null,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: inserted, error } = await adminClient
      .from("contributions")
      .insert(insertPayloads)
      .select("id");

    if (error) {
      return { success: false, importedCount: 0, skippedCount: rowsToImport.length, error: error.message };
    }

    const count = inserted ? inserted.length : 0;

    await adminClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "IMPORT_CONTRIBUTIONS_EXCEL",
      entity_type: "CONTRIBUTION",
      entity_id: user.id,
      old_value: null,
      new_value: {
        imported_count: count,
        total_requested: rowsToImport.length,
      },
    });

    return {
      success: true,
      importedCount: count,
      skippedCount: 0,
      message: `Đã nhập thành công ${count} mục đóng góp vào sổ công đức dòng họ.`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      importedCount: 0,
      skippedCount: rowsToImport.length,
      error: err instanceof Error ? err.message : "Lỗi thực thi nhập dữ liệu",
    };
  }
}
