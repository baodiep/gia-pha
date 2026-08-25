"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAdminDashboardStats, AdminDashboardStats } from "@/features/admin/dashboard-actions";
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  Calendar,
  Activity,
  Trash2,
  Network,
  Sparkles,
  ArrowRight,
  UserX,
  BookOpen,
} from "lucide-react";

export function AdminDashboardView() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    });
  }, []);

  const navItems = [
    {
      title: "Cây gia phả tương tác",
      desc: "Xem và quản trị sơ đồ trực quan phân tầng theo chi/đời",
      href: "/",
      icon: Network,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      title: "Quản lý tài khoản",
      desc: "Kích hoạt tài khoản mới, phân quyền Admin, cấp mật khẩu tạm",
      href: "/admin/accounts",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      badge: stats?.pendingAccounts ? `${stats.pendingAccounts} chờ duyệt` : undefined,
    },
    {
      title: "Phân quyền quản lý nhánh",
      desc: "Cấp quyền chỉnh sửa cây trực hệ động cho người phụ trách chi",
      href: "/admin/permissions",
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Sự kiện dòng họ",
      desc: "Quản lý lịch giỗ tổ, họp họ, khánh thành và sự kiện cấp nhánh",
      href: "/events",
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      badge: stats?.upcomingEventsCount ? `${stats.upcomingEventsCount} sắp tới` : undefined,
    },
    {
      title: "Tưởng niệm & Ngày giỗ",
      desc: "Danh sách tiền nhân đã mất, ngày giỗ âm/dương và nơi an táng",
      href: "/memorials",
      icon: BookOpen,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      title: "Nhật ký hệ thống (Audit)",
      desc: "Truy vết chi tiết mọi thay đổi, xem snapshot dữ liệu trước/sau",
      href: "/admin/audit",
      icon: Activity,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
    },
    {
      title: "Thùng rác & Phục hồi",
      desc: "Khôi phục thành viên đã bị xóa mềm, bảo toàn quan hệ",
      href: "/admin/trash",
      icon: Trash2,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-slate-800 dark:text-slate-200" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trung tâm quản trị dòng họ
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tổng quan chỉ số phả hệ, tài khoản, phân quyền nhánh và các lối tắt quản trị nhanh
        </p>
      </div>

      {/* KPI Stats Cards */}
      {isPending || !stats ? (
        <div className="py-8 text-center text-xs text-slate-400">Đang tải chỉ số tổng quan...</div>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng thành viên</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalPersons}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {stats.livingPersons} đang sống • {stats.deceasedPersons} đã mất
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tài khoản Active</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.activeAccounts}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {stats.suspendedAccounts} tạm khóa
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chờ duyệt (Pending)</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.pendingAccounts}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Cần Admin kích hoạt</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quyền nhánh hiệu lực</span>
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.activeBranchGrants}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Người phụ trách chi nhánh</div>
          </div>
        </div>
      )}

      {/* Navigation Grid */}
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Menu chức năng quản trị
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2.5 ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-slate-600 group-hover:translate-x-1 transition-transform dark:text-slate-300">
                <span>Truy cập</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
