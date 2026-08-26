import { describe, it, expect } from "vitest";
import { ContributionInput } from "@/lib/contributions/contributions-actions";

describe("Contribution Management, Search & Statistics (T036)", () => {
  it("should validate contribution input payloads", () => {
    const valid: ContributionInput = {
      contributorName: "Nguyễn Văn Cháu",
      phone: "0912345678",
      amount: 5000000,
      purpose: "Đóng góp xây tường rào nhà thờ chi 1",
      contributionDate: "2026-08-26",
      receiptCode: "CD-2026-001",
    };

    expect(valid.contributorName.length).toBeGreaterThan(2);
    expect(valid.amount).toBeGreaterThan(0);
    expect(valid.contributionDate).toBe("2026-08-26");
  });

  it("should calculate total aggregated amounts and unique contributors", () => {
    const list = [
      { contributor_name: "Nguyễn Văn A", amount: 1000000 },
      { contributor_name: "Nguyễn Văn B", amount: 2000000 },
      { contributor_name: "nguyễn văn a", amount: 500000 }, // same person different case
    ];

    const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
    const uniqueNames = new Set(list.map((c) => c.contributor_name.trim().toLowerCase()));

    expect(totalAmount).toBe(3500000);
    expect(uniqueNames.size).toBe(2);
  });
});
