"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/features/auth/actions";

export interface AdminDashboardStats {
  totalPersons: number;
  deceasedPersons: number;
  livingPersons: number;
  activeAccounts: number;
  pendingAccounts: number;
  suspendedAccounts: number;
  activeBranchGrants: number;
  upcomingEventsCount: number;
}

// In-memory server-side cache (TTL: 5 phút = 300,000ms)
interface CachedStats {
  data: AdminDashboardStats;
  expiresAt: number;
}

let statsCache: CachedStats | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Xóa cache thủ công nếu cần (khi admin tạo/xóa thành viên hay duyệt tài khoản)
 */
export async function invalidateDashboardStatsCache(): Promise<void> {
  statsCache = null;
}

/**
 * Lấy các chỉ số tổng quan cho Admin Dashboard với Server Cache 5 phút & chạy song song Promise.all
 */
export async function getAdminDashboardStats(forceRefresh = false): Promise<AdminDashboardStats> {
  const { profile } = await requireActiveUser();
  if (!profile.is_admin) {
    throw new Error("Chỉ Admin mới có quyền truy cập bảng quản trị");
  }

  const nowMs = Date.now();
  if (!forceRefresh && statsCache && statsCache.expiresAt > nowMs) {
    return statsCache.data;
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  // Thực hiện đồng thời tất cả các truy vấn đếm song song qua Promise.all để giảm latency tối đa
  const [
    totalPersonsRes,
    deceasedPersonsRes,
    livingPersonsRes,
    activeAccountsRes,
    pendingAccountsRes,
    suspendedAccountsRes,
    activeBranchGrantsRes,
    upcomingEventsRes,
  ] = await Promise.all([
    // 1. Persons stats
    admin
      .from("persons")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    admin
      .from("persons")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("life_status", "DECEASED"),
    admin
      .from("persons")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("life_status", "LIVING"),
    // 2. Accounts stats
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE"),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "SUSPENDED"),
    // 3. Branch grants
    admin
      .from("branch_grants")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null),
    // 4. Upcoming events
    admin
      .from("family_events")
      .select("*", { count: "exact", head: true })
      .gte("starts_at", nowIso)
      .neq("status", "CANCELLED"),
  ]);

  const stats: AdminDashboardStats = {
    totalPersons: totalPersonsRes.count || 0,
    deceasedPersons: deceasedPersonsRes.count || 0,
    livingPersons: livingPersonsRes.count || 0,
    activeAccounts: activeAccountsRes.count || 0,
    pendingAccounts: pendingAccountsRes.count || 0,
    suspendedAccounts: suspendedAccountsRes.count || 0,
    activeBranchGrants: activeBranchGrantsRes.count || 0,
    upcomingEventsCount: upcomingEventsRes.count || 0,
  };

  // Lưu vào cache
  statsCache = {
    data: stats,
    expiresAt: nowMs + CACHE_TTL_MS,
  };

  return stats;
}

