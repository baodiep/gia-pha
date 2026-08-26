"use client";

import React, { useState, useTransition } from "react";
import { Upload, Check, AlertCircle } from "lucide-react";
import { uploadSystemAsset } from "@/features/storage/actions";

interface LogoUploadControlProps {
  currentLogoUrl?: string | null;
  label?: string;
  assetType?: "logo" | "tree-background" | "general";
  onUploadSuccess: (url: string) => void;
}

export function LogoUploadControl({
  currentLogoUrl,
  label = "Tải ảnh mới",
  assetType = "logo",
  onUploadSuccess,
}: LogoUploadControlProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Dung lượng ảnh tối đa 5MB" });
      return;
    }

    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadSystemAsset(assetType, formData);
      if (res.success && res.data?.url) {
        setMessage({ type: "success", text: "Tải ảnh thành công!" });
        onUploadSuccess(res.data.url);
      } else {
        setMessage({ type: "error", text: res.error || "Tải ảnh thất bại" });
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-sm w-fit min-h-[44px]">
        <Upload className="h-4 w-4" />
        <span>{isPending ? "Đang tải ảnh lên..." : label}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      </label>

      {message && (
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            message.type === "success" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
