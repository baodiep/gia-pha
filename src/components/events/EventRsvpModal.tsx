"use client";

import React, { useState, useTransition } from "react";
import { submitEventRsvpAction } from "@/lib/events/rsvp-actions";
import { EventAttendee, RsvpStatus } from "@/types/domain";
import { Users2, CheckCircle2, AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

interface EventRsvpModalProps {
  eventId: string;
  eventTitle: string;
  initialRsvp: EventAttendee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventRsvpModal({
  eventId,
  eventTitle,
  initialRsvp,
  isOpen,
  onClose,
  onSuccess,
}: EventRsvpModalProps) {
  const [status, setStatus] = useState<RsvpStatus>(initialRsvp?.status || "GOING");
  const [guestCount, setGuestCount] = useState<number>(initialRsvp?.guest_count || 0);
  const [note, setNote] = useState<string>(initialRsvp?.note || "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await submitEventRsvpAction({
        eventId,
        status,
        guestCount: status === "GOING" ? Number(guestCount) : 0,
        note: note.trim() || undefined,
      });

      if (res.success) {
        setMessage({ type: "success", text: res.message || "Đã lưu xác nhận tham dự!" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setMessage({ type: "error", text: res.error || "Gửi xác nhận thất bại" });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users2 className="w-6 h-6 text-emerald-600" />
              Đăng Ký Tham Dự Sự Kiện
            </h2>
            <p className="text-base text-gray-600 mt-1 line-clamp-1 font-semibold">{eventTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 text-base ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-bold text-gray-900">
              Bạn có thể tham dự không?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("GOING")}
                className={`py-3.5 px-2 rounded-xl text-sm sm:text-base font-bold min-h-[48px] cursor-pointer transition-all border ${
                  status === "GOING"
                    ? "bg-emerald-700 text-white border-emerald-700 shadow"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Chắc chắn đi
              </button>

              <button
                type="button"
                onClick={() => setStatus("MAYBE")}
                className={`py-3.5 px-2 rounded-xl text-sm sm:text-base font-bold min-h-[48px] cursor-pointer transition-all border ${
                  status === "MAYBE"
                    ? "bg-amber-500 text-white border-amber-500 shadow"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Có thể đi
              </button>

              <button
                type="button"
                onClick={() => setStatus("DECLINED")}
                className={`py-3.5 px-2 rounded-xl text-sm sm:text-base font-bold min-h-[48px] cursor-pointer transition-all border ${
                  status === "DECLINED"
                    ? "bg-red-600 text-white border-red-600 shadow"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Bận, không đi
              </button>
            </div>
          </div>

          {/* Guest Count (Only when GOING) */}
          {status === "GOING" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <label htmlFor="guestCount" className="block text-base font-bold text-emerald-950">
                Số người thân / khách đi cùng (ngoài bạn):
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="guestCount"
                  type="number"
                  min="0"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-24 p-3 text-lg font-bold text-center border border-emerald-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-base text-emerald-900 font-medium">người đi kèm</span>
              </div>
              <p className="text-xs text-gray-600">
                (Giúp Ban Tổ chức chuẩn bị chu đáo phần cỗ bàn và chỗ ngồi).
              </p>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label htmlFor="note" className="block text-base font-semibold text-gray-900">
              Lời nhắn hoặc ghi chú (tùy chọn):
            </label>
            <textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Tôi sẽ đến muộn khoảng 30 phút..."
              className="w-full p-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-gray-300 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 min-h-[48px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow min-h-[48px] flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Xác Nhận Tham Dự</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
