import { describe, it, expect } from "vitest";
import { convertSolar2Lunar, convertLunar2Solar, getSolarDateForLunarMemorial } from "@/lib/lunar/calendar";
import { formatAnniversaryDisplay } from "@/features/memorials/formatter";

describe("Vietnamese Lunar Calendar & Memorial Recurrence (T029)", () => {
  it("should convert known solar dates to lunar dates correctly", () => {
    // 2024-02-10 is Lunar New Year (01/01/2024 Giáp Thìn)
    const [lunarDay, lunarMonth, lunarYear] = convertSolar2Lunar(10, 2, 2024, 7);
    expect(lunarDay).toBe(1);
    expect(lunarMonth).toBe(1);
    expect(lunarYear).toBe(2024);

    // 2026-02-17 is Lunar New Year (01/01/2026 Bính Ngọ)
    const [lDay26, lMonth26, lYear26] = convertSolar2Lunar(17, 2, 2026, 7);
    expect(lDay26).toBe(1);
    expect(lMonth26).toBe(1);
    expect(lYear26).toBe(2026);
  });

  it("should convert lunar date to solar date across different years", () => {
    // Lunar 15/08 (Mid-Autumn) in 2024 was 2024-09-17
    const solar2024 = convertLunar2Solar(15, 8, 2024, false, 7);
    expect(solar2024).toEqual([17, 9, 2024]);

    // Lunar 15/08 in 2026 is 2026-09-25
    const solar2026 = convertLunar2Solar(15, 8, 2026, false, 7);
    expect(solar2026).toEqual([25, 9, 2026]);
  });

  it("should calculate recurring memorial solar date for target years", () => {
    const memorial2026 = getSolarDateForLunarMemorial(15, 8, false, 2026);
    expect(memorial2026.solarDate).toBe("25/09/2026");

    const memorial2024 = getSolarDateForLunarMemorial(15, 8, false, 2024);
    expect(memorial2024.solarDate).toBe("17/09/2024");
  });

  it("should format anniversary display with both lunar source and current year solar date", () => {
    const formatted = formatAnniversaryDisplay(
      {
        deathLunarDay: 15,
        deathLunarMonth: 8,
        deathLunarIsLeapMonth: false,
      },
      2026
    );

    expect(formatted.lunarText).toBe("Ngày 15 tháng 8 (Âm lịch)");
    expect(formatted.currentYearSolarText).toBe("Ngày giỗ năm 2026: 25/09/2026 (Dương lịch)");
  });

  it("should handle edge cases and invalid dates gracefully", () => {
    const invalid = getSolarDateForLunarMemorial(35, 15, false, 2026);
    expect(invalid.solarDate).toBeNull();
  });
});
