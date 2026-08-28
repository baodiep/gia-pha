import { describe, it, expect } from "vitest";
import { calculateAge } from "@/lib/utils/age";

describe("calculateAge Utility", () => {
  it("trả về null nếu không có birthDate", () => {
    expect(calculateAge(null, null, "LIVING")).toEqual({ age: null, label: null });
    expect(calculateAge("", null, "LIVING")).toEqual({ age: null, label: null });
  });

  it("tính tuổi người còn sống chính xác (năm YYYY hoặc ISO)", () => {
    const currentYear = new Date().getFullYear();
    const birthYear = 1990;
    const res = calculateAge(`${birthYear}-01-01`, null, "LIVING");
    expect(res.age).toBe(currentYear - birthYear);
    expect(res.label).toBe(`${currentYear - birthYear} tuổi`);

    const resYearOnly = calculateAge("1985", null, "LIVING");
    expect(resYearOnly.age).toBe(currentYear - 1985);
    expect(resYearOnly.label).toBe(`${currentYear - 1985} tuổi`);
  });

  it("tính tuổi người đã mất (thọ >= 60 tuổi, hưởng dương < 60 tuổi)", () => {
    // Thọ 80 tuổi
    const resTho = calculateAge("1920-01-01", "2000-01-01", "DECEASED");
    expect(resTho.age).toBe(80);
    expect(resTho.label).toBe("Thọ 80 tuổi");

    // Hưởng dương 45 tuổi
    const resDuong = calculateAge("1950-05-10", "1995-05-10", "DECEASED");
    expect(resDuong.age).toBe(45);
    expect(resDuong.label).toBe("Hưởng dương 45 tuổi");
  });

  it("người đã mất nhưng không có deathDate thì không hiển thị sai tuổi hiện tại", () => {
    const res = calculateAge("1900-01-01", null, "DECEASED");
    expect(res.age).toBe(null);
    expect(res.label).toBe(null);
  });
});
