import { describe, it, expect } from "vitest";
import { adminCreateAccountSchema } from "@/features/admin/account-validation";

describe("Admin create account input validation", () => {
  it("validates valid admin-created account input", () => {
    const valid = {
      phone: "0988776655",
      fullName: "Nguyễn Văn Cháu Mới",
      personId: "00000000-0000-0000-0000-000000000007",
      isAdmin: false,
      temporaryPassword: "TempPass123!@",
    };

    expect(adminCreateAccountSchema.safeParse(valid).success).toBe(true);
  });

  it("fails if temporaryPassword is shorter than 6 characters", () => {
    const invalid = {
      phone: "0988776655",
      fullName: "Nguyễn Văn A",
      temporaryPassword: "123",
    };

    expect(adminCreateAccountSchema.safeParse(invalid).success).toBe(false);
  });

  it("fails if phone or fullName are empty", () => {
    const invalid = {
      phone: "",
      fullName: "",
      temporaryPassword: "TempPass123!@",
    };

    expect(adminCreateAccountSchema.safeParse(invalid).success).toBe(false);
  });
});
