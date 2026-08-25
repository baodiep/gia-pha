"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /**
   * Đường dẫn dự phòng nếu người dùng vào trực tiếp trang mà không có history
   * Mặc định là "/" (Trang chủ / Cây gia phả)
   */
  fallbackHref?: string;
  /**
   * Nhãn hiển thị cho nút (mặc định "Quay lại")
   */
  label?: string;
  /**
   * ClassName tùy biến thêm nếu cần
   */
  className?: string;
  /**
   * Hiển thị dạng nổi bật cố định hoặc nhúng trong header
   */
  variant?: "header" | "floating" | "banner";
}

/**
 * Nút "Quay lại" thiết kế chuyên biệt cho người lớn tuổi (trên 50 tuổi):
 * - Vùng bấm lớn (min height 48px), dễ chạm trên màn hình cảm ứng điện thoại
 * - Biểu tượng mũi tên to, rõ ràng
 * - Chữ tiếng Việt đậm, cỡ chữ lớn, tương phản cao
 * - Phản hồi rung/chạm nhẹ khi nhấn
 */
export function BackButton({
  fallbackHref = "/",
  label = "Quay lại",
  className = "",
  variant = "header",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  if (variant === "floating") {
    return (
      <button
        onClick={handleBack}
        type="button"
        aria-label={label}
        className={`fixed bottom-6 left-4 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-base font-bold text-white shadow-2xl ring-2 ring-white/20 active:scale-95 transition-transform dark:bg-white dark:text-slate-900 sm:hidden ${className}`}
      >
        <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <div className="w-full bg-slate-100 p-2 border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700 sm:hidden">
        <button
          onClick={handleBack}
          type="button"
          aria-label={label}
          className={`flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-base font-bold text-slate-800 shadow-sm border border-slate-300 active:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 ${className}`}
        >
          <ArrowLeft className="h-6 w-6 stroke-[2.5] text-indigo-600 dark:text-indigo-400" />
          <span className="text-base">{label}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleBack}
      type="button"
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm sm:text-base font-bold text-slate-800 active:scale-95 transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-sm shrink-0 min-h-[44px] min-w-[110px] justify-center ${className}`}
    >
      <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5] text-indigo-600 dark:text-indigo-400 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
