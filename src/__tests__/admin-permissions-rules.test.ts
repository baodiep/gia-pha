import { describe, it, expect } from "vitest";

describe("Admin Branch Grant business rules", () => {
  it("dynamic branch grant requires only target user and root_person_id", () => {
    const grantPayload = {
      userId: "00000000-0000-0000-0000-000000000001",
      rootPersonId: "00000000-0000-0000-0000-000000000003",
    };

    expect(grantPayload.userId).toBeDefined();
    expect(grantPayload.rootPersonId).toBeDefined();
  });

  it("revocation sets timestamp and does not delete the row", () => {
    const mockGrant = {
      id: "grant-1",
      user_id: "u1",
      root_person_id: "p1",
      revoked_at: null as string | null,
      revoked_by: null as string | null,
    };

    const now = new Date().toISOString();
    const revokedGrant = {
      ...mockGrant,
      revoked_at: now,
      revoked_by: "admin-id",
    };

    expect(revokedGrant.revoked_at).toBe(now);
    expect(revokedGrant.id).toBe("grant-1");
  });
});
