/**
 * Utility tính tuổi và hiển thị tuổi cho gia phả
 */

export function calculateAge(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined,
  lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN" = "LIVING"
): { age: number | null; label: string | null } {
  if (!birthDate) {
    return { age: null, label: null };
  }

  const parseYear = (dateStr: string): { year: number; fullDate: Date | null } | null => {
    if (!dateStr) return null;
    const clean = dateStr.trim();
    // Nếu chỉ có 4 chữ số năm (YYYY)
    if (/^\d{4}$/.test(clean)) {
      return { year: parseInt(clean, 10), fullDate: null };
    }
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), fullDate: d };
    }
    // Trích xuất 4 chữ số đầu tiên nếu có dạng YYYY-MM-DD
    const match = clean.match(/^(\d{4})/);
    if (match) {
      return { year: parseInt(match[1], 10), fullDate: null };
    }
    return null;
  };

  const bInfo = parseYear(birthDate);
  if (!bInfo) {
    return { age: null, label: null };
  }

  const isDeceased = lifeStatus === "DECEASED" || !!deathDate;

  if (isDeceased) {
    if (deathDate) {
      const dInfo = parseYear(deathDate);
      if (dInfo) {
        let diffYears = dInfo.year - bInfo.year;
        if (bInfo.fullDate && dInfo.fullDate) {
          const monthDiff = dInfo.fullDate.getMonth() - bInfo.fullDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && dInfo.fullDate.getDate() < bInfo.fullDate.getDate())) {
            diffYears--;
          }
        }
        const age = Math.max(0, diffYears);
        const prefix = age >= 60 ? "Thọ" : "Hưởng dương";
        return {
          age,
          label: `${prefix} ${age} tuổi`,
        };
      }
    }
    // Nếu đã mất nhưng không có ngày mất rõ ràng
    return { age: null, label: null };
  }

  // Còn sống: tính tuổi tới hiện tại
  const now = new Date();
  const currentYear = now.getFullYear();
  let diffYears = currentYear - bInfo.year;

  if (bInfo.fullDate) {
    const monthDiff = now.getMonth() - bInfo.fullDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < bInfo.fullDate.getDate())) {
      diffYears--;
    }
  }

  const age = Math.max(0, diffYears);
  return {
    age,
    label: `${age} tuổi`,
  };
}
