import { ParsedFamilyMemberRow } from "./parser";

export type RowValidationStatus = "VALID" | "WARNING" | "ERROR";

export interface ExistingPersonSummary {
  id: string;
  fullName: string;
  birthDate?: string | null;
  generationNo?: number | null;
  branchCode?: string | null;
}

export interface PreviewRowItem {
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
  status: RowValidationStatus;
  errors: string[];
  warnings: string[];
  duplicateMatches?: ExistingPersonSummary[];
}

export interface FamilyImportPreviewResult {
  canProceed: boolean;
  totalCount: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: PreviewRowItem[];
}

/**
 * Detect cycles in parent-child relationships from parsed rows
 */
export function detectLineageCycles(rows: ParsedFamilyMemberRow[]): { [extId: string]: string } {
  const parentMap = new Map<string, string[]>();

  rows.forEach((r) => {
    const parents: string[] = [];
    if (r.fatherExternalId) parents.push(r.fatherExternalId);
    if (r.motherExternalId) parents.push(r.motherExternalId);
    parentMap.set(r.externalId, parents);
  });

  const cycleErrors: { [extId: string]: string } = {};

  function checkCycle(currentId: string, visited: Set<string>, path: string[]): boolean {
    if (visited.has(currentId)) {
      cycleErrors[currentId] = `Phát hiện vòng lặp quan hệ cha/mẹ - con: ${[...path, currentId].join(" -> ")}`;
      return true;
    }
    visited.add(currentId);
    path.push(currentId);

    const parents = parentMap.get(currentId) || [];
    for (const p of parents) {
      if (checkCycle(p, new Set(visited), [...path])) {
        return true;
      }
    }
    return false;
  }

  rows.forEach((r) => {
    checkCycle(r.externalId, new Set(), []);
  });

  return cycleErrors;
}

/**
 * Find potential duplicate persons against existing DB persons
 */
export function findPotentialDuplicates(
  row: ParsedFamilyMemberRow,
  existingPersons: ExistingPersonSummary[]
): ExistingPersonSummary[] {
  const normName = row.fullName.trim().toLowerCase();
  return existingPersons.filter((p) => {
    const pName = p.fullName.trim().toLowerCase();
    if (pName !== normName) return false;

    // If both have birth date and match
    if (row.birthDate && p.birthDate && row.birthDate === p.birthDate) return true;
    // If both have generation and match
    if (row.generationNo && p.generationNo && row.generationNo === p.generationNo) return true;

    // Exact name match
    return true;
  });
}

/**
 * Perform comprehensive preview & validation checks
 */
export function analyzeFamilyImportPreview(
  parsedRows: ParsedFamilyMemberRow[],
  existingPersons: ExistingPersonSummary[] = []
): FamilyImportPreviewResult {
  const externalIdSet = new Set<string>();
  const idToRow = new Map<string, ParsedFamilyMemberRow>();

  parsedRows.forEach((r) => {
    externalIdSet.add(r.externalId);
    idToRow.set(r.externalId, r);
  });

  const cycleErrors = detectLineageCycles(parsedRows);

  const previewRows: PreviewRowItem[] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  parsedRows.forEach((r) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Self parent check
    if (r.fatherExternalId && r.fatherExternalId === r.externalId) {
      errors.push("Mã cha không thể trùng với chính mã thành viên (tự làm cha chính mình)");
    }
    if (r.motherExternalId && r.motherExternalId === r.externalId) {
      errors.push("Mã mẹ không thể trùng với chính mã thành viên (tự làm mẹ chính mình)");
    }

    // 2. Cycle detection
    if (cycleErrors[r.externalId]) {
      errors.push(cycleErrors[r.externalId]);
    }

    // 3. Parent references
    if (r.fatherExternalId) {
      const father = idToRow.get(r.fatherExternalId);
      if (!father && !existingPersons.some((p) => p.id === r.fatherExternalId)) {
        warnings.push(`Mã cha '${r.fatherExternalId}' không tìm thấy trong file hoặc hệ thống hiện có`);
      } else if (father && father.gender === "FEMALE") {
        warnings.push(`Thành viên '${r.fatherExternalId}' được chỉ định làm cha nhưng giới tính trong file là Nữ`);
      }
    }

    if (r.motherExternalId) {
      const mother = idToRow.get(r.motherExternalId);
      if (!mother && !existingPersons.some((p) => p.id === r.motherExternalId)) {
        warnings.push(`Mã mẹ '${r.motherExternalId}' không tìm thấy trong file hoặc hệ thống hiện có`);
      } else if (mother && mother.gender === "MALE") {
        warnings.push(`Thành viên '${r.motherExternalId}' được chỉ định làm mẹ nhưng giới tính trong file là Nam`);
      }
    }

    // 4. Spouse self & duplicates
    if (r.spouseExternalIds.includes(r.externalId)) {
      errors.push("Mã vợ/chồng không thể là chính thành viên này");
    }

    const uniqueSpouses = new Set(r.spouseExternalIds);
    if (uniqueSpouses.size < r.spouseExternalIds.length) {
      warnings.push("Danh sách vợ/chồng có mã bị lặp lại");
    }

    // 5. Date validation logic
    if (r.birthDate && r.deathDate && r.birthDate > r.deathDate) {
      errors.push(`Ngày sinh (${r.birthDate}) không thể sau ngày mất (${r.deathDate})`);
    }

    if (r.lifeStatus === "LIVING" && r.deathDate) {
      warnings.push("Trạng thái là 'Còn sống' nhưng có điền ngày mất");
    }

    if (r.lifeStatus === "DECEASED" && !r.deathDate && !r.deathLunarDay) {
      warnings.push("Trạng thái 'Đã mất' nhưng chưa có ngày mất hoặc ngày giỗ âm");
    }

    // 6. Duplicate detection against DB
    const duplicates = findPotentialDuplicates(r, existingPersons);
    if (duplicates.length > 0) {
      warnings.push(`Trùng họ tên với ${duplicates.length} thành viên đã có trên hệ thống (${duplicates.map((d) => d.fullName).join(", ")})`);
    }

    let status: RowValidationStatus = "VALID";
    if (errors.length > 0) {
      status = "ERROR";
      errorCount++;
    } else if (warnings.length > 0) {
      status = "WARNING";
      warningCount++;
    } else {
      validCount++;
    }

    previewRows.push({
      ...r,
      status,
      errors,
      warnings,
      duplicateMatches: duplicates.length > 0 ? duplicates : undefined,
    });
  });

  return {
    canProceed: errorCount === 0,
    totalCount: parsedRows.length,
    validCount,
    warningCount,
    errorCount,
    rows: previewRows,
  };
}
