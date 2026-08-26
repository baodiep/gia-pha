"use server";

import { parseFamilyExcelBuffer, ParsedFamilyMemberRow } from "@/lib/family-import/parser";
import { analyzeFamilyImportPreview, FamilyImportPreviewResult, ExistingPersonSummary } from "@/lib/family-import/preview";
import { getCurrentUser } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function parseAndPreviewFamilyExcelAction(formData: FormData): Promise<{
  success: boolean;
  data?: FamilyImportPreviewResult;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Chỉ Quản trị viên (Admin) mới có quyền nhập gia phả từ Excel" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Vui lòng chọn file Excel để tải lên" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Dung lượng file vượt quá giới hạn 10MB" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const parseResult = parseFamilyExcelBuffer(arrayBuffer);

    if (parseResult.errors.length > 0 && parseResult.validRows.length === 0) {
      return {
        success: false,
        error: `File có ${parseResult.errors.length} lỗi cấu trúc: ${parseResult.errors[0].message}`,
      };
    }

    // Fetch existing persons for duplicate and reference checks
    const supabase = await createClient();
    const { data: dbPersons } = await supabase
      .from("persons")
      .select("id, full_name, birth_date, generation_no, branch_code")
      .is("deleted_at", null);

    const existingList: ExistingPersonSummary[] = (dbPersons || []).map((p: {
      id: string;
      full_name: string;
      birth_date: string | null;
      generation_no: number | null;
      branch_code: string | null;
    }) => ({
      id: p.id,
      fullName: p.full_name,
      birthDate: p.birth_date,
      generationNo: p.generation_no,
      branchCode: p.branch_code,
    }));

    const previewResult = analyzeFamilyImportPreview(parseResult.validRows, existingList);

    return {
      success: true,
      data: previewResult,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: `Lỗi xử lý: ${err instanceof Error ? err.message : "Định dạng không hợp lệ"}`,
    };
  }
}

export async function filterOrUpdatePreviewRowsAction(
  rows: ParsedFamilyMemberRow[]
): Promise<{
  success: boolean;
  data?: FamilyImportPreviewResult;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return { success: false, error: "Không có quyền thực hiện thao tác" };
    }

    const supabase = await createClient();
    const { data: dbPersons } = await supabase
      .from("persons")
      .select("id, full_name, birth_date, generation_no, branch_code")
      .is("deleted_at", null);

    const existingList: ExistingPersonSummary[] = (dbPersons || []).map((p: {
      id: string;
      full_name: string;
      birth_date: string | null;
      generation_no: number | null;
      branch_code: string | null;
    }) => ({
      id: p.id,
      fullName: p.full_name,
      birthDate: p.birth_date,
      generationNo: p.generation_no,
      branchCode: p.branch_code,
    }));

    const previewResult = analyzeFamilyImportPreview(rows, existingList);

    return {
      success: true,
      data: previewResult,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Lỗi kiểm tra dữ liệu",
    };
  }
}

