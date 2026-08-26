import { describe, it, expect } from "vitest";
import { generateMathCaptcha, verifyMathCaptcha, generateSecure8DigitPin } from "@/lib/auth/captcha";

describe("Password Reset CAPTCHA & 8-Digit Pin (T027)", () => {
  it("should generate a valid math captcha challenge and verify correct answer", () => {
    const challenge = generateMathCaptcha();
    expect(challenge.question).toContain("+");
    expect(challenge.token).toBeDefined();

    // Parse question to extract expected answer for test
    const match = challenge.question.match(/(\d+)\s*\+\s*(\d+)/);
    expect(match).toBeDefined();
    const sum = Number(match![1]) + Number(match![2]);

    // Correct answer
    expect(verifyMathCaptcha(challenge.token, sum)).toBe(true);
    expect(verifyMathCaptcha(challenge.token, String(sum))).toBe(true);

    // Wrong answer
    expect(verifyMathCaptcha(challenge.token, sum + 1)).toBe(false);
    expect(verifyMathCaptcha(challenge.token, "wrong")).toBe(false);
    expect(verifyMathCaptcha(challenge.token, "")).toBe(false);
  });

  it("should reject tampered or invalid tokens", () => {
    expect(verifyMathCaptcha("invalid-token", 10)).toBe(false);
    expect(verifyMathCaptcha("", 10)).toBe(false);
  });

  it("should generate cryptographically secure 8-digit random PINs", () => {
    for (let i = 0; i < 50; i++) {
      const pin = generateSecure8DigitPin();
      expect(pin).toHaveLength(8);
      expect(/^\d{8}$/.test(pin)).toBe(true);
      expect(Number(pin)).toBeGreaterThanOrEqual(10000000);
      expect(Number(pin)).toBeLessThan(100000000);
    }
  });
});
