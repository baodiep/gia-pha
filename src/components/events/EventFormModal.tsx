"use client";

import React, { useState, useTransition } from "react";
import { createFamilyEvent, updateFamilyEvent, cancelFamilyEvent, FamilyEvent } from "@/features/events/actions";
import { EventStatus, EventVisibility } from "@/types/domain";
import { Calendar, Clock, MapPin, Users, ShieldAlert, Sparkles, X, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

interface EventFormModalProps {
  isOpen: boolean;
  eventToEdit?: FamilyEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventFormModal({ isOpen, eventToEdit, onClose, onSuccess }: EventFormModalProps) {
  const isEditing = !!eventToEdit;

  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [startsAt, setStartsAt] = useState(
    eventToEdit?.starts_at ? new Date(eventToEdit.starts_at).toISOString().slice(0, 16) : ""
  );
  const [endsAt, setEndsAt] = useState(
    eventToEdit?.ends_at ? new Date(eventToEdit.ends_at).toISOString().slice(0, 16) : ""
  );
  const [location, setLocation] = useState(eventToEdit?.location || "");
  const [status, setStatus] = useState<EventStatus>(eventToEdit?.status || "PUBLISHED");
  const [visibility, setVisibility] = useState<EventVisibility>(eventToEdit?.visibility || "ALL_MEMBERS");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!startsAt) {
      setMessage({ type: "error", text: "Vui lòng chọn thời gian bắt đầu sự kiện" });
      return;
    }

    startTransition(async () => {
      const payload = {
        title,
        description: description.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        location: location.trim() || undefined,
        status,
        visibility,
      };

      const res = isEditing
        ? await updateFamilyEvent(eventToEdit.id, payload)
        : await createFamilyEvent(payload);

      if (res.success) {
        setMessage({ type: "success", text: res.message || "Lưu sự kiện thành công!" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setMessage({ type: "error", text: res.error || "Có lỗi xảy ra khi lưu sự kiện" });
      }
    });
  };

  const handleCancelEvent = () => {
    if (!eventToEdit) return;
    if (!confirm(`Bạn có chắc chắn muốn hủy sự kiện "${eventToEdit.title}"?`)) return;

    startTransition(async () => {
      const res = await cancelFamilyEvent(eventToEdit.id);
      if (res.success) {
        setMessage({ type: "success", text: "Đã hủy sự kiện" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setMessage({ type: "error", text: res.error || "Hủy sự kiện thất bại" });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? "Chỉnh sửa sự kiện dòng họ" : "Tạo sự kiện dòng họ mới"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Lịch giỗ tổ, họp họ, khánh thành, sự kiện gia tộc</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề sự kiện *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Lễ Giỗ Tổ Chi 2, Họp mặt đầu xuân..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bắt đầu lúc *
              </label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kết thúc lúc (tùy chọn)
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Địa điểm tổ chức
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Nhà thờ họ Nguyễn, thôn Đông, xã..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Quyền xem & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phạm vi hiển thị
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as EventVisibility)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL_MEMBERS">Toàn thể dòng họ (Mọi người)</option>
                <option value="BRANCH">Theo chi nhánh quản lý</option>
                <option value="ADMIN_ONLY">Nội bộ Ban Quản Trị</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="PUBLISHED">Công khai chính thức</option>
                <option value="DRAFT">Lưu bản nháp (Chưa phát hành)</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mô tả / Nội dung chương trình
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thông báo thêm chi tiết về lễ vật, người đón tiếp, lịch trình cụ thể..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 text-xs sm:text-sm font-semibold ${
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

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEvent}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hủy sự kiện</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
              >
                {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo sự kiện"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
