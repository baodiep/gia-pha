import { AccountStatus, Profile } from "@/types/domain";

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Validates whether an account state allows active operation.
 * - PENDING: Not allowed to access data
 * - SUSPENDED: Blocked
 * - ACTIVE: Allowed
 */
export function assertActiveAccount(profile: Profile | null | undefined): asserts profile is Profile {
  if (!profile) {
    throw new AuthError("Tài khoản chưa được liên kết thông tin người dùng", "UNAUTHORIZED");
  }

  if (profile.status === "PENDING") {
    throw new AuthError("Tài khoản đang chờ Admin duyệt kích hoạt", "ACCOUNT_PENDING");
  }

  if (profile.status === "SUSPENDED") {
    throw new AuthError("Tài khoản đã bị tạm khóa bởi quản trị viên", "ACCOUNT_SUSPENDED");
  }

  if (profile.status !== "ACTIVE") {
    throw new AuthError("Trạng thái tài khoản không hợp lệ", "ACCOUNT_INVALID");
  }
}

/**
 * Returns true if the account is ACTIVE
 */
export function isAccountActive(status: AccountStatus): boolean {
  return status === "ACTIVE";
}
