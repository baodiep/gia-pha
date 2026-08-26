"use server";

import { parseFamilyExcelBuffer, generateFamilyExcelTemplateBuffer, ParseFamilyExcelResult } from "@/lib/family-import/parser";
import { getCurrentUser } from "@/features/auth/actions";

export async function parseFamilyExcelAction(formData: FormData): Promise<{
  success: boolean;
  data?: ParseFamilyExcelResult;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, error: "Bạn không có quyền thực hiện chức năng này" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Vui lòng chọn file Excel để tải lên" };
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Dung lượng file vượt quá giới hạn 10MB" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = parseFamilyExcelBuffer(arrayBuffer);

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: `Lỗi xử lý file: ${err instanceof Error ? err.message : "Định dạng không hợp lệ"}`,
    };
  }
}

export async function getFamilyExcelTemplateBase64(): Promise<{
  success: boolean;
  base64?: string;
  error?: string;
}> {
  try {
    const buffer = generateFamilyExcelTemplateBuffer();
    const base64 = buffer.toString("base64");
    return { success: true, base64 };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Không thể tạo file mẫu" };
  }
}
