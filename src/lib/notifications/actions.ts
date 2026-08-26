"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/actions";
import { Notification, NotificationPreferences } from "@/types/domain";

/**
 * Get notifications for current logged in user
 */
export async function getUserNotificationsAction(): Promise<{
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, notifications: [], unreadCount: 0, error: "Vui lòng đăng nhập" };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { success: false, notifications: [], unreadCount: 0, error: error.message };
    }

    const notifs = (data || []) as Notification[];
    const unreadCount = notifs.filter((n) => !n.is_read).length;

    return {
      success: true,
      notifications: notifs,
      unreadCount,
    };
  } catch (err: unknown) {
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: err instanceof Error ? err.message : "Lỗi tải thông báo",
    };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsReadAction(notificationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Chưa đăng nhập" };

    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi cập nhật" };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Chưa đăng nhập" };

    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi cập nhật" };
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferencesAction(): Promise<{
  success: boolean;
  preferences?: NotificationPreferences;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Chưa đăng nhập" };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };

    if (!data) {
      // Default preferences
      return {
        success: true,
        preferences: {
          user_id: user.id,
          inapp_enabled: true,
          push_enabled: false,
          memorial_reminder_days: 3,
          event_reminder_days: 2,
          contribution_notify: true,
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { success: true, preferences: data as NotificationPreferences };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi tải cài đặt" };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferencesAction(
  prefs: Partial<NotificationPreferences>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Chưa đăng nhập" };

    const supabase = await createClient();

    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      inapp_enabled: prefs.inapp_enabled ?? true,
      push_enabled: prefs.push_enabled ?? false,
      memorial_reminder_days: prefs.memorial_reminder_days ?? 3,
      event_reminder_days: prefs.event_reminder_days ?? 2,
      contribution_notify: prefs.contribution_notify ?? true,
      updated_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi cập nhật" };
  }
}
