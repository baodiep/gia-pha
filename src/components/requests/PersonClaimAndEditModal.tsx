"use client";

import React, { useState, useTransition } from "react";
import { submitPersonClaimRequestAction, submitProfileChangeRequestAction } from "@/lib/requests/claim-profile-actions";
import { UserCheck, Edit3, AlertCircle, CheckCircle2, X } from "lucide-react";

interface PersonClaimAndEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  currentBirthDate?: string | null;
  currentBirthPlace?: string | null;
  currentHometown?: string | null;
  currentBio?: string | null;
  currentAvatarUrl?: string | null;
  isAlreadyClaimed?: boolean;
}

export function PersonClaimAndEditModal({
  isOpen,
  onClose,
  personId,
  personName,
  currentBirthDate,
  currentBirthPlace,
  currentHometown,
  currentBio,
  isAlreadyClaimed,
}: PersonClaimAndEditModalProps) {
  const [activeTab, setActiveTab] = useState<"CLAIM" | "EDIT">("CLAIM");
  const [claimNote, setClaimNote] = useState("");
  const [birthDate, setBirthDate] = useState(currentBirthDate || "");
  const [birthPlace, setBirthPlace] = useState(currentBirthPlace || "");
  const [hometown, setHometown] = useState(currentHometown || "");
  const [bio, setBio] = useState(currentBio || "");
  const [changeReason, setChangeReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await submitPersonClaimRequestAction({
        personId,
        note: claimNote,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: "Đã gửi yêu cầu 'Đây là tôi' thành công! Ban Quản trị sẽ xem xét và xác nhận cho bạn.",
        });
      } else {
        setMessage({ type: "error", text: res.error || "Gửi yêu cầu thất bại" });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const changes: Record<string, unknown> = {};
    if (birthDate !== (currentBirthDate || "")) changes.birth_date = birthDate || null;
    if (birthPlace !== (currentBirthPlace || "")) changes.birth_place = birthPlace || null;
    if (hometown !== (currentHometown || "")) changes.hometown = hometown || null;
    if (bio !== (currentBio || "")) changes.bio = bio || null;

    if (Object.keys(changes).length === 0) {
      setMessage({ type: "error", text: "Bạn chưa thay đổi thông tin nào" });
      return;
    }

    startTransition(async () => {
      const res = await submitProfileChangeRequestAction({
        personId,
        requestedChanges: changes,
        reason: changeReason,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: "Đã gửi đề nghị cập nhật thông tin thành công! Ban Quản trị sẽ duyệt thay đổi của bạn.",
        });
      } else {
        setMessage({ type: "error", text: res.error || "Gửi đề nghị thất bại" });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Tương Tác Hồ Sơ Thành Viên
            </h2>
            <p className="text-base text-gray-600 mt-1">
              Thành viên: <strong className="text-emerald-700">{personName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b text-base sm:text-lg font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab("CLAIM");
              setMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-2 min-h-[48px] ${
              activeTab === "CLAIM"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Đây là tôi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("EDIT");
              setMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-2 min-h-[48px] ${
              activeTab === "EDIT"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Edit3 className="w-5 h-5" />
            <span>Đề nghị sửa</span>
          </button>
        </div>

        {/* Alerts */}
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

        {/* Tab 1: Claim "Đây là tôi" */}
        {activeTab === "CLAIM" && (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-base space-y-2">
              <p className="font-semibold">💡 Nhận hồ sơ chính mình:</p>
              <p className="text-sm sm:text-base">
                Khi Ban Quản trị phê duyệt yêu cầu này, tài khoản của bạn sẽ được gắn trực tiếp với thành viên{" "}
                <strong>{personName}</strong> trên cây gia phả.
              </p>
            </div>

            {isAlreadyClaimed ? (
              <div className="p-4 bg-gray-100 rounded-xl text-gray-700 text-base">
                Hồ sơ này đã có thành viên nhận. Nếu có nhầm lẫn, vui lòng liên hệ Admin dòng họ.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-1">
                    Ghi chú / Lời nhắn gửi Ban Quản trị (tùy chọn):
                  </label>
                  <textarea
                    rows={3}
                    value={claimNote}
                    onChange={(e) => setClaimNote(e.target.value)}
                    placeholder="Ví dụ: Cháu là con trai của bác A, hiện đang sinh sống tại..."
                    className="w-full text-base p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-base font-medium min-h-[48px]"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base min-h-[48px] shadow"
                  >
                    {isPending ? "Đang gửi..." : "Gửi yêu cầu xác nhận"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Tab 2: Propose Profile Changes */}
        {activeTab === "EDIT" && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-base font-medium text-gray-800">Ngày sinh:</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-base p-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800">Nơi sinh:</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Nhập nơi sinh..."
                  className="w-full text-base p-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800">Quê quán:</label>
                <input
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  placeholder="Nhập quê quán..."
                  className="w-full text-base p-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800">Tiểu sử / Ghi chú thêm:</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Nhập tiểu sử..."
                  className="w-full text-base p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800">Lý do đề nghị sửa:</label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Ví dụ: Đính chính lại ngày sinh chuẩn trên CCCD..."
                  className="w-full text-base p-2.5 border border-gray-300 rounded-lg min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-base font-medium min-h-[48px]"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base min-h-[48px] shadow"
              >
                {isPending ? "Đang gửi..." : "Gửi đề nghị sửa đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
