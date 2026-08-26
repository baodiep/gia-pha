import crypto from "crypto";

const CAPTCHA_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "gia-pha-captcha-secret-key-fallback";

export interface CaptchaChallenge {
  question: string;
  token: string;
}

/**
 * Generate a simple math challenge (e.g. "12 + 7 = ?") signed with HMAC and 5-min TTL
 */
export function generateMathCaptcha(): CaptchaChallenge {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 15) + 1;
  const answer = num1 + num2;
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

  const payload = `${answer}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${hmac}`).toString("base64");

  return {
    question: `${num1} + ${num2} = ?`,
    token,
  };
}

/**
 * Validate CAPTCHA answer server-side without revealing secret or answer
 */
export function verifyMathCaptcha(token: string, userAnswer: string | number): boolean {
  try {
    if (!token || userAnswer === undefined || userAnswer === null || userAnswer === "") {
      return false;
    }

    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [answerStr, expiresAtStr, receivedHmac] = decoded.split(":");

    if (!answerStr || !expiresAtStr || !receivedHmac) {
      return false;
    }

    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Expired
    }

    const payload = `${answerStr}:${expiresAtStr}`;
    const expectedHmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
      return Number(answerStr) === Number(userAnswer);
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Cryptographically secure 8-digit random PIN generation
 */
export function generateSecure8DigitPin(): string {
  // randomInt in [10000000, 100000000)
  const pin = crypto.randomInt(10000000, 100000000);
  return pin.toString();
}
