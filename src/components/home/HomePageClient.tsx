"use client";

import React from "react";
import Link from "next/link";
import { FamilyTreeView } from "@/components/family-tree/FamilyTreeView";
import { Network, Calendar, BookOpen, Shield } from "lucide-react";

export function HomePageClient() {
  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Navbar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Gia Phả Dòng Họ
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Sơ đồ cây phả hệ phân tầng</p>
            </div>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav className="flex items-center gap-1.5 text-xs font-medium">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-900 dark:bg-slate-800 dark:text-white"
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cây gia phả</span>
          </Link>
          <Link
            href="/events"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sự kiện</span>
          </Link>
          <Link
            href="/memorials"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tưởng niệm</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Quản trị</span>
          </Link>
        </nav>
      </header>

      {/* Main Canvas Workspace */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <FamilyTreeView />
      </div>
    </div>
  );
}
