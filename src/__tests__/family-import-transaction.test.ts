import { describe, it, expect } from "vitest";
import { buildImportTransactionPlan } from "@/lib/family-import/transaction-planner";
import { ParsedFamilyMemberRow } from "@/lib/family-import/parser";

describe("Transactional Family Import Planning (T025)", () => {
  const sampleRows: ParsedFamilyMemberRow[] = [
    {
      rowNumber: 2,
      externalId: "TV001",
      fullName: "Cụ Tổ A",
      gender: "MALE",
      lifeStatus: "DECEASED",
      spouseExternalIds: ["TV002"],
      deathLunarIsLeapMonth: false,
    },
    {
      rowNumber: 3,
      externalId: "TV002",
      fullName: "Cụ Bà B",
      gender: "FEMALE",
      lifeStatus: "DECEASED",
      spouseExternalIds: ["TV001"],
      deathLunarIsLeapMonth: false,
    },
    {
      rowNumber: 4,
      externalId: "TV003",
      fullName: "Con Trưởng C",
      gender: "MALE",
      lifeStatus: "LIVING",
      fatherExternalId: "TV001",
      motherExternalId: "TV002",
      spouseExternalIds: [],
      deathLunarIsLeapMonth: false,
    },
  ];

  it("should create correct transaction plan with deduplicated unions", () => {
    const batchId = "batch-12345";
    const plan = buildImportTransactionPlan(batchId, sampleRows);

    expect(plan.batchId).toBe(batchId);
    expect(plan.personsToInsert.length).toBe(3);

    // Parent-child links: 1 father (lineage) + 1 mother (non-lineage)
    expect(plan.parentChildLinks.length).toBe(2);
    const fatherLink = plan.parentChildLinks.find((l) => l.parentExternalId === "TV001" && l.childExternalId === "TV003");
    expect(fatherLink).toBeDefined();
    expect(fatherLink?.isLineage).toBe(true);

    const motherLink = plan.parentChildLinks.find((l) => l.parentExternalId === "TV002" && l.childExternalId === "TV003");
    expect(motherLink).toBeDefined();
    expect(motherLink?.isLineage).toBe(false);

    // Unions deduplicated (TV001-TV002 and TV002-TV001 counted once)
    expect(plan.unionsToCreate.length).toBe(1);
    expect(
      (plan.unionsToCreate[0].partner1ExternalId === "TV001" && plan.unionsToCreate[0].partner2ExternalId === "TV002") ||
      (plan.unionsToCreate[0].partner1ExternalId === "TV002" && plan.unionsToCreate[0].partner2ExternalId === "TV001")
    ).toBe(true);
  });
});
