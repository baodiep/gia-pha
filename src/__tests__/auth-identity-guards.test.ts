import { describe, it, expect } from "vitest";
import { normalizePhone, toLoginName, toInternalEmail, fromInternalEmail } from "@/lib/auth/identity";
import { assertActiveAccount, isAccountActive, AuthError } from "@/lib/auth/guards";
import { Profile } from "@/types/domain";

describe("Phone normalization & identity mapper", () => {
  it("normalizes phone formats correctly to 10 digits starting with 0", () => {
    expect(normalizePhone("0912 345 678")).toBe("0912345678");
    expect(normalizePhone("0912.345.678")).toBe("0912345678");
    expect(normalizePhone("0912-345-678")).toBe("0912345678");
    expect(normalizePhone("+84912345678")).toBe("0912345678");
    expect(normalizePhone("84912345678")).toBe("0912345678");
    expect(normalizePhone("0912345678@")).toBe("0912345678");
  });

  it("throws error for invalid phone formats", () => {
    expect(() => normalizePhone("")).toThrow();
    expect(() => normalizePhone("123456")).toThrow();
    expect(() => normalizePhone("0123456789")).toThrow(); // 01 is not a modern VN prefix
    expect(() => normalizePhone("091234567890")).toThrow(); // > 10 digits
  });

  it("converts to visible login name without trailing @", () => {
    expect(toLoginName("0912 345 678")).toBe("0912345678");
    expect(toLoginName("+84987654321")).toBe("0987654321");
  });

  it("maps to internal email correctly", () => {
    expect(toInternalEmail("0912 345 678", "auth.giapha.local")).toBe("0912345678@auth.giapha.local");
    expect(fromInternalEmail("0912345678@auth.giapha.local")).toBe("0912345678");
  });
});

describe("Account status guards", () => {
  const baseProfile: Profile = {
    id: "user-123",
    phone_normalized: "0912345678",
    login_name: "0912345678",
    person_id: null,
    status: "ACTIVE",
    is_admin: false,
    must_change_password: false,
    activated_at: "2026-08-25T00:00:00Z",
    activated_by: "admin-1",
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
  };

  it("passes for ACTIVE profile", () => {
    expect(() => assertActiveAccount(baseProfile)).not.toThrow();
    expect(isAccountActive("ACTIVE")).toBe(true);
  });

  it("throws for PENDING profile with code ACCOUNT_PENDING", () => {
    const pendingProfile: Profile = { ...baseProfile, status: "PENDING" };
    expect(isAccountActive("PENDING")).toBe(false);
    expect(() => assertActiveAccount(pendingProfile)).toThrowError(AuthError);
    try {
      assertActiveAccount(pendingProfile);
    } catch (e) {
      expect((e as AuthError).code).toBe("ACCOUNT_PENDING");
    }
  });

  it("throws for SUSPENDED profile with code ACCOUNT_SUSPENDED", () => {
    const suspendedProfile: Profile = { ...baseProfile, status: "SUSPENDED" };
    expect(isAccountActive("SUSPENDED")).toBe(false);
    expect(() => assertActiveAccount(suspendedProfile)).toThrowError(AuthError);
    try {
      assertActiveAccount(suspendedProfile);
    } catch (e) {
      expect((e as AuthError).code).toBe("ACCOUNT_SUSPENDED");
    }
  });

  it("throws for null profile", () => {
    expect(() => assertActiveAccount(null)).toThrowError(AuthError);
  });
});
