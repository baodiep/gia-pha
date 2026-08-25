import React from "react";
import { getCurrentUser } from "@/features/auth/actions";
import { ShieldAlert } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export const metadata = {
  title: "Quản trị hệ thống — Gia phả dòng họ",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  // Guard: Phải đăng nhập và phải có quyền Admin
  if (!currentUser || !currentUser.is_admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Không có quyền truy cập
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Khu vực này chỉ dành riêng cho Quản trị viên (Admin). Bạn vui lòng đăng nhập bằng tài khoản Quản trị để tiếp tục.
          </p>

          <div className="mt-6 flex justify-center">
            <BackButton fallbackHref="/" label="Về Cây gia phả" />
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
