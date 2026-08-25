"use client";

import React, { useState, useTransition } from "react";
import { loginAction, registerAction } from "@/features/auth/actions";
import { Lock, Phone, User, LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "LOGIN") {
        const res = await loginAction(formData);
        if (res.success) {
          setMessage({ type: "success", text: res.message || "Đăng nhập thành công!" });
          setTimeout(() => {
            onSuccess?.();
            window.location.reload();
          }, 800);
        } else {
          setMessage({ type: "error", text: res.error || "Đăng nhập thất bại" });
        }
      } else {
        const res = await registerAction(formData);
        if (res.success) {
          setMessage({
            type: "success",
            text: res.message || "Đăng ký thành công! Tài khoản đang chờ Admin kích hoạt.",
          });
          setTimeout(() => {
            setMode("LOGIN");
            setMessage(null);
          }, 2500);
        } else {
          setMessage({ type: "error", text: res.error || "Đăng ký thất bại" });
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === "LOGIN" ? "Đăng nhập Gia Phả" : "Đăng ký tài khoản mới"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "LOGIN"
              ? "Sử dụng số điện thoại đăng nhập để xem và quản lý cây phả hệ"
              : "Tài khoản sau khi đăng ký sẽ được Admin duyệt kích hoạt"}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mb-5 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setMessage(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
              mode === "LOGIN"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("REGISTER");
              setMessage(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
              mode === "REGISTER"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "REGISTER" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                name={mode === "LOGIN" ? "loginNameOrPhone" : "phone"}
                required
                placeholder="Ví dụ: 0912345678"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {message && (
            <div
              className={`flex items-start gap-1.5 rounded-lg p-2.5 text-xs ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {mode === "LOGIN" ? <LogIn className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
            <span>{isPending ? "Đang xử lý..." : mode === "LOGIN" ? "Đăng nhập" : "Đăng ký"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
