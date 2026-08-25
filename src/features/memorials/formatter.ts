/**
 * Định dạng chuỗi hiển thị ngày giỗ âm/dương chuẩn xác, không tự quy đổi giả định
 */
export function formatAnniversaryDisplay(person: {
  deathDate?: string | null;
  deathLunarDay?: number | null;
  deathLunarMonth?: number | null;
  deathLunarIsLeapMonth?: boolean;
}): {
  solarText: string | null;
  lunarText: string | null;
} {
  let solarText: string | null = null;
  let lunarText: string | null = null;

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
  }

  return { solarText, lunarText };
}
