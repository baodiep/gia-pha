import { describe, it, expect } from "vitest";
import { formatAnniversaryDisplay } from "@/features/memorials/formatter";

describe("Memorials date & anniversary formatter", () => {
  it("formats solar date correctly without fake conversion", () => {
    const person = {
      deathDate: "1995-10-20",
      deathLunarDay: null,
      deathLunarMonth: null,
      deathLunarIsLeapMonth: false,
    };

    const formatted = formatAnniversaryDisplay(person);
    expect(formatted.solarText).toBe("20/10/1995 (Dương lịch)");
    expect(formatted.lunarText).toBeNull();
  });

  it("formats lunar date correctly without inventing solar conversion", () => {
    const person = {
      deathDate: null,
      deathLunarDay: 27,
      deathLunarMonth: 8,
      deathLunarIsLeapMonth: false,
    };

    const formatted = formatAnniversaryDisplay(person);
    expect(formatted.solarText).toBeNull();
    expect(formatted.lunarText).toBe("Ngày 27 tháng 8 (Âm lịch)");
  });

  it("formats leap lunar month clearly", () => {
    const person = {
      deathDate: null,
      deathLunarDay: 15,
      deathLunarMonth: 4,
      deathLunarIsLeapMonth: true,
    };

    const formatted = formatAnniversaryDisplay(person);
    expect(formatted.lunarText).toBe("Ngày 15 tháng 4 (Nhuận) (Âm lịch)");
  });

  it("formats both when both are known", () => {
    const person = {
      deathDate: "2000-05-12",
      deathLunarDay: 9,
      deathLunarMonth: 4,
      deathLunarIsLeapMonth: false,
    };

    const formatted = formatAnniversaryDisplay(person);
    expect(formatted.solarText).toBe("12/05/2000 (Dương lịch)");
    expect(formatted.lunarText).toBe("Ngày 9 tháng 4 (Âm lịch)");
  });
});
