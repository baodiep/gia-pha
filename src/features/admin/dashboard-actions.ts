"use server";

import { createClient } from "@/lib/supabase/server";
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

/**
 * Lấy các chỉ số tổng quan cho Admin Dashboard
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { profile } = await requireActiveUser();
  if (!profile.is_admin) {
    throw new Error("Chỉ Admin mới có quyền truy cập bảng quản trị");
  }

  const supabase = await createClient();

  // 1. Persons stats
  const { count: totalPersons } = await supabase
    .from("persons")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { count: deceasedPersons } = await supabase
    .from("persons")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)
    .eq("life_status", "DECEASED");

  const { count: livingPersons } = await supabase
    .from("persons")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)
    .eq("life_status", "LIVING");

  // 2. Accounts stats
  const { count: activeAccounts } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "ACTIVE");

  const { count: pendingAccounts } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING");

  const { count: suspendedAccounts } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "SUSPENDED");

  // 3. Branch grants
  const { count: activeBranchGrants } = await supabase
    .from("branch_grants")
    .select("*", { count: "exact", head: true })
    .is("revoked_at", null);

  // 4. Upcoming events
  const now = new Date().toISOString();
  const { count: upcomingEventsCount } = await supabase
    .from("family_events")
    .select("*", { count: "exact", head: true })
    .gte("starts_at", now)
    .neq("status", "CANCELLED");

  return {
    totalPersons: totalPersons || 0,
    deceasedPersons: deceasedPersons || 0,
    livingPersons: livingPersons || 0,
    activeAccounts: activeAccounts || 0,
    pendingAccounts: pendingAccounts || 0,
    suspendedAccounts: suspendedAccounts || 0,
    activeBranchGrants: activeBranchGrants || 0,
    upcomingEventsCount: upcomingEventsCount || 0,
  };
}
