"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getNewCaptchaAction, submitPasswordResetRequestAction } from "@/lib/auth/password-reset-actions";
import { CaptchaChallenge } from "@/lib/auth/captcha";
import { BackButton } from "@/components/ui/BackButton";
import { KeyRound, RefreshCw, AlertCircle, CheckCircle2, Phone, HelpCircle } from "lucide-react";

export function ForgotPasswordView() {
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCaptcha = async () => {
    try {
      const c = await getNewCaptchaAction();
      setCaptcha(c);
      setCaptchaAnswer("");
    } catch {
      setMessage({ type: "error", text: "Không thể tạo mã xác thực" });
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const c = await getNewCaptchaAction();
        if (!ignore) {
          setCaptcha(c);
          setCaptchaAnswer("");
        }
      } catch {
        if (!ignore) setMessage({ type: "error", text: "Không thể tạo mã xác thực" });
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!captcha) {
      setMessage({ type: "error", text: "Vui lòng tải lại mã xác thực" });
      return;
    }

    if (!phone) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại" });
      return;
    }

    if (!captchaAnswer) {
      setMessage({ type: "error", text: "Vui lòng tính và nhập kết quả phép tính" });
      return;
    }

    startTransition(async () => {
      const res = await submitPasswordResetRequestAction(phone, captcha.token, captchaAnswer, note);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setPhone("");
        setNote("");
        setCaptchaAnswer("");
        loadCaptcha();
      } else {
        setMessage({ type: "error", text: res.message || res.error || "Gửi yêu cầu thất bại" });
        loadCaptcha();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-inner">
            <KeyRound className="w-9 h-9" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900">
          Quên Mật Khẩu
        </h1>
        <p className="mt-2 text-center text-base sm:text-lg text-gray-600">
          Gửi yêu cầu đến Ban Quản trị dòng họ để được cấp lại mật khẩu tạm.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-gray-100 space-y-6">
          {/* Instructions for 40+ friendly UX */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-base space-y-2">
            <h3 className="font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
              Cách thức cấp lại mật khẩu:
            </h3>
            <p className="text-sm sm:text-base text-gray-700">
              Vì lý do an toàn cho gia phả họ, hệ thống không dùng tin nhắn OTP. Ban Quản trị sẽ trực tiếp xác minh và gửi mật khẩu tạm gồm 8 chữ số cho bạn.
            </p>
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
            <div>
              <label htmlFor="phone" className="block text-base font-semibold text-gray-900">
                Số điện thoại đăng nhập:
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="block w-full pl-11 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Simple Math CAPTCHA */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                Mã kiểm tra chống tự động (Phép tính):
              </label>

              <div className="flex items-center gap-3">
                <div className="bg-emerald-700 text-white font-mono text-xl font-bold px-4 py-2.5 rounded-lg tracking-wider select-none shadow-sm">
                  {captcha ? captcha.question : "Đang tải..."}
                </div>

                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="p-2.5 text-gray-600 hover:text-emerald-700 hover:bg-gray-200 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  title="Đổi phép tính khác"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div>
                <input
                  type="number"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Nhập kết quả phép tính..."
                  className="block w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="note" className="block text-base font-semibold text-gray-900">
                Lời nhắn cho Ban Quản trị (tùy chọn):
              </label>
              <textarea
                id="note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Cháu là A ở Chi 2..."
                className="mt-1 block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending || !captcha}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 min-h-[50px] cursor-pointer"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang gửi yêu cầu...
                  </span>
                ) : (
                  <span>Gửi yêu cầu cấp lại mật khẩu</span>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t flex justify-center">
            <BackButton fallbackHref="/" label="Quay lại Đăng nhập / Cây gia phả" />
          </div>
        </div>
      </div>
    </div>
  );
}
