"use client";

import React, { useState, useEffect, useTransition } from "react";
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EventStatus>("PUBLISHED");
  const [visibility, setVisibility] = useState<EventVisibility>("ALL_MEMBERS");

  // Inline validation errors state
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    startsAt?: string;
  }>({});

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Đồng bộ dữ liệu mỗi khi eventToEdit hoặc isOpen thay đổi (Fix BUG-01)
  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      if (eventToEdit) {
        setTitle(eventToEdit.title || "");
        setDescription(eventToEdit.description || "");
        setStartsAt(
          eventToEdit.starts_at ? new Date(eventToEdit.starts_at).toISOString().slice(0, 16) : ""
        );
        setEndsAt(
          eventToEdit.ends_at ? new Date(eventToEdit.ends_at).toISOString().slice(0, 16) : ""
        );
        setLocation(eventToEdit.location || "");
        setStatus(eventToEdit.status || "PUBLISHED");
        setVisibility(eventToEdit.visibility || "ALL_MEMBERS");
      } else {
        setTitle("");
        setDescription("");
        setStartsAt("");
        setEndsAt("");
        setLocation("");
        setStatus("PUBLISHED");
        setVisibility("ALL_MEMBERS");
      }
      setFieldErrors({});
      setMessage(null);
      setShowConfirmCancelModal(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: { title?: string; startsAt?: string } = {};
    if (!title.trim()) {
      errors.title = "Vui lòng nhập tiêu đề sự kiện";
    }
    if (!startsAt) {
      errors.startsAt = "Vui lòng chọn thời gian bắt đầu sự kiện";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) {
      return;
    }

    startTransition(async () => {
      const payload = {
        title: title.trim(),
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
        }, 800);
      } else {
        setMessage({ type: "error", text: res.error || "Có lỗi xảy ra khi lưu sự kiện" });
      }
    });
  };

  const handleConfirmCancelEvent = () => {
    if (!eventToEdit) return;

    startTransition(async () => {
      const res = await cancelFamilyEvent(eventToEdit.id);
      if (res.success) {
        setMessage({ type: "success", text: "Đã hủy sự kiện thành công!" });
        setShowConfirmCancelModal(false);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        setMessage({ type: "error", text: res.error || "Hủy sự kiện thất bại" });
      }
    });
  };

  return (
    <>
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
              type="button"
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
                Tiêu đề sự kiện <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="Ví dụ: Lễ Giỗ Tổ Chi 2, Họp mặt đầu xuân..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold focus:outline-none dark:bg-slate-800 dark:text-white ${
                  fieldErrors.title
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/50"
                    : "border-slate-300 focus:border-indigo-600"
                }`}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{fieldErrors.title}</span>
                </p>
              )}
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bắt đầu lúc <span className="text-rose-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => {
                    setStartsAt(e.target.value);
                    if (fieldErrors.startsAt) setFieldErrors((prev) => ({ ...prev, startsAt: undefined }));
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none dark:bg-slate-800 dark:text-white ${
                    fieldErrors.startsAt
                      ? "border-rose-500 focus:border-rose-600 bg-rose-50/50"
                      : "border-slate-300 focus:border-indigo-600"
                  }`}
                />
                {fieldErrors.startsAt && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{fieldErrors.startsAt}</span>
                  </p>
                )}
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

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chi tiết kế hoạch & chuẩn bị
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi chú thêm về phân công mâm cỗ, đóng góp hương hoa, giờ tế lễ..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm font-medium focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Messages */}
            {message && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs sm:text-sm font-bold ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {isEditing && eventToEdit.status !== "CANCELLED" ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmCancelModal(true)}
                  disabled={isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hủy sự kiện này</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
                >
                  {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo sự kiện"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Internal Confirm Cancel Modal (Fix BUG-02: replaces native window.confirm) */}
      {showConfirmCancelModal && eventToEdit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Xác nhận hủy sự kiện
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Bạn có chắc chắn muốn chuyển trạng thái sự kiện{" "}
              <strong className="font-bold text-slate-900 dark:text-white">
                &ldquo;{eventToEdit.title}&rdquo;
              </strong>{" "}
              sang <span className="text-rose-600 font-semibold">ĐÃ HỦY</span>? Sự kiện sẽ không còn hiển thị trong mục sắp diễn ra.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmCancelModal(false)}
                disabled={isPending}
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Không, giữ lại
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelEvent}
                disabled={isPending}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isPending ? "Đang xử lý..." : "Xác nhận Hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
