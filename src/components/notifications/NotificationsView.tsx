"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getUserNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  getNotificationPreferencesAction,
  updateNotificationPreferencesAction,
} from "@/lib/notifications/actions";
import { Notification, NotificationPreferences } from "@/types/domain";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Settings,
  Calendar,
  Heart,
  KeyRound,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [notifRes, prefRes] = await Promise.all([
        getUserNotificationsAction(),
        getNotificationPreferencesAction(),
      ]);
      if (notifRes.success) {
        setNotifications(notifRes.notifications);
        setUnreadCount(notifRes.unreadCount);
      }
      if (prefRes.success && prefRes.preferences) {
        setPrefs(prefRes.preferences);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      setIsLoading(true);
      try {
        const [notifRes, prefRes] = await Promise.all([
          getUserNotificationsAction(),
          getNotificationPreferencesAction(),
        ]);
        if (!ignore) {
          if (notifRes.success) {
            setNotifications(notifRes.notifications);
            setUnreadCount(notifRes.unreadCount);
          }
          if (prefRes.success && prefRes.preferences) {
            setPrefs(prefRes.preferences);
          }
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

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    });
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markNotificationAsReadAction(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSavePrefs = (updated: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, ...updated };
    setPrefs(newPrefs);
    startTransition(async () => {
      await updateNotificationPreferencesAction(newPrefs);
    });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "EVENT_REMINDER":
        return <Calendar className="w-6 h-6 text-emerald-600" />;
      case "MEMORIAL_REMINDER":
        return <Heart className="w-6 h-6 text-amber-600" />;
      case "PASSWORD_RESET_REQUEST":
        return <KeyRound className="w-6 h-6 text-blue-600" />;
      case "CLAIM_REQUEST":
      case "CLAIM_RESOLVED":
        return <UserCheck className="w-6 h-6 text-purple-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-emerald-600" />
            Trung Tâm Thông Báo
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Nhận tin tức về lễ giỗ, sự kiện dòng họ và kết quả phê duyệt tài khoản.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-sm min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã đọc tất cả</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-sm"
            title="Cài đặt thông báo"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preferences Drawer / Box */}
      {showSettings && prefs && (
        <div className="p-5 bg-white border border-gray-300 rounded-2xl shadow-md space-y-4">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            Cài Đặt Nhận Thông Báo
          </h3>

          <div className="space-y-3 divide-y">
            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span className="text-base font-medium text-gray-800">
                Nhắc ngày giỗ trước:
              </span>
              <select
                value={prefs.memorial_reminder_days}
                onChange={(e) =>
                  handleSavePrefs({ memorial_reminder_days: Number(e.target.value) })
                }
                className="p-2 border rounded-lg text-base"
              >
                <option value="1">1 ngày trước</option>
                <option value="3">3 ngày trước</option>
                <option value="7">7 ngày trước</option>
              </select>
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <span className="text-base font-medium text-gray-800">
                Nhắc sự kiện dòng họ trước:
              </span>
              <select
                value={prefs.event_reminder_days}
                onChange={(e) =>
                  handleSavePrefs({ event_reminder_days: Number(e.target.value) })
                }
                className="p-2 border rounded-lg text-base"
              >
                <option value="1">1 ngày trước</option>
                <option value="2">2 ngày trước</option>
                <option value="5">5 ngày trước</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Notification Feed */}
      {isLoading ? (
        <div className="py-20 text-center text-lg text-gray-500 font-medium">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Đang tải thông báo...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-lg space-y-2">
          <Bell className="w-12 h-12 mx-auto text-gray-300" />
          <p>Bạn chưa có thông báo mới nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const content = (
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  notif.is_read
                    ? "bg-white border-gray-200 text-gray-700"
                    : "bg-emerald-50/70 border-emerald-300 text-gray-900 shadow-sm"
                }`}
              >
                <div className="p-2.5 bg-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-base sm:text-lg ${
                        notif.is_read ? "font-semibold" : "font-bold text-emerald-950"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {notif.body}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(notif.created_at).toLocaleString("vi-VN")}
                    </span>

                    {notif.link_url && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-sm">
                        <span>Xem chi tiết</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return notif.link_url ? (
              <Link
                key={notif.id}
                href={notif.link_url}
                onClick={() => handleItemClick(notif)}
                className="block hover:scale-[1.01] transition-transform"
              >
                {content}
              </Link>
            ) : (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className="cursor-pointer"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-6 flex justify-center">
        <BackButton fallbackHref="/" label="Về Cây Gia Phả" />
      </div>
    </div>
  );
}
