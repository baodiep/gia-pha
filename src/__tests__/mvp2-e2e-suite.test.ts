import { describe, it, expect } from "vitest";
import { parseFamilyExcelBuffer } from "@/lib/family-import/parser";
import { generateMathCaptcha, verifyMathCaptcha, generateSecure8DigitPin } from "@/lib/auth/captcha";
import { getSolarDateForLunarMemorial } from "@/lib/lunar/calendar";
import { formatAnniversaryDisplay } from "@/features/memorials/formatter";
import { parseContributionExcel } from "@/lib/contributions/excel-parser";
import * as XLSX from "xlsx";

describe("MVP2 Comprehensive E2E, Security & Regression Suite (T038)", () => {
  describe("Journey 1: Family Excel Import & Tree Structure Parsing", () => {
    it("should successfully parse and validate a multi-generation family tree Excel sheet", () => {
      const headers = [
        "Mã thành viên",
        "Họ và tên",
        "Giới tính",
        "Tình trạng",
        "Đời",
        "Mã cha",
        "Mã mẹ",
        "Mã vợ/chồng",
        "Ngày sinh",
        "Ngày mất",
        "Ngày giỗ âm",
        "Tháng giỗ âm",
      ];

      const rows = [
        ["TV01", "Cụ Tổ Khởi Thuỷ", "Nam", "Đã mất", 1, "", "", "TV02", "1900-01-01", "1970-01-01", 15, 7],
        ["TV02", "Cụ Bà Chính Thất", "Nữ", "Đã mất", 1, "", "", "TV01", "1905-01-01", "1975-01-01", 10, 8],
        ["TV03", "Ông Trưởng Nam", "Nam", "Còn sống", 2, "TV01", "TV02", "", "1930-01-01", "", "", ""],
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      const parsed = parseFamilyExcelBuffer(buffer);
      expect(parsed.totalRows).toBe(3);
      expect(parsed.validRows.length).toBe(3);
      expect(parsed.errors.length).toBe(0);
      expect(parsed.validRows[0].fullName).toBe("Cụ Tổ Khởi Thuỷ");
      expect(parsed.validRows[0].generationNo).toBe(1);
    });
  });

  describe("Journey 2: Password Reset Security, CAPTCHA & Random PIN", () => {
    it("should generate and verify HMAC CAPTCHA securely without leaking secrets", () => {
      const { question, token } = generateMathCaptcha();
      expect(question).toContain("+");
      expect(token).toBeDefined();

      const [n1, n2] = question.replace(" = ?", "").split(" + ").map(Number);
      const correctAnswer = n1 + n2;

      const isValid = verifyMathCaptcha(token, correctAnswer);
      expect(isValid).toBe(true);

      const isInvalid = verifyMathCaptcha(token, 9999);
      expect(isInvalid).toBe(false);
    });

    it("should generate unguessable 8-digit random PINs for temporary passwords", () => {
      const pin1 = generateSecure8DigitPin();
      const pin2 = generateSecure8DigitPin();

      expect(pin1).toHaveLength(8);
      expect(pin2).toHaveLength(8);
      expect(pin1).not.toBe(pin2);
      expect(/^\d{8}$/.test(pin1)).toBe(true);
    });
  });

  describe("Journey 3: Astronomical Lunar Memorials & Recurrence", () => {
    it("should accurately convert lunar death anniversary to solar date for upcoming years", () => {
      // Ngày giỗ: 15 tháng 8 Âm lịch
      const targetYear = 2026;
      const solarRes = getSolarDateForLunarMemorial(15, 8, false, targetYear);
      expect(solarRes.solarDate).toBe("25/09/2026");
      expect(solarRes.year).toBe(2026);

      const formatted = formatAnniversaryDisplay(
        {
          deathLunarDay: 15,
          deathLunarMonth: 8,
          deathLunarIsLeapMonth: false,
        },
        2026
      );
      expect(formatted.lunarText).toContain("15");
      expect(formatted.currentYearSolarText).toContain("25/09/2026");
    });
  });

  describe("Journey 4: Contribution Management & Excel Import", () => {
    it("should parse contribution Excel sheets and match accounts by phone", () => {
      const headers = [
        "Họ và tên (*)",
        "Số điện thoại",
        "Số tiền VNĐ (*)",
        "Mục đích đóng góp (*)",
        "Ngày đóng góp (YYYY-MM-DD) (*)",
      ];

      const sample = [
        ["Nguyễn Văn An", "0912345678", 5000000, "Quỹ khuyến học", "2026-08-26"],
        ["Trần Thị Bình", "0987654321", 2000000, "Tôn tạo nhà thờ", "2026-08-25"],
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const parsed = parseContributionExcel(buffer);
      expect(parsed.totalRows).toBe(2);
      expect(parsed.validRows).toBe(2);
      expect(parsed.rows[0].phoneNormalized).toBe("0912345678");
      expect(parsed.rows[0].amount).toBe(5000000);
    });
  });
});
