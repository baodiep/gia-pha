import { describe, it, expect } from "vitest";

interface UserContext {
  userId: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  isAdmin: boolean;
}

interface ContributionRecord {
  id: string;
  contributorName: string;
  amount: number;
  deletedAt: string | null;
}

interface PasswordResetRecord {
  id: string;
  phoneNormalized: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
}

interface ClaimRecord {
  id: string;
  userId: string;
  personId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ResourceRecord {
  id: string;
  title: string;
  isPublished: boolean;
  deletedAt: string | null;
}

function evaluateRlsSelectContribution(user: UserContext | null, rec: ContributionRecord): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  return rec.deletedAt === null;
}

function evaluateRlsMutateContribution(user: UserContext | null): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  return user.isAdmin;
}

function evaluateRlsSelectPasswordReset(user: UserContext | null): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  return user.isAdmin;
}

function evaluateRlsSelectClaim(user: UserContext | null, claim: ClaimRecord): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  if (user.isAdmin) return true;
  return claim.userId === user.userId;
}

function evaluateRlsMutateClaim(user: UserContext | null): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  return user.isAdmin;
}

function evaluateRlsSelectResource(user: UserContext | null, res: ResourceRecord): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  if (res.deletedAt !== null) return false;
  if (user.isAdmin) return true;
  return res.isPublished;
}

describe("MVP2 RLS, Privacy & Permissions validation", () => {
  const adminUser: UserContext = { userId: "admin-1", status: "ACTIVE", isAdmin: true };
  const memberA: UserContext = { userId: "member-a", status: "ACTIVE", isAdmin: false };
  const memberB: UserContext = { userId: "member-b", status: "ACTIVE", isAdmin: false };
  const pendingUser: UserContext = { userId: "pending-1", status: "PENDING", isAdmin: false };

  describe("Contributions table RLS", () => {
    const contribution: ContributionRecord = {
      id: "c-1",
      contributorName: "Nguyễn Văn A",
      amount: 1000000,
      deletedAt: null,
    };
    const deletedContribution: ContributionRecord = {
      id: "c-2",
      contributorName: "Ẩn danh",
      amount: 500000,
      deletedAt: "2026-08-26",
    };

    it("allows active member to select active contributions", () => {
      expect(evaluateRlsSelectContribution(memberA, contribution)).toBe(true);
      expect(evaluateRlsSelectContribution(memberA, deletedContribution)).toBe(false);
      expect(evaluateRlsSelectContribution(pendingUser, contribution)).toBe(false);
      expect(evaluateRlsSelectContribution(null, contribution)).toBe(false);
    });

    it("restricts contribution mutation (insert/update/delete) to ADMIN only", () => {
      expect(evaluateRlsMutateContribution(adminUser)).toBe(true);
      expect(evaluateRlsMutateContribution(memberA)).toBe(false);
      expect(evaluateRlsMutateContribution(pendingUser)).toBe(false);
      expect(evaluateRlsMutateContribution(null)).toBe(false);
    });
  });

  describe("Password reset requests privacy", () => {
    it("restricts reading password reset queue to ADMIN only", () => {
      expect(evaluateRlsSelectPasswordReset(adminUser)).toBe(true);
      expect(evaluateRlsSelectPasswordReset(memberA)).toBe(false);
      expect(evaluateRlsSelectPasswordReset(pendingUser)).toBe(false);
      expect(evaluateRlsSelectPasswordReset(null)).toBe(false);
    });
  });

  describe("Person Claim & Profile Change requests RLS", () => {
    const claimA: ClaimRecord = { id: "claim-1", userId: "member-a", personId: "p-1", status: "PENDING" };

    it("allows user to view only their own claim and admin to view all", () => {
      expect(evaluateRlsSelectClaim(memberA, claimA)).toBe(true);
      expect(evaluateRlsSelectClaim(memberB, claimA)).toBe(false);
      expect(evaluateRlsSelectClaim(adminUser, claimA)).toBe(true);
      expect(evaluateRlsSelectClaim(pendingUser, claimA)).toBe(false);
    });

    it("allows only admin to approve/reject claims", () => {
      expect(evaluateRlsMutateClaim(adminUser)).toBe(true);
      expect(evaluateRlsMutateClaim(memberA)).toBe(false);
    });
  });

  describe("Family Resources RLS", () => {
    const published: ResourceRecord = { id: "r-1", title: "Kỷ yếu", isPublished: true, deletedAt: null };
    const draft: ResourceRecord = { id: "r-2", title: "Bản thảo", isPublished: false, deletedAt: null };
    const deleted: ResourceRecord = { id: "r-3", title: "Xóa", isPublished: true, deletedAt: "2026-08-26" };

    it("allows member to view only published resources", () => {
      expect(evaluateRlsSelectResource(memberA, published)).toBe(true);
      expect(evaluateRlsSelectResource(memberA, draft)).toBe(false);
      expect(evaluateRlsSelectResource(memberA, deleted)).toBe(false);
    });

    it("allows admin to view draft and published resources", () => {
      expect(evaluateRlsSelectResource(adminUser, published)).toBe(true);
      expect(evaluateRlsSelectResource(adminUser, draft)).toBe(true);
      expect(evaluateRlsSelectResource(adminUser, deleted)).toBe(false);
    });
  });
});
