"use client";

import React, { useState, useTransition } from "react";
import { getContributionsListAction, ContributionStats } from "@/lib/contributions/contributions-actions";
import { Contribution } from "@/types/domain";
import {
  HeartHandshake,
  Search,
  Filter,
  DollarSign,
  Users,
  Receipt,
  Calendar,
  Sparkles,
  Phone,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

interface ContributionsListViewProps {
  initialContributions: Contribution[];
  initialStats: ContributionStats;
}

export function ContributionsListView({
  initialContributions,
  initialStats,
}: ContributionsListViewProps) {
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [stats, setStats] = useState<ContributionStats>(initialStats);
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await getContributionsListAction({
        search: search.trim() || undefined,
        phone: phone.trim() || undefined,
        purpose: purpose.trim() || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      if (res.success) {
        setContributions(res.contributions);
        setStats(res.stats);
      }
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setPhone("");
    setPurpose("");
    setFromDate("");
    setToDate("");
    startTransition(async () => {
      const res = await getContributionsListAction({});
      if (res.success) {
        setContributions(res.contributions);
        setStats(res.stats);
      }
    });
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-emerald-600" />
          Sổ Ghi Nhận Công Đức & Đóng Góp
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Bảng vàng tri ân tấm lòng vàng của bà con, dâu rể và con cháu trong dòng tộc.
        </p>
      </div>

      {/* KPI Stats Cards (40+ friendly) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-emerald-800 text-white rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold">
            <DollarSign className="w-5 h-5" />
            <span>Tổng số tiền đóng góp:</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {formatVnd(stats.totalAmount)}
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>Số lượt đóng góp:</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {stats.totalTransactions} lượt
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Số người tham gia:</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {stats.uniqueContributors} thành viên
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo họ tên người đóng góp, mục đích..."
                className="w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-xl min-h-[48px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-base min-h-[48px] flex items-center gap-2 cursor-pointer"
              >
                <Filter className="w-5 h-5" />
                <span>Bộ lọc</span>
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-base min-h-[48px] cursor-pointer shadow"
              >
                {isPending ? "Đang lọc..." : "Tìm kiếm"}
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Từ ngày:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Đến ngày:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-sm font-semibold text-emerald-800 underline p-2"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Contributions List (Mobile cards / responsive list) */}
      {contributions.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-lg">
          Không tìm thấy mục đóng góp nào phù hợp.
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((c, index) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-400 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                  {index + 1}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {c.contributor_name}
                    </h3>
                    {c.receipt_code && (
                      <span className="text-xs bg-gray-100 text-gray-700 font-mono px-2 py-0.5 rounded">
                        Mã: {c.receipt_code}
                      </span>
                    )}
                  </div>

                  <p className="text-base text-gray-700 font-medium">{c.purpose}</p>

                  {c.note && <p className="text-sm text-gray-500 italic">&ldquo;{c.note}&rdquo;</p>}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-800">
                  {formatVnd(c.amount)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(c.contribution_date).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-6 flex justify-center">
        <BackButton fallbackHref="/" label="Về Cây Gia Phả" />
      </div>
    </div>
  );
}
