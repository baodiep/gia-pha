"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getMemberDashboardDataAction, MemberDashboardData } from "@/features/dashboard/member-actions";
import {
  Calendar,
  Users2,
  Bell,
  Heart,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
  FolderOpen,
} from "lucide-react";

export function MemberDashboardView() {
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getMemberDashboardDataAction();
        if (!ignore) {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setError(res.error || "Không thể tải dữ liệu trang chủ");
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-lg text-gray-500 font-medium animate-pulse">
        Đang tải thông tin gia tộc...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-red-800">Không thể tải trang thành viên</h2>
        <p className="text-base text-gray-700">{error || "Vui lòng đăng nhập lại để tiếp tục."}</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-emerald-700 text-white font-bold rounded-xl shadow min-h-[48px]"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-emerald-200 text-sm font-semibold tracking-wider uppercase bg-emerald-950/60 px-3 py-1 rounded-full">
            Trang Chủ Thành Viên
          </span>
          {data.unreadNotificationsCount > 0 && (
            <Link
              href="/notifications"
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow"
            >
              <Bell className="w-4 h-4" />
              <span>{data.unreadNotificationsCount} thông báo mới</span>
            </Link>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold flex items-center gap-3">
          <span>Kính chào Quý Thành Viên!</span>
        </h1>
        <p className="text-base sm:text-lg text-emerald-100 max-w-2xl">
          Gia phả hiện lưu giữ <strong>{data.totalPersonsCount} thành viên</strong> qua <strong>{data.totalGenerationsCount} đời</strong> tiền nhân và hậu duệ.
        </p>
      </div>

      {/* Quick Access Grid (40+ friendly large touch targets) */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          Lối Tắt Thường Dùng
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-5 bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-2 group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users2 className="w-7 h-7" />
            </div>
            <span className="font-bold text-base sm:text-lg text-gray-900">Cây Gia Phả</span>
            <span className="text-xs text-gray-500 hidden sm:block">Xem phả hệ dòng tộc</span>
          </Link>

          <Link
            href="/kinship"
            className="p-5 bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-2 group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-7 h-7" />
            </div>
            <span className="font-bold text-base sm:text-lg text-gray-900">Xưng Hô Họ Hàng</span>
            <span className="text-xs text-gray-500 hidden sm:block">Tra cứu quan hệ 2 người</span>
          </Link>

          <Link
            href="/memorials"
            className="p-5 bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-2 group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7" />
            </div>
            <span className="font-bold text-base sm:text-lg text-gray-900">Tưởng Niệm & Giỗ</span>
            <span className="text-xs text-gray-500 hidden sm:block">Ngày kỵ nhật tổ tiên</span>
          </Link>

          <Link
            href="/resources"
            className="p-5 bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-2 group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="w-7 h-7" />
            </div>
            <span className="font-bold text-base sm:text-lg text-gray-900">Tư Liệu Dòng Họ</span>
            <span className="text-xs text-gray-500 hidden sm:block">Sách sử & hình ảnh</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Family Calendar & Memorials (Merged Feed) */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Lịch Dòng Họ Sắp Tới
          </h2>
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            90 ngày tới
          </span>
        </div>

        {data.upcomingItems.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 text-base sm:text-lg">
            Không có ngày giỗ hoặc sự kiện dòng họ nào diễn ra trong 90 ngày tới.
          </div>
        ) : (
          <div className="space-y-3">
            {data.upcomingItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.type === "MEMORIAL"
                    ? "bg-amber-50/50 border-amber-200 hover:border-amber-400"
                    : "bg-white border-gray-200 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${
                      item.type === "MEMORIAL"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.type === "MEMORIAL" ? (
                      <Heart className="w-6 h-6" />
                    ) : (
                      <Calendar className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900">
                        {item.title}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.type === "MEMORIAL"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.type === "MEMORIAL" ? "Kỵ nhật" : "Sự kiện"}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base text-gray-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {item.subtitle && <span>{item.subtitle}</span>}
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-base sm:text-lg font-bold text-emerald-800">
                    {item.dateDisplay}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.daysRemaining === 0
                      ? "Hôm nay"
                      : item.daysRemaining === 1
                      ? "Ngày mai"
                      : `Còn ${item.daysRemaining} ngày`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Profile / Link Person Notice */}
      {!data.user.personId && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-lg text-blue-900">
              Bạn chưa liên kết hồ sơ của mình trên cây gia phả?
            </h4>
            <p className="text-sm sm:text-base text-blue-800">
              Hãy gửi yêu cầu &quot;Đây là tôi&quot; để được Ban Quản trị xác nhận vị trí trong dòng họ.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow text-sm sm:text-base min-h-[44px] flex items-center shrink-0"
          >
            Tìm & Liên Kết Ngay
          </Link>
        </div>
      )}
    </div>
  );
}
