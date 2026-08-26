import { describe, it, expect } from "vitest";
import { analyzeFamilyImportPreview, detectLineageCycles, findPotentialDuplicates } from "@/lib/family-import/preview";
import { ParsedFamilyMemberRow } from "@/lib/family-import/parser";

describe("Family Import Preview & Duplicate/Cycle Detection (T024)", () => {
  it("should detect self-parent errors", () => {
    const rows: ParsedFamilyMemberRow[] = [
      {
        rowNumber: 2,
        externalId: "TV01",
        fullName: "Nguyễn Văn A",
        gender: "MALE",
        lifeStatus: "LIVING",
        fatherExternalId: "TV01", // self-parent
        spouseExternalIds: [],
        deathLunarIsLeapMonth: false,
      },
    ];

    const result = analyzeFamilyImportPreview(rows);
    expect(result.canProceed).toBe(false);
    expect(result.errorCount).toBe(1);
    expect(result.rows[0].errors.some((e) => e.includes("tự làm cha chính mình"))).toBe(true);
  });

  it("should detect lineage cycle relationships (A -> B -> A)", () => {
    const rows: ParsedFamilyMemberRow[] = [
      {
        rowNumber: 2,
        externalId: "TV01",
        fullName: "Nguyễn Văn A",
        gender: "MALE",
        lifeStatus: "LIVING",
        fatherExternalId: "TV02",
        spouseExternalIds: [],
        deathLunarIsLeapMonth: false,
      },
      {
        rowNumber: 3,
        externalId: "TV02",
        fullName: "Nguyễn Văn B",
        gender: "MALE",
        lifeStatus: "LIVING",
        fatherExternalId: "TV01", // cycle: TV01 is father of TV02, and TV02 is father of TV01
        spouseExternalIds: [],
        deathLunarIsLeapMonth: false,
      },
    ];

    const cycleErrors = detectLineageCycles(rows);
    expect(Object.keys(cycleErrors).length).toBeGreaterThan(0);

    const result = analyzeFamilyImportPreview(rows);
    expect(result.canProceed).toBe(false);
    expect(result.errorCount).toBeGreaterThanOrEqual(1);
  });

  it("should detect potential duplicate names against existing database persons", () => {
    const existing = [
      { id: "uuid-1", fullName: "Nguyễn Văn Thủy Tổ", generationNo: 1 },
      { id: "uuid-2", fullName: "Trần Thị B" },
    ];

    const rows: ParsedFamilyMemberRow[] = [
      {
        rowNumber: 2,
        externalId: "TV99",
        fullName: "Nguyễn Văn Thủy Tổ",
        gender: "MALE",
        lifeStatus: "DECEASED",
        generationNo: 1,
        spouseExternalIds: [],
        deathLunarIsLeapMonth: false,
      },
    ];

    const duplicates = findPotentialDuplicates(rows[0], existing);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].id).toBe("uuid-1");

    const result = analyzeFamilyImportPreview(rows, existing);
    expect(result.canProceed).toBe(true); // warning does not block proceeding
    expect(result.warningCount).toBe(1);
    expect(result.rows[0].warnings.some((w) => w.includes("Trùng họ tên"))).toBe(true);
  });

  it("should validate birthDate <= deathDate", () => {
    const rows: ParsedFamilyMemberRow[] = [
      {
        rowNumber: 2,
        externalId: "TV01",
        fullName: "Nguyễn Văn A",
        gender: "MALE",
        lifeStatus: "DECEASED",
        birthDate: "1990-01-01",
        deathDate: "1980-01-01", // invalid: birth > death
        spouseExternalIds: [],
        deathLunarIsLeapMonth: false,
      },
    ];

    const result = analyzeFamilyImportPreview(rows);
    expect(result.canProceed).toBe(false);
    expect(result.errorCount).toBe(1);
    expect(result.rows[0].errors.some((e) => e.includes("không thể sau ngày mất"))).toBe(true);
  });
});
