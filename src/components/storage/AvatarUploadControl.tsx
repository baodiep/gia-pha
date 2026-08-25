"use client";

import React, { useState, useTransition } from "react";
import { uploadPersonAvatar, removePersonAvatar } from "@/features/storage/actions";
import { Upload, Trash2, Camera, User, Check, AlertCircle } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  personId: string;
  currentAvatarUrl: string | null;
  personName: string;
  onAvatarUpdated?: (newUrl: string | null) => void;
}

export function AvatarUploadControl({
  personId,
  currentAvatarUrl,
  personName,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadPersonAvatar(personId, formData);
      if (res.success && res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
        setMessage({ type: "success", text: "Đã cập nhật ảnh đại diện" });
        onAvatarUpdated?.(res.data.avatarUrl);
      } else {
        setMessage({ type: "error", text: res.error || "Upload ảnh thất bại" });
      }
    });
  };

  const handleRemove = () => {
    if (!confirm(`Xóa ảnh đại diện của ${personName}?`)) return;

    setMessage(null);
    startTransition(async () => {
      const res = await removePersonAvatar(personId);
      if (res.success) {
        setAvatarUrl(null);
        setMessage({ type: "success", text: "Đã xóa ảnh đại diện" });
        onAvatarUpdated?.(null);
      } else {
        setMessage({ type: "error", text: res.error || "Xóa ảnh thất bại" });
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Preview */}
      <div className="relative h-24 w-24 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-800">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={personName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <User className="h-10 w-10" />
          </div>
        )}

        {/* Upload overlay */}
        <label
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100 text-white"
          title="Chọn ảnh mới"
        >
          <Camera className="h-6 w-6" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isPending}
            className="hidden"
          />
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <Upload className="h-3 w-3" />
          <span>{isPending ? "Đang tải..." : "Tải ảnh lên"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isPending}
            className="hidden"
          />
        </label>

        {avatarUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
            <span>Xóa</span>
          </button>
        )}
      </div>

      {/* Notice Message */}
      {message && (
        <div
          className={`flex items-center gap-1 text-[11px] ${
            message.type === "success" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
