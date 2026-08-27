"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getSystemSettings, updateSystemSettingsAction, SystemSettings } from "@/features/admin/settings-actions";
import { LogoUploadControl } from "@/components/storage/LogoUploadControl";
import { BackButton } from "@/components/ui/BackButton";
import { Sparkles, Image as ImageIcon, CheckCircle2, AlertCircle, Save, Globe, Trash2, Frame } from "lucide-react";

export function AdminSettingsView() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [appTitle, setAppTitle] = useState("");
  const [appSubtitle, setAppSubtitle] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [treeBackgroundUrl, setTreeBackgroundUrl] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getSystemSettings();
        setSettings(data);
        setAppTitle(data.app_title);
        setAppSubtitle(data.app_subtitle);
        setLogoUrl(data.logo_url);
        setTreeBackgroundUrl(data.tree_background_url || null);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append("appTitle", appTitle);
    formData.append("appSubtitle", appSubtitle);
    if (logoUrl) {
      formData.append("logoUrl", logoUrl);
    }
    if (treeBackgroundUrl) {
      formData.append("treeBackgroundUrl", treeBackgroundUrl);
    }

    startTransition(async () => {
      const res = await updateSystemSettingsAction(formData);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Cập nhật thành công!" });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ type: "error", text: res.error || "Cập nhật thất bại" });
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      {/* Header & Back Button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/admin" label="Quay lại Quản trị" />
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Cài đặt Logo, Tên & Mỹ thuật Cây Gia Phả
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tùy chỉnh thương hiệu gia tộc, biểu tượng huy hiệu và họa tiết chìm trung tâm sơ đồ
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Logo preview and upload */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              Logo / Huy hiệu dòng họ
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden dark:border-slate-700 dark:bg-slate-800 shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo dòng họ" className="h-full w-full object-contain" />
                ) : (
                  <Globe className="h-10 w-10 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <LogoUploadControl
                  currentLogoUrl={logoUrl}
                  assetType="logo"
                  label="Tải logo mới"
                  onUploadSuccess={(url: string) => setLogoUrl(url)}
                />
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="block text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Gỡ logo (sử dụng biểu tượng mặc định)
                  </button>
                )}
                <p className="text-[11px] text-slate-400">
                  Hỗ trợ định dạng PNG, JPG, SVG tối đa 5MB. Logo nền trong suốt (PNG) sẽ hiển thị đẹp nhất.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Custom Watermark / Background for Family Tree */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Frame className="h-4 w-4 text-[#8c6239] dark:text-[#cca055]" />
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                Khung viền 9-Slice & Họa tiết chìm Cây Gia Phả
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Cây gia phả được áp dụng khung viền mỹ thuật 9-Slice tự động co giãn theo mọi tỷ lệ màn hình PC & Mobile. Bạn có thể tải thêm ảnh biểu trưng / rồng phượng / logo dòng họ để hiển thị chìm mờ ở trung tâm.
            </p>

            <div className="space-y-3">
              {/* Preview */}
              {treeBackgroundUrl ? (
                <div className="relative rounded-2xl border border-slate-300 overflow-hidden h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={treeBackgroundUrl}
                    alt="Biểu trưng chìm"
                    className="max-h-full max-w-full object-contain opacity-70 p-2"
                  />
                  <button
                    type="button"
                    onClick={() => setTreeBackgroundUrl(null)}
                    className="absolute top-2 right-2 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Dùng trống đồng mặc định</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Đang sử dụng biểu trưng Trống đồng Đông Sơn cổ truyền chìm mờ ở trung tâm canvas.
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    (Bạn có thể tải ảnh riêng bên dưới nếu muốn thay thế họa tiết chìm trung tâm)
                  </div>
                </div>
              )}

              {/* URL or Upload Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="url"
                  value={treeBackgroundUrl || ""}
                  onChange={(e) => setTreeBackgroundUrl(e.target.value.trim() || null)}
                  placeholder="Nhập đường dẫn URL ảnh biểu trưng chìm (https://...)"
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <LogoUploadControl
                  currentLogoUrl={treeBackgroundUrl}
                  label="Tải ảnh biểu trưng mới"
                  assetType="tree-background"
                  onUploadSuccess={(url: string) => setTreeBackgroundUrl(url)}
                />
              </div>
            </div>
          </div>

          {/* 3. Tên dòng họ */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Tên chính hiển thị (Tên Dòng họ / Phần mềm) *
            </label>
            <input
              type="text"
              required
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              placeholder="Ví dụ: Gia Phả Dòng Họ Nguyễn Văn, Phả Hệ Tộc Lê..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* 4. Phụ đề */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Dòng phụ đề bên dưới
            </label>
            <input
              type="text"
              value={appSubtitle}
              onChange={(e) => setAppSubtitle(e.target.value)}
              placeholder="Ví dụ: Sơ đồ cây phả hệ phân tầng, Chi nhánh Miền Nam..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Live Preview Bar */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2">
              Xem trước góc trên bên trái:
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm overflow-hidden shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Globe className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {appTitle || "Gia Phả Dòng Họ"}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{appSubtitle || "Sơ đồ cây phả hệ"}</div>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 min-h-[48px] cursor-pointer"
            >
              <Save className="h-5 w-5" />
              <span>{isPending ? "Đang lưu..." : "Lưu cài đặt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
