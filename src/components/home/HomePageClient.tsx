"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FamilyTreeView } from "@/components/family-tree/FamilyTreeView";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserProfileModal } from "@/components/auth/UserProfileModal";
import { logoutAction, getCurrentUserWithPerson } from "@/features/auth/actions";
import { getSystemSettings, SystemSettings } from "@/features/admin/settings-actions";
import { getUserNotificationsAction } from "@/lib/notifications/actions";
import { Profile } from "@/types/domain";
import {
  Network,
  Calendar,
  BookOpen,
  Shield,
  LogIn,
  LogOut,
  User,
  HeartHandshake,
  Users2,
  Bell,
  LayoutDashboard,
  FolderArchive,
  Menu,
  X,
  ChevronDown,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

export function HomePageClient() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [brandSettings, setBrandSettings] = useState<SystemSettings | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingUser, setLoadingUser] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, settingsRes] = await Promise.all([
          getCurrentUserWithPerson(),
          getSystemSettings(),
        ]);

        if (userRes) {
          setCurrentUser(userRes.profile);
          setDisplayName(userRes.displayName);
          try {
            const countRes = await getUserNotificationsAction();
            if (countRes.success) setUnreadCount(countRes.unreadCount);
          } catch {
            // ignore
          }
        } else {
          setCurrentUser(null);
          setDisplayName("");
        }

        setBrandSettings(settingsRes);
      } catch (err) {
        console.error("Load home data error:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Navbar */}
      <header className="z-20 flex min-h-[60px] sm:min-h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm overflow-hidden shrink-0">
            {brandSettings?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandSettings.logo_url}
                alt="Logo dòng họ"
                className="h-full w-full object-cover"
              />
            ) : (
              <Network className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {brandSettings?.app_title || "Gia Phả Dòng Họ"}
            </h1>
            <p className="hidden xs:block text-[11px] sm:text-xs text-slate-500 font-medium">
              {brandSettings?.app_subtitle || "Sơ đồ cây phả hệ & kết nối dòng tộc"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 font-semibold">
          {/* Cây gia phả */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2.5 text-sm text-emerald-950 font-bold shadow-sm"
          >
            <Network className="h-5 w-5 text-emerald-700" />
            <span>Cây gia phả</span>
          </Link>

          {/* Lịch 90 ngày & Dashboard Thành viên */}
          <Link
            href="/member/dashboard"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-800 border border-transparent hover:border-slate-200 transition-all"
          >
            <LayoutDashboard className="h-5 w-5 text-emerald-600" />
            <span>Dashboard</span>
          </Link>

          {/* Tra cứu xưng hô */}
          <Link
            href="/kinship"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-800 border border-transparent hover:border-slate-200 transition-all"
          >
            <Users2 className="h-5 w-5 text-indigo-600" />
            <span>Tra cứu xưng hô</span>
          </Link>

          {/* Sự kiện & Giỗ họ */}
          <Link
            href="/events"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-amber-800 border border-transparent hover:border-slate-200 transition-all"
          >
            <Calendar className="h-5 w-5 text-amber-600" />
            <span>Sự kiện</span>
          </Link>

          {/* Kỵ nhật */}
          <Link
            href="/memorials"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-purple-800 border border-transparent hover:border-slate-200 transition-all"
          >
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span>Kỵ nhật</span>
          </Link>

          {/* Đóng góp & Quỹ */}
          <Link
            href="/contributions"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-rose-800 border border-transparent hover:border-slate-200 transition-all"
          >
            <HeartHandshake className="h-5 w-5 text-rose-600" />
            <span>Đóng góp</span>
          </Link>

          {/* Menu Thêm Dropdown (Tư liệu, Sổ công đức, Nhập liệu) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <span>Thêm</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {showMoreDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30 space-y-1">
                <Link
                  href="/resources"
                  onClick={() => setShowMoreDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-emerald-800"
                >
                  <FolderArchive className="w-4 h-4 text-cyan-600" />
                  <span>Tư liệu & Album ảnh</span>
                </Link>

                <Link
                  href="/contributions/list"
                  onClick={() => setShowMoreDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-emerald-800"
                >
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Sổ công đức dòng họ</span>
                </Link>

                {currentUser?.is_admin && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <Link
                      href="/contributions/import"
                      onClick={() => setShowMoreDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-emerald-800"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Nhập Excel Sổ công đức</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Chuông Thông Báo */}
          {currentUser && (
            <Link
              href="/notifications"
              title="Trung tâm thông báo"
              className="relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Admin Management */}
          {!loadingUser && currentUser?.is_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100/70 px-3 py-2.5 text-sm text-slate-900 font-bold hover:bg-slate-200"
            >
              <Shield className="h-5 w-5 text-indigo-700" />
              <span>Quản trị</span>
            </Link>
          )}

          {/* User Profile / Auth */}
          {!loadingUser && (
            currentUser ? (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  title="Bấm để xem và sửa thông tin cá nhân, đổi mật khẩu"
                  className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 text-left text-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 shrink-0 font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col leading-tight max-w-[120px]">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {displayName || currentUser.login_name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {currentUser.login_name}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shrink-0 min-h-[40px] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Thoát</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-white hover:bg-emerald-800 ml-1 shadow-sm shrink-0 text-sm font-bold min-h-[44px] cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập</span>
              </button>
            )
          )}
        </nav>

        {/* Mobile Action Hub Button */}
        <div className="flex lg:hidden items-center gap-2">
          {currentUser && (
            <Link
              href="/notifications"
              className="relative p-2.5 rounded-xl text-slate-700 bg-slate-100 flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu (Full Features for 40+ UX) */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] sm:top-[68px] bottom-0 bg-white z-30 p-5 overflow-y-auto space-y-4 border-b shadow-2xl">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <Network className="w-7 h-7 text-emerald-700" />
              <span className="font-bold text-base text-emerald-950">Cây gia phả</span>
            </Link>

            <Link
              href="/member/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <LayoutDashboard className="w-7 h-7 text-emerald-600" />
              <span className="font-bold text-base text-slate-900">Dashboard</span>
            </Link>

            <Link
              href="/kinship"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <Users2 className="w-7 h-7 text-indigo-600" />
              <span className="font-bold text-base text-slate-900">Xưng hô họ hàng</span>
            </Link>

            <Link
              href="/events"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <Calendar className="w-7 h-7 text-amber-600" />
              <span className="font-bold text-base text-slate-900">Sự kiện họ</span>
            </Link>

            <Link
              href="/memorials"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <BookOpen className="w-7 h-7 text-purple-600" />
              <span className="font-bold text-base text-slate-900">Lịch kỵ nhật</span>
            </Link>

            <Link
              href="/contributions"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <HeartHandshake className="w-7 h-7 text-rose-600" />
              <span className="font-bold text-base text-slate-900">Đóng góp quỹ</span>
            </Link>

            <Link
              href="/contributions/list"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <Receipt className="w-7 h-7 text-amber-600" />
              <span className="font-bold text-base text-slate-900">Sổ công đức</span>
            </Link>

            <Link
              href="/resources"
              onClick={() => setShowMobileMenu(false)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <FolderArchive className="w-7 h-7 text-cyan-600" />
              <span className="font-bold text-base text-slate-900">Tư liệu & Album</span>
            </Link>
          </div>

          {/* Admin & Account Bar on Mobile */}
          <div className="pt-4 border-t space-y-3">
            {currentUser?.is_admin && (
              <Link
                href="/admin"
                onClick={() => setShowMobileMenu(false)}
                className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center gap-2 text-indigo-950 font-bold text-base"
              >
                <Shield className="w-5 h-5 text-indigo-700" />
                <span>Trang Quản Trị Hệ Thống</span>
              </Link>
            )}

            {currentUser ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full p-4 bg-gray-100 rounded-2xl flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-emerald-700" />
                    <div>
                      <p className="font-bold text-base text-gray-900">
                        {displayName || currentUser.login_name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">{currentUser.login_name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 underline">Đổi MK</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full p-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-base"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất khỏi thiết bị</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowAuthModal(true);
                }}
                className="w-full p-4 bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-lg shadow"
              >
                <LogIn className="w-5 h-5" />
                <span>Đăng nhập tài khoản</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas Workspace */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <FamilyTreeView />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          window.location.reload();
        }}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          currentUser={currentUser}
          displayName={displayName}
          onClose={() => setShowProfileModal(false)}
          onSuccess={() => {
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
}
