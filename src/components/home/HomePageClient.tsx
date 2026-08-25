"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FamilyTreeView } from "@/components/family-tree/FamilyTreeView";
import { AuthModal } from "@/components/auth/AuthModal";
import { logoutAction, getCurrentUser } from "@/features/auth/actions";
import { Profile } from "@/types/domain";
import { Network, Calendar, BookOpen, Shield, LogIn, LogOut, User } from "lucide-react";

export function HomePageClient() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Load user error:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Navbar - Tối ưu chữ to, nút to rõ ràng cho người cao tuổi */}
      <header className="z-20 flex min-h-[56px] sm:min-h-[64px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm shrink-0">
            <Network className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Gia Phả Dòng Họ
            </h1>
            <p className="hidden xs:block text-[10px] sm:text-xs text-slate-500 font-medium">Sơ đồ cây phả hệ</p>
          </div>
        </div>

        {/* Global Navigation Links - Nút to, chữ rõ, touch target cao */}
        <nav className="flex items-center gap-1.5 sm:gap-2 font-semibold">
          <Link
            href="/"
            aria-label="Cây gia phả"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs sm:text-sm text-indigo-900 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-200 shadow-sm"
          >
            <Network className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Cây gia phả</span>
          </Link>
          <Link
            href="/events"
            aria-label="Sự kiện"
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200"
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Sự kiện</span>
          </Link>
          <Link
            href="/memorials"
            aria-label="Tưởng niệm"
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200"
          >
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            <span className="hidden md:inline">Tưởng niệm</span>
          </Link>
          <Link
            href="/admin"
            aria-label="Quản trị"
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Quản trị</span>
          </Link>

          {!loadingUser && (
            currentUser ? (
              <div className="flex items-center gap-1.5 ml-1">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-xs sm:text-sm">
                  <User className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="font-bold max-w-[80px] sm:max-w-[140px] truncate">
                    {currentUser.login_name}
                  </span>
                  {currentUser.is_admin && (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-2.5 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 shrink-0 min-h-[40px]"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-white hover:bg-indigo-700 ml-1 shadow-sm shrink-0 text-xs sm:text-sm font-bold min-h-[40px]"
              >
                <LogIn className="h-4 w-4" />
                <span>Tài khoản</span>
              </button>
            )
          )}
        </nav>
      </header>

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
    </div>
  );
}



