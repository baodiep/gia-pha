"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  getPendingRequestsAction,
  reviewPersonClaimRequestAction,
  reviewProfileChangeRequestAction,
} from "@/lib/requests/claim-profile-actions";
import { PersonClaimRequest, ProfileChangeRequest } from "@/types/domain";
import { CheckCircle2, XCircle, Clock, UserCheck, Edit3, AlertCircle, RefreshCw } from "lucide-react";

export function AdminRequestsView() {
  const [activeTab, setActiveTab] = useState<"CLAIMS" | "CHANGES">("CLAIMS");
  const [claims, setClaims] = useState<Array<PersonClaimRequest & { user_phone?: string; person_name?: string }>>([]);
  const [changes, setChanges] = useState<Array<ProfileChangeRequest & { user_phone?: string; person_name?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await getPendingRequestsAction();
      if (res.success) {
        setClaims(res.claims);
        setChanges(res.changes);
      } else {
        setMessage({ type: "error", text: res.error || "Không thể tải danh sách" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      setIsLoading(true);
      setMessage(null);
      try {
        const res = await getPendingRequestsAction();
        if (!ignore && res.success) {
          setClaims(res.claims);
          setChanges(res.changes);
        } else if (!ignore && !res.success) {
          setMessage({ type: "error", text: res.error || "Không thể tải danh sách" });
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

  const handleReviewClaim = (id: string, decision: "APPROVE" | "REJECT") => {
    const note = prompt(decision === "APPROVE" ? "Ghi chú duyệt (tùy chọn):" : "Lý do từ chối (tùy chọn):") || undefined;

    startTransition(async () => {
      const res = await reviewPersonClaimRequestAction(id, decision, note);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Xử lý thành công" });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Xử lý thất bại" });
      }
    });
  };

  const handleReviewChange = (id: string, decision: "APPROVE" | "REJECT") => {
    const note = prompt(decision === "APPROVE" ? "Ghi chú duyệt (tùy chọn):" : "Lý do từ chối (tùy chọn):") || undefined;

    startTransition(async () => {
      const res = await reviewProfileChangeRequestAction(id, decision, note);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Xử lý thành công" });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Xử lý thất bại" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Duyệt Yêu Cầu Thành Viên
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Xác nhận yêu cầu &quot;Đây là tôi&quot; và đề nghị cập nhật hồ sơ từ các thành viên trong họ.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading || isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-base min-h-[44px]"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-base sm:text-lg font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("CLAIMS")}
          className={`flex-1 sm:flex-none px-6 py-3 border-b-2 flex items-center justify-center gap-2 min-h-[48px] ${
            activeTab === "CLAIMS"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Yêu cầu nhận hồ sơ ({claims.filter((c) => c.status === "PENDING").length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("CHANGES")}
          className={`flex-1 sm:flex-none px-6 py-3 border-b-2 flex items-center justify-center gap-2 min-h-[48px] ${
            activeTab === "CHANGES"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Edit3 className="w-5 h-5" />
          <span>Đề nghị sửa hồ sơ ({changes.filter((c) => c.status === "PENDING").length})</span>
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

      {/* Claims List */}
      {activeTab === "CLAIMS" && (
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-lg bg-gray-50 rounded-xl border">
              Chưa có yêu cầu nhận hồ sơ nào.
            </div>
          ) : (
            claims.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">
                      {req.person_name || "Thành viên gia phả"}
                    </span>
                    <span
                      className={`text-sm px-2.5 py-0.5 rounded font-medium ${
                        req.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {req.status === "PENDING" ? "Chờ duyệt" : req.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(req.created_at).toLocaleString("vi-VN")}</span>
                  </div>
                </div>

                <div className="text-base text-gray-700 space-y-1">
                  <div>
                    <span className="text-gray-500">Tài khoản gửi: </span>
                    <strong className="text-gray-900">{req.user_phone || req.user_id}</strong>
                  </div>
                  {req.note && (
                    <div>
                      <span className="text-gray-500">Lời nhắn: </span>
                      <span>{req.note}</span>
                    </div>
                  )}
                  {req.review_note && (
                    <div className="text-sm italic text-gray-500">
                      Ghi chú duyệt: {req.review_note}
                    </div>
                  )}
                </div>

                {req.status === "PENDING" && (
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReviewClaim(req.id, "APPROVE")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-base min-h-[44px] cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Chấp thuận & Liên kết</span>
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReviewClaim(req.id, "REJECT")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg text-base min-h-[44px] cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Changes List */}
      {activeTab === "CHANGES" && (
        <div className="space-y-4">
          {changes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-lg bg-gray-50 rounded-xl border">
              Chưa có đề nghị sửa hồ sơ nào.
            </div>
          ) : (
            changes.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">
                      {req.person_name || "Thành viên gia phả"}
                    </span>
                    <span
                      className={`text-sm px-2.5 py-0.5 rounded font-medium ${
                        req.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {req.status === "PENDING" ? "Chờ duyệt" : req.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(req.created_at).toLocaleString("vi-VN")}</span>
                  </div>
                </div>

                <div className="text-base text-gray-700 space-y-1">
                  <div>
                    <span className="text-gray-500">Tài khoản đề nghị: </span>
                    <strong className="text-gray-900">{req.user_phone || req.user_id}</strong>
                  </div>
                  {req.reason && (
                    <div>
                      <span className="text-gray-500">Lý do: </span>
                      <span>{req.reason}</span>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded-lg border text-sm font-mono space-y-1">
                    <span className="text-gray-500 font-sans block text-xs font-bold">Các thông tin đề nghị sửa:</span>
                    {Object.entries(req.requested_changes as Record<string, unknown>).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-gray-600">{k}:</span> <strong className="text-gray-900">{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {req.status === "PENDING" && (
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReviewChange(req.id, "APPROVE")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-base min-h-[44px] cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Chấp thuận & Cập nhật</span>
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReviewChange(req.id, "REJECT")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg text-base min-h-[44px] cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
