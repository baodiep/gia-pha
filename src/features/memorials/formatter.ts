import { getSolarDateForLunarMemorial } from "@/lib/lunar/calendar";

/**
 * Định dạng chuỗi hiển thị ngày giỗ âm/dương chuẩn xác theo từng năm
 */
export function formatAnniversaryDisplay(
  person: {
    deathDate?: string | null;
    deathLunarDay?: number | null;
    deathLunarMonth?: number | null;
    deathLunarIsLeapMonth?: boolean;
  },
  currentYear = new Date().getFullYear()
): {
  solarText: string | null;
  lunarText: string | null;
  currentYearSolarText: string | null;
} {
  let solarText: string | null = null;
  let lunarText: string | null = null;
  let currentYearSolarText: string | null = null;

  if (person.deathDate) {
    const d = new Date(person.deathDate);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    solarText = `${day}/${month}/${year} (Dương lịch)`;
  }

  if (person.deathLunarDay && person.deathLunarMonth) {
    const leap = person.deathLunarIsLeapMonth ? " (Nhuận)" : "";
    lunarText = `Ngày ${person.deathLunarDay} tháng ${person.deathLunarMonth}${leap} (Âm lịch)`;

    const currentYearSolar = getSolarDateForLunarMemorial(
      person.deathLunarDay,
      person.deathLunarMonth,
      person.deathLunarIsLeapMonth,
      currentYear
    );

    if (currentYearSolar.solarDate) {
      currentYearSolarText = `Ngày giỗ năm ${currentYear}: ${currentYearSolar.solarDate} (Dương lịch)`;
    }
  }

  return { solarText, lunarText, currentYearSolarText };
}

