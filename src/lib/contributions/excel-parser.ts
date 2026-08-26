"use server";

import * as XLSX from "xlsx";
import { normalizePhone } from "@/lib/auth/identity";

export interface ParsedContributionRow {
  rowNumber: number;
  contributorName: string;
  phone: string | null;
  phoneNormalized: string | null;
  amount: number;
  purpose: string;
  contributionDate: string;
  receiptCode: string | null;
  note: string | null;
  status: "VALID" | "WARNING" | "ERROR";
  warnings: string[];
  errors: string[];
}

export interface ContributionParseResult {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  rows: ParsedContributionRow[];
}

/**
 * Generate Excel Template for Contribution Import
 */
export async function generateContributionTemplateAction(): Promise<string> {
  const headers = [
    "Họ và tên (*)",
    "Số điện thoại",
    "Số tiền VNĐ (*)",
    "Mục đích đóng góp (*)",
    "Ngày đóng góp (YYYY-MM-DD) (*)",
    "Mã biên lai/Chứng từ",
    "Ghi chú",
  ];

  const sampleData = [
    [
      "Nguyễn Văn An",
      "0912345678",
      5000000,
      "Quỹ khuyến học dòng họ 2026",
      "2026-08-26",
      "BL-2026-01",
      "Chuyển khoản qua Vietcombank",
    ],
    [
      "Trần Thị Bình",
      "0987654321",
      2000000,
      "Tôn tạo nhà thờ chi 1",
      "2026-08-25",
      "BL-2026-02",
      "Gửi tiền mặt cho thủ quỹ",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "So_Cong_Duc");

  const buffer = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  return buffer;
}

/**
 * Parse uploaded Excel file buffer into validated contribution rows
 */
export function parseContributionExcel(buffer: ArrayBuffer): ContributionParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data: Array<Array<string | number | undefined>> = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  if (!data || data.length <= 1) {
    return {
      totalRows: 0,
      validRows: 0,
      warningRows: 0,
      errorRows: 0,
      rows: [],
    };
  }

  // Row 0 is header
  const rows: ParsedContributionRow[] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (let i = 1; i < data.length; i++) {
    const raw = data[i];
    if (!raw || raw.every((cell) => cell === undefined || String(cell).trim() === "")) {
      continue; // Skip empty rows
    }

    const rowNum = i + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    const name = String(raw[0] || "").trim();
    const rawPhone = String(raw[1] || "").trim();
    const rawAmount = Number(raw[2]);
    const purpose = String(raw[3] || "").trim();
    const rawDate = String(raw[4] || "").trim();
    const receipt = String(raw[5] || "").trim() || null;
    const note = String(raw[6] || "").trim() || null;

    if (!name || name.length < 2) {
      errors.push("Họ tên người đóng góp bắt buộc (tối thiểu 2 ký tự)");
    }

    let normPhone: string | null = null;
    if (rawPhone) {
      try {
        normPhone = normalizePhone(rawPhone);
      } catch {
        warnings.push("Số điện thoại không đúng định dạng VN tiêu chuẩn");
      }
    } else {
      warnings.push("Không có số điện thoại (sẽ không tự động liên kết tài khoản)");
    }

    if (isNaN(rawAmount) || rawAmount <= 0) {
      errors.push("Số tiền đóng góp phải là số dương hợp lệ");
    }

    if (!purpose || purpose.length < 2) {
      errors.push("Mục đích đóng góp bắt buộc");
    }

    let formattedDate = rawDate;
    if (!rawDate) {
      errors.push("Ngày đóng góp bắt buộc (định dạng YYYY-MM-DD)");
    } else {
      // Validate date regex or Date parse
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        errors.push("Ngày đóng góp không đúng định dạng chuẩn YYYY-MM-DD");
      } else {
        formattedDate = d.toISOString().split("T")[0];
      }
    }

    let status: "VALID" | "WARNING" | "ERROR" = "VALID";
    if (errors.length > 0) {
      status = "ERROR";
      errorCount++;
    } else if (warnings.length > 0) {
      status = "WARNING";
      warningCount++;
    } else {
      validCount++;
    }

    rows.push({
      rowNumber: rowNum,
      contributorName: name,
      phone: rawPhone || null,
      phoneNormalized: normPhone,
      amount: isNaN(rawAmount) ? 0 : rawAmount,
      purpose,
      contributionDate: formattedDate,
      receiptCode: receipt,
      note,
      status,
      warnings,
      errors,
    });
  }

  return {
    totalRows: rows.length,
    validRows: validCount,
    warningRows: warningCount,
    errorRows: errorCount,
    rows,
  };
}
