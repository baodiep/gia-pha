"use client";

import React, { useState, useTransition } from "react";
import { Upload, Camera, Check, AlertCircle } from "lucide-react";
import { uploadPersonAvatar } from "@/features/storage/actions";

interface LogoUploadControlProps {
  currentLogoUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function LogoUploadControl({
  currentLogoUrl,
  onUploadSuccess,
}: LogoUploadControlProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      // Use system-brand as virtual person ID in storage bucket
      const res = await uploadPersonAvatar("system-brand", formData);
      if (res.success && res.data?.avatarUrl) {
        setMessage({ type: "success", text: "Tải logo lên thành công!" });
        onUploadSuccess(res.data.avatarUrl);
      } else {
        setMessage({ type: "error", text: res.error || "Tải ảnh thất bại" });
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-sm w-fit min-h-[44px]">
        <Upload className="h-4 w-4" />
        <span>{isPending ? "Đang tải ảnh lên..." : "Tải ảnh logo mới"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
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
