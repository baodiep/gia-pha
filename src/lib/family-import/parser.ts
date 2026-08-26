import * as XLSX from "xlsx";
import { z } from "zod";

export interface ParsedFamilyMemberRow {
  rowNumber: number;
  externalId: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
  birthDate?: string;
  deathDate?: string;
  deathLunarDay?: number;
  deathLunarMonth?: number;
  deathLunarIsLeapMonth: boolean;
  deathAnniversaryNote?: string;
  fatherExternalId?: string;
  motherExternalId?: string;
  spouseExternalIds: string[];
  generationNo?: number;
  branchCode?: string;
  birthPlace?: string;
  hometown?: string;
  bio?: string;
}

export interface ParseFamilyExcelResult {
  success: boolean;
  totalRows: number;
  validRows: ParsedFamilyMemberRow[];
  errors: Array<{
    rowNumber: number;
    column?: string;
    message: string;
  }>;
  warnings: Array<{
    rowNumber: number;
    column?: string;
    message: string;
  }>;
}

const RowSchema = z.object({
  externalId: z.string().min(1, "Mã thành viên (external_id) không được để trống"),
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]),
  lifeStatus: z.enum(["LIVING", "DECEASED", "UNKNOWN"]),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  deathLunarDay: z.number().int().min(1).max(30).optional(),
  deathLunarMonth: z.number().int().min(1).max(12).optional(),
  deathLunarIsLeapMonth: z.boolean().default(false),
  deathAnniversaryNote: z.string().optional(),
  fatherExternalId: z.string().optional(),
  motherExternalId: z.string().optional(),
  spouseExternalIds: z.array(z.string()).default([]),
  generationNo: z.number().int().min(1).max(100).optional(),
  branchCode: z.string().optional(),
  birthPlace: z.string().optional(),
  hometown: z.string().optional(),
  bio: z.string().optional(),
});

function normalizeGender(raw: unknown): "MALE" | "FEMALE" | "OTHER" | "UNKNOWN" {
  if (typeof raw !== "string") return "UNKNOWN";
  const s = raw.trim().toLowerCase();
  if (["nam", "male", "m", "trai"].includes(s)) return "MALE";
  if (["nu", "nữ", "female", "f", "gái"].includes(s)) return "FEMALE";
  if (["khac", "khác", "other"].includes(s)) return "OTHER";
  return "UNKNOWN";
}

function normalizeLifeStatus(raw: unknown): "LIVING" | "DECEASED" | "UNKNOWN" {
  if (typeof raw !== "string") return "LIVING";
  const s = raw.trim().toLowerCase();
  if (["mat", "mất", "da mat", "đã mất", "deceased", "dead"].includes(s)) return "DECEASED";
  if (["song", "sống", "con song", "còn sống", "living", "alive"].includes(s)) return "LIVING";
  return "UNKNOWN";
}

function parseExcelDate(val: unknown): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }
  if (typeof val === "number") {
    // Excel serial number date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const y = String(d.y).padStart(4, "0");
      const m = String(d.m).padStart(2, "0");
      const day = String(d.d).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const parts = s.split(/[/.-]/);
    if (parts.length === 3) {
      // dd/mm/yyyy or yyyy-mm-dd
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
  }
  return undefined;
}

export function parseFamilyExcelBuffer(buffer: Buffer | ArrayBuffer): ParseFamilyExcelResult {
  const errors: ParseFamilyExcelResult["errors"] = [];
  const warnings: ParseFamilyExcelResult["warnings"] = [];
  const validRows: ParsedFamilyMemberRow[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch (err: unknown) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      errors: [{ rowNumber: 0, message: `Không thể đọc file Excel: ${err instanceof Error ? err.message : "Định dạng không hợp lệ"}` }],
      warnings: [],
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      errors: [{ rowNumber: 0, message: "File Excel không chứa sheet nào" }],
      warnings: [],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (rawRows.length === 0) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      errors: [{ rowNumber: 0, message: "Sheet rỗng hoặc không có dữ liệu hàng" }],
      warnings: [],
    };
  }

  const externalIdSet = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // header is row 1

    // Extract fields by flexible column names
    const externalId = String(row["Mã thành viên"] || row["external_id"] || row["Ma_TV"] || "").trim();
    const fullName = String(row["Họ và tên"] || row["full_name"] || row["Ho_ten"] || "").trim();
    const genderRaw = row["Giới tính"] || row["gender"] || row["Gioi_tinh"];
    const lifeStatusRaw = row["Tình trạng"] || row["Trạng thái"] || row["life_status"] || row["Trang_thai"];
    const birthDateRaw = row["Ngày sinh"] || row["birth_date"] || row["Ngay_sinh"];
    const deathDateRaw = row["Ngày mất"] || row["death_date"] || row["Ngay_mat"];
    const deathLunarDayRaw = row["Ngày giỗ âm"] || row["death_lunar_day"] || row["Ngay_gio_am"];
    const deathLunarMonthRaw = row["Tháng giỗ âm"] || row["death_lunar_month"] || row["Thang_gio_am"];
    const deathLunarIsLeapRaw = row["Tháng nhuận"] || row["death_lunar_is_leap_month"] || row["Thang_nhuan"];
    const deathNote = String(row["Ghi chú ngày giỗ"] || row["death_anniversary_note"] || "").trim() || undefined;
    const fatherExtId = String(row["Mã cha"] || row["father_external_id"] || row["Ma_cha"] || "").trim() || undefined;
    const motherExtId = String(row["Mã mẹ"] || row["mother_external_id"] || row["Ma_me"] || "").trim() || undefined;
    const spouseRaw = String(row["Mã vợ/chồng"] || row["spouse_external_ids"] || row["Ma_vo_chong"] || "").trim();
    const genNoRaw = row["Đời"] || row["generation_no"] || row["Doi"];
    const branchCode = String(row["Chi/Nhánh"] || row["branch_code"] || row["Chi"] || "").trim() || undefined;
    const birthPlace = String(row["Nơi sinh"] || row["birth_place"] || row["Noi_sinh"] || "").trim() || undefined;
    const hometown = String(row["Quê quán"] || row["hometown"] || row["Que_quan"] || "").trim() || undefined;
    const bio = String(row["Tiểu sử"] || row["bio"] || row["Tieu_su"] || "").trim() || undefined;

    if (!externalId && !fullName) {
      // Empty row skipped
      return;
    }

    if (externalId && externalIdSet.has(externalId)) {
      errors.push({
        rowNumber,
        column: "Mã thành viên",
        message: `Mã thành viên '${externalId}' bị trùng lặp trong file`,
      });
      return;
    }

    if (externalId) {
      externalIdSet.add(externalId);
    }

    const gender = normalizeGender(genderRaw);
    const lifeStatus = normalizeLifeStatus(lifeStatusRaw);
    const birthDate = parseExcelDate(birthDateRaw);
    const deathDate = parseExcelDate(deathDateRaw);

    const deathLunarDay = deathLunarDayRaw ? Number(deathLunarDayRaw) : undefined;
    const deathLunarMonth = deathLunarMonthRaw ? Number(deathLunarMonthRaw) : undefined;
    const deathLunarIsLeapMonth = Boolean(deathLunarIsLeapRaw === true || deathLunarIsLeapRaw === "true" || deathLunarIsLeapRaw === 1 || deathLunarIsLeapRaw === "Có" || deathLunarIsLeapRaw === "x");

    const generationNo = genNoRaw ? Number(genNoRaw) : undefined;

    const spouseExternalIds = spouseRaw
      ? spouseRaw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedCandidate = {
      externalId,
      fullName,
      gender,
      lifeStatus,
      birthDate,
      deathDate,
      deathLunarDay,
      deathLunarMonth,
      deathLunarIsLeapMonth,
      deathAnniversaryNote: deathNote,
      fatherExternalId: fatherExtId,
      motherExternalId: motherExtId,
      spouseExternalIds,
      generationNo,
      branchCode,
      birthPlace,
      hometown,
      bio,
    };

    const validateResult = RowSchema.safeParse(parsedCandidate);
    if (!validateResult.success) {
      for (const issue of validateResult.error.issues) {
        errors.push({
          rowNumber,
          column: issue.path.join("."),
          message: issue.message,
        });
      }
    } else {
      validRows.push({
        rowNumber,
        ...validateResult.data,
      });
    }
  });

  // Cross reference validation
  validRows.forEach((row) => {
    if (row.fatherExternalId && !externalIdSet.has(row.fatherExternalId)) {
      warnings.push({
        rowNumber: row.rowNumber,
        column: "Mã cha",
        message: `Mã cha '${row.fatherExternalId}' không có trong file hiện tại (sẽ tìm trên hệ thống khi import)`,
      });
    }
    if (row.motherExternalId && !externalIdSet.has(row.motherExternalId)) {
      warnings.push({
        rowNumber: row.rowNumber,
        column: "Mã mẹ",
        message: `Mã mẹ '${row.motherExternalId}' không có trong file hiện tại (sẽ tìm trên hệ thống khi import)`,
      });
    }
    row.spouseExternalIds.forEach((spId) => {
      if (!externalIdSet.has(spId)) {
        warnings.push({
          rowNumber: row.rowNumber,
          column: "Mã vợ/chồng",
          message: `Mã vợ/chồng '${spId}' không có trong file hiện tại (sẽ tìm trên hệ thống khi import)`,
        });
      }
    });
  });

  return {
    success: errors.length === 0,
    totalRows: rawRows.length,
    validRows,
    errors,
    warnings,
  };
}

export function generateFamilyExcelTemplateBuffer(): Buffer {
  const headers = [
    "Mã thành viên",
    "Họ và tên",
    "Giới tính",
    "Tình trạng",
    "Ngày sinh",
    "Ngày mất",
    "Ngày giỗ âm",
    "Tháng giỗ âm",
    "Tháng nhuận",
    "Ghi chú ngày giỗ",
    "Mã cha",
    "Mã mẹ",
    "Mã vợ/chồng",
    "Đời",
    "Chi/Nhánh",
    "Nơi sinh",
    "Quê quán",
    "Tiểu sử",
  ];

  const sampleRows = [
    [
      "TV001",
      "Nguyễn Văn Thủy Tổ",
      "Nam",
      "Đã mất",
      "1850-01-01",
      "1920-03-15",
      15,
      2,
      "",
      "Giỗ cụ tổ",
      "",
      "",
      "TV002",
      1,
      "Gốc",
      "Hà Nội",
      "Thái Bình",
      "Cụ tổ dòng họ",
    ],
    [
      "TV002",
      "Trần Thị Tổ Mẫu",
      "Nữ",
      "Đã mất",
      "1855-05-10",
      "1925-08-20",
      20,
      7,
      "",
      "Chính thất",
      "",
      "",
      "TV001",
      1,
      "Gốc",
      "Hà Nội",
      "Thái Bình",
      "Tổ mẫu dòng họ",
    ],
    [
      "TV003",
      "Nguyễn Văn Trưởng",
      "Nam",
      "Đã mất",
      "1880-02-14",
      "1950-10-12",
      12,
      9,
      "",
      "Trưởng chi 1",
      "TV001",
      "TV002",
      "TV004",
      2,
      "Chi 1",
      "Hà Nội",
      "Thái Bình",
      "Con trưởng cụ tổ",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, // Mã thành viên
    { wch: 25 }, // Họ và tên
    { wch: 12 }, // Giới tính
    { wch: 12 }, // Tình trạng
    { wch: 15 }, // Ngày sinh
    { wch: 15 }, // Ngày mất
    { wch: 12 }, // Ngày giỗ âm
    { wch: 12 }, // Tháng giỗ âm
    { wch: 12 }, // Tháng nhuận
    { wch: 20 }, // Ghi chú ngày giỗ
    { wch: 15 }, // Mã cha
    { wch: 15 }, // Mã mẹ
    { wch: 18 }, // Mã vợ/chồng
    { wch: 8 },  // Đời
    { wch: 15 }, // Chi/Nhánh
    { wch: 20 }, // Nơi sinh
    { wch: 20 }, // Quê quán
    { wch: 30 }, // Tiểu sử
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Gia_Pha");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
