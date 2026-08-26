"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/actions";
import { getSolarDateForLunarMemorial } from "@/lib/lunar/calendar";

export interface DashboardUpcomingItem {
  id: string;
  type: "MEMORIAL" | "EVENT";
  title: string;
  dateDisplay: string;
  sortTimestamp: number;
  subtitle?: string;
  location?: string;
  daysRemaining: number;
}

export interface MemberDashboardData {
  user: {
    id: string;
    fullName?: string;
    phone: string;
    personId?: string | null;
    status: string;
  };
  unreadNotificationsCount: number;
  upcomingItems: DashboardUpcomingItem[];
  totalPersonsCount: number;
  totalGenerationsCount: number;
}

export async function getMemberDashboardDataAction(): Promise<{
  success: boolean;
  data?: MemberDashboardData;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để truy cập trang thành viên" };
    }

    const supabase = await createClient();
    const currentYear = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [notifRes, personsRes, eventsRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
      supabase
        .from("persons")
        .select("id, full_name, is_deceased, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, generation_no")
        .is("deleted_at", null),
      supabase
        .from("family_events")
        .select("id, title, event_date, location, visibility")
        .is("deleted_at", null)
        .gte("event_date", today.toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(10),
    ]);

    const allPersons = personsRes.data || [];
    const unreadCount = notifRes.count || 0;
    const maxGen = Math.max(...allPersons.map((p) => p.generation_no || 1), 1);

    const upcomingList: DashboardUpcomingItem[] = [];

    // 1. Process Memorials
    const deceasedPersons = allPersons.filter((p) => p.is_deceased && p.death_lunar_day && p.death_lunar_month);

    for (const dp of deceasedPersons) {
      const solarMem = getSolarDateForLunarMemorial(
        dp.death_lunar_day!,
        dp.death_lunar_month!,
        dp.death_lunar_is_leap_month ?? false,
        currentYear
      );

      if (solarMem.day && solarMem.month) {
        let memDate = new Date(currentYear, solarMem.month - 1, solarMem.day);
        if (memDate.getTime() < today.getTime()) {
          // If already passed in current year, show next year
          const nextYearSolar = getSolarDateForLunarMemorial(
            dp.death_lunar_day!,
            dp.death_lunar_month!,
            dp.death_lunar_is_leap_month ?? false,
            currentYear + 1
          );
          if (nextYearSolar.day && nextYearSolar.month) {
            memDate = new Date(currentYear + 1, nextYearSolar.month - 1, nextYearSolar.day);
          }
        }

        const diffTime = memDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Include upcoming in next 90 days
        if (diffDays >= 0 && diffDays <= 90) {
          const leapStr = dp.death_lunar_is_leap_month ? " (nhuận)" : "";
          upcomingList.push({
            id: `mem-${dp.id}`,
            type: "MEMORIAL",
            title: `Lễ giỗ: ${dp.full_name}`,
            subtitle: `Ngày âm: ${dp.death_lunar_day}/${dp.death_lunar_month}${leapStr}`,
            dateDisplay: `${String(memDate.getDate()).padStart(2, "0")}/${String(memDate.getMonth() + 1).padStart(2, "0")}/${memDate.getFullYear()}`,
            sortTimestamp: memDate.getTime(),
            daysRemaining: diffDays,
          });
        }
      }
    }

    // 2. Process Family Events
    const events = eventsRes.data || [];
    for (const ev of events) {
      const evDate = new Date(ev.event_date);
      const diffTime = evDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      upcomingList.push({
        id: `ev-${ev.id}`,
        type: "EVENT",
        title: ev.title,
        location: ev.location || undefined,
        dateDisplay: `${String(evDate.getDate()).padStart(2, "0")}/${String(evDate.getMonth() + 1).padStart(2, "0")}/${evDate.getFullYear()}`,
        sortTimestamp: evDate.getTime(),
        daysRemaining: diffDays,
      });
    }

    // Sort combined by date asc
    upcomingList.sort((a, b) => a.sortTimestamp - b.sortTimestamp);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone_normalized,
          personId: user.person_id,
          status: user.status,
        },
        unreadNotificationsCount: unreadCount,
        upcomingItems: upcomingList.slice(0, 6), // Top 6 upcoming items for clean 40+ UI
        totalPersonsCount: allPersons.length,
        totalGenerationsCount: maxGen,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Lỗi tải thông tin trang chủ thành viên",
    };
  }
}
