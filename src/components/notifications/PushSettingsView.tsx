"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  savePushSubscriptionAction,
  removePushSubscriptionAction,
  getUserPushSubscriptionsAction,
} from "@/lib/notifications/push-actions";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Send,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export function PushSettingsView() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (typeof window !== "undefined") {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
          if (!ignore) setIsSupported(false);
          return;
        }
        if (!ignore) setPermission(Notification.permission);
        try {
          const res = await getUserPushSubscriptionsAction();
          if (!ignore && res.success) {
            setDeviceCount(res.subscriptions.length);
            setIsSubscribed(res.subscriptions.length > 0);
          }
        } catch {
          // ignore
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubscribe = async () => {
    setMessage(null);
    if (!isSupported) {
      setMessage({ type: "error", text: "Trình duyệt hiện tại không hỗ trợ thông báo đẩy." });
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setMessage({
          type: "error",
          text: "Bạn đã từ chối quyền thông báo. Vui lòng bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ để cấp lại quyền.",
        });
        return;
      }

      startTransition(async () => {
        // Mock/standard push payload structure for demo/PWA
        const res = await savePushSubscriptionAction({
          endpoint: `https://push.example.com/client/${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)}`,
          keys: {
            p256dh: "BMOCK_P256DH_KEY_FOR_BROWSER_NOTIFICATION",
            auth: "BMOCK_AUTH_SECRET",
          },
          userAgent: navigator.userAgent,
        });

        if (res.success) {
          setIsSubscribed(true);
          setDeviceCount((prev) => prev + 1);
          setMessage({
            type: "success",
            text: "Đã bật thông báo trình duyệt thành công! Bạn sẽ nhận được nhắc nhở khi có ngày giỗ và sự kiện mới.",
          });
        } else {
          setMessage({ type: "error", text: res.error || "Không thể lưu cài đặt thông báo" });
        }
      });
    } catch {
      setMessage({ type: "error", text: "Có lỗi xảy ra khi xin quyền thông báo." });
    }
  };

  const handleUnsubscribe = async () => {
    startTransition(async () => {
      setMessage(null);
      const res = await removePushSubscriptionAction(
        `https://push.example.com/client/${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)}`
      );
      if (res.success) {
        setIsSubscribed(false);
        setDeviceCount((prev) => Math.max(0, prev - 1));
        setMessage({ type: "success", text: "Đã tắt nhận thông báo đẩy trên thiết bị này." });
      } else {
        setMessage({ type: "error", text: res.error || "Lỗi tắt thông báo" });
      }
    });
  };

  const handleTestNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Gia Phả Dòng Họ", {
        body: "Đây là thông báo thử nghiệm thành công từ ứng dụng Gia Phả.",
        icon: "/favicon.ico",
      });
      setMessage({ type: "success", text: "Đã gửi thông báo thử thành công!" });
    } else {
      setMessage({ type: "error", text: "Vui lòng bật quyền thông báo trước khi gửi thử." });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BellRing className="w-8 h-8 text-emerald-600" />
          Cài Đặt Thông Báo Trình Duyệt
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Chủ động nhận tin nhắn nhắc ngày giỗ và sự kiện họ ngay trên màn hình điện thoại hoặc máy tính.
        </p>
      </div>

      {/* Guide Card for 40+ friendly UX */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 text-gray-800 space-y-2">
        <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          Lợi ích của thông báo trình duyệt:
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-base sm:text-lg text-gray-700">
          <li>Không bỏ lỡ các ngày kỵ nhật (ngày giỗ) của tiền nhân trong dòng họ.</li>
          <li>Nhận thông báo khi Ban Quản trị đăng lịch giỗ chạp, khánh thành, họp mặt.</li>
          <li>Hoàn toàn miễn phí, không yêu cầu số dư tin nhắn SMS.</li>
        </ul>
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

      {/* Status & Toggle Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">
              Trạng thái nhận thông báo:
            </h3>
            <p className="text-base text-gray-600">
              {permission === "denied"
                ? "Đã bị chặn bởi trình duyệt (Vui lòng mở cài đặt trình duyệt để cho phép)"
                : isSubscribed
                ? `Đang bật (Đã kết nối ${deviceCount} thiết bị)`
                : "Chưa kích hoạt trên thiết bị này"}
            </p>
          </div>

          <div>
            {isSubscribed ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleUnsubscribe}
                className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-base min-h-[48px] flex items-center gap-2 cursor-pointer"
              >
                <BellOff className="w-5 h-5" />
                <span>Tắt thông báo</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending || !isSupported}
                onClick={handleSubscribe}
                className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-base sm:text-lg shadow min-h-[50px] flex items-center gap-2 cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span>Bật thông báo ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Test Notification Button */}
        {isSubscribed && (
          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-base text-gray-700 font-medium">
              Kiểm tra hoạt động của thông báo:
            </span>
            <button
              type="button"
              onClick={handleTestNotification}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-sm min-h-[44px] flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gửi thông báo thử</span>
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="pt-4 flex justify-center">
        <BackButton fallbackHref="/notifications" label="Về Trung Tâm Thông Báo" />
      </div>
    </div>
  );
}
