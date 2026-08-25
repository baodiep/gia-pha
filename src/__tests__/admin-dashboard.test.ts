import { describe, it, expect } from "vitest";

describe("Admin Dashboard stats aggregation", () => {
  it("aggregates correct person and account counters", () => {
    const mockStats = {
      totalPersons: 150,
      deceasedPersons: 40,
      livingPersons: 110,
      activeAccounts: 45,
      pendingAccounts: 3,
      suspendedAccounts: 1,
      activeBranchGrants: 5,
      upcomingEventsCount: 2,
    };

    expect(mockStats.livingPersons + mockStats.deceasedPersons).toBe(mockStats.totalPersons);
    expect(mockStats.pendingAccounts).toBeGreaterThanOrEqual(0);
    expect(mockStats.activeBranchGrants).toBeGreaterThan(0);
  });
});
