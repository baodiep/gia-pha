"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  getAdminPasswordResetRequestsAction,
  executeAdminPasswordResetAction,
  rejectAdminPasswordResetAction,
} from "@/lib/auth/password-reset-actions";
import { PasswordResetRequest } from "@/types/domain";
import { KeyRound, RefreshCw, CheckCircle2, XCircle, Clock, Copy, AlertCircle, ShieldAlert } from "lucide-react";

export function AdminPasswordResetsView() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentlyResetPassword, setRecentlyResetPassword] = useState<{
    phone: string;
    pin: string;
    mustChange: boolean;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await getAdminPasswordResetRequestsAction();
      if (res.success) {
        setRequests(res.requests);
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
        const res = await getAdminPasswordResetRequestsAction();
        if (!ignore && res.success) {
          setRequests(res.requests);
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

  const handleResetRandom8 = (req: PasswordResetRequest) => {
    startTransition(async () => {
      setMessage(null);
      const res = await executeAdminPasswordResetAction(req.id, "RANDOM_8_DIGIT");
      if (res.success && res.temporaryPassword) {
        setRecentlyResetPassword({
          phone: req.phone_normalized,
          pin: res.temporaryPassword,
          mustChange: res.mustChangePassword ?? true,
        });
        setMessage({ type: "success", text: res.message || "Đã tạo mật khẩu 8 số ngẫu nhiên thành công." });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Reset mật khẩu thất bại" });
      }
    });
  };

  const handleResetManual = (req: PasswordResetRequest) => {
    const pwd = prompt("Nhập mật khẩu mới cho tài khoản (tối thiểu 6 ký tự):");
    if (!pwd) return;

    startTransition(async () => {
      setMessage(null);
      const res = await executeAdminPasswordResetAction(req.id, "MANUAL", pwd, true);
      if (res.success && res.temporaryPassword) {
        setRecentlyResetPassword({
          phone: req.phone_normalized,
          pin: res.temporaryPassword,
          mustChange: res.mustChangePassword ?? true,
        });
        setMessage({ type: "success", text: res.message || "Đã đặt mật khẩu mới thành công." });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Reset mật khẩu thất bại" });
      }
    });
  };

  const handleReject = (reqId: string) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu reset này?")) return;

    startTransition(async () => {
      const res = await rejectAdminPasswordResetAction(reqId);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Đã từ chối yêu cầu." });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Thao tác thất bại" });
      }
    });
  };

  const handleCopyPin = () => {
    if (recentlyResetPassword?.pin) {
      navigator.clipboard.writeText(recentlyResetPassword.pin);
      alert("Đã sao chép mật khẩu tạm vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-emerald-600" />
            Yêu Cầu Cấp Lại Mật Khẩu
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Xử lý yêu cầu quên mật khẩu của thành viên bằng mã 8 chữ số ngẫu nhiên hoặc nhập tay.
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

      {/* Just-Reset Password Banner (Ephemeral & Copyable) */}
      {recentlyResetPassword && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg">
            <ShieldAlert className="w-6 h-6 text-emerald-700" />
            <span>Mật khẩu tạm vừa cấp cho tài khoản: {recentlyResetPassword.phone}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-800 tracking-wider bg-white px-5 py-2 rounded-xl border border-emerald-300">
              {recentlyResetPassword.pin}
            </span>
            <button
              type="button"
              onClick={handleCopyPin}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow min-h-[48px]"
            >
              <Copy className="w-5 h-5" />
              <span>Sao chép</span>
            </button>
          </div>
          <p className="text-sm sm:text-base text-emerald-800">
            ⚠️ Hãy gửi mật khẩu này cho thành viên qua điện thoại/Zalo. Khi đăng nhập lần đầu, thành viên sẽ <strong>bắt buộc phải đổi mật khẩu mới</strong>.
          </p>
        </div>
      )}

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

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-lg bg-gray-50 rounded-xl border">
            Chưa có yêu cầu cấp lại mật khẩu nào.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900">
                    SĐT: {req.phone_normalized}
                  </span>
                  <span
                    className={`text-sm px-2.5 py-0.5 rounded font-medium ${
                      req.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : req.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {req.status === "PENDING" ? "Chờ xử lý" : req.status === "COMPLETED" ? "Đã cấp lại" : "Đã từ chối"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(req.created_at).toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {req.note && (
                <div className="text-base text-gray-700">
                  <span className="text-gray-500">Lời nhắn: </span>
                  <span>{req.note}</span>
                </div>
              )}

              {req.status === "PENDING" && (
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleResetRandom8(req)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-base min-h-[44px] cursor-pointer shadow"
                  >
                    <KeyRound className="w-5 h-5" />
                    <span>Tạo ngẫu nhiên 8 số</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleResetManual(req)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium rounded-lg text-base min-h-[44px] cursor-pointer"
                  >
                    <span>Nhập mật khẩu tay</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReject(req.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg text-base min-h-[44px] cursor-pointer"
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
    </div>
  );
}
