/**
 * Phone normalization & login identity utilities for MVP 1
 */

const DEFAULT_AUTH_DOMAIN = "auth.giapha.local";

export function getAuthDomain(): string {
  return process.env.AUTH_INTERNAL_EMAIL_DOMAIN || DEFAULT_AUTH_DOMAIN;
}

/**
 * Normalizes Vietnamese phone number:
 * - Removes whitespace, dots, dashes, parentheses
 * - Replaces leading +84 or 84 with 0
 * - Validates standard VN phone pattern (10 digits starting with 0)
 */
export function normalizePhone(input: string): string {
  if (!input) {
    throw new Error("Số điện thoại không được để trống");
  }

  // Remove common format chars
  let cleaned = input.trim().replace(/[\s.\-()]/g, "");

  // If user inputs with @ suffix (backward-compat tolerance)
  if (cleaned.endsWith("@")) {
    cleaned = cleaned.slice(0, -1);
  }

  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length >= 11) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Basic regex check for 10 digits starting with 0
  const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
  if (!phoneRegex.test(cleaned)) {
    throw new Error("Số điện thoại không hợp lệ (phải gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)");
  }

  return cleaned;
}

/**
 * Converts phone number to visible login name (e.g. 0912345678, no @ suffix)
 */
export function toLoginName(phoneInput: string): string {
  return normalizePhone(phoneInput);
}

/**
 * Maps visible login name or phone input to internal Supabase Auth email
 */
export function toInternalEmail(input: string, domain = getAuthDomain()): string {
  const normalized = normalizePhone(input);
  return `${normalized}@${domain}`;
}

/**
 * Extracts visible login name from internal Supabase Auth email
 */
export function fromInternalEmail(email: string): string {
  const [user] = email.split("@");
  return user;
}

