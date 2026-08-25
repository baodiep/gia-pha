import { describe, it, expect } from "vitest";
import { personInputSchema } from "@/features/persons/validation";

describe("Person validation & deceased fields rules", () => {
  it("validates valid living person", () => {
    const validLiving = {
      fullName: "Nguyễn Văn A",
      gender: "MALE" as const,
      lifeStatus: "LIVING" as const,
      birthDate: "1990-05-15",
      hometown: "Bắc Ninh",
      generationNo: 4,
    };

    const parsed = personInputSchema.safeParse(validLiving);
    expect(parsed.success).toBe(true);
  });

  it("validates valid deceased person with solar and lunar death dates", () => {
    const validDeceased = {
      fullName: "Nguyễn Văn Cụ",
      gender: "MALE" as const,
      lifeStatus: "DECEASED" as const,
      birthDate: "1920-01-01",
      deathDate: "1995-10-10",
      deathLunarDay: 16,
      deathLunarMonth: 8,
      deathLunarIsLeapMonth: false,
      deathAnniversaryNote: "Giỗ chính hàng năm tại nhà thờ tổ",
    };

    const parsed = personInputSchema.safeParse(validDeceased);
    expect(parsed.success).toBe(true);
  });

  it("fails if deathDate is before birthDate", () => {
    const invalidDates = {
      fullName: "Nguyễn Văn B",
      gender: "MALE" as const,
      lifeStatus: "DECEASED" as const,
      birthDate: "1990-01-01",
      deathDate: "1980-01-01",
    };

    const parsed = personInputSchema.safeParse(invalidDates);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.errors[0].message).toContain("Ngày mất phải sau hoặc bằng ngày sinh");
    }
  });

  it("fails if living person has deathDate or lunar death fields filled", () => {
    const invalidLiving = {
      fullName: "Nguyễn Văn C",
      gender: "MALE" as const,
      lifeStatus: "LIVING" as const,
      birthDate: "1990-01-01",
      deathDate: "2020-01-01",
    };

    const parsed = personInputSchema.safeParse(invalidLiving);
    expect(parsed.success).toBe(false);
  });

  it("fails on invalid lunar day (> 30) or month (> 12)", () => {
    const invalidLunar = {
      fullName: "Nguyễn Văn D",
      gender: "MALE" as const,
      lifeStatus: "DECEASED" as const,
      deathLunarDay: 32,
      deathLunarMonth: 13,
    };

    const parsed = personInputSchema.safeParse(invalidLunar);
    expect(parsed.success).toBe(false);
  });
});
