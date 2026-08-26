"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/actions";
import { PushSubscriptionRecord } from "@/types/domain";

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

/**
 * Save or update Web Push Subscription
 */
export async function savePushSubscriptionAction(
  sub: PushSubscriptionPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, error: "Vui lòng đăng nhập" };
    }

    if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return { success: false, error: "Dữ liệu đăng ký push không hợp lệ" };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth_token: sub.keys.auth,
      user_agent: sub.userAgent || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi lưu đăng ký push" };
  }
}

/**
 * Remove Web Push Subscription (Unsubscribe)
 */
export async function removePushSubscriptionAction(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Chưa đăng nhập" };

    const supabase = await createClient();

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi hủy đăng ký" };
  }
}

/**
 * Get active subscriptions for current user
 */
export async function getUserPushSubscriptionsAction(): Promise<{
  success: boolean;
  subscriptions: PushSubscriptionRecord[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, subscriptions: [], error: "Chưa đăng nhập" };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, subscriptions: [], error: error.message };

    return { success: true, subscriptions: (data || []) as PushSubscriptionRecord[] };
  } catch (err: unknown) {
    return { success: false, subscriptions: [], error: err instanceof Error ? err.message : "Lỗi tải dữ liệu" };
  }
}
