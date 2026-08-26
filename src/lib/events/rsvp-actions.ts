"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/actions";
import { EventAttendee, RsvpStatus } from "@/types/domain";
import { z } from "zod";

const rsvpInputSchema = z.object({
  eventId: z.string().uuid("ID sự kiện không hợp lệ"),
  status: z.enum(["GOING", "MAYBE", "DECLINED"]),
  guestCount: z.number().int().min(0, "Số khách đi kèm tối thiểu là 0").max(20, "Số khách đi kèm tối đa 20 người"),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export interface EventRsvpSummary {
  myRsvp: EventAttendee | null;
  totalGoing: number;
  totalMaybe: number;
  totalDeclined: number;
  totalGuests: number;
  attendeesList: Array<{
    id: string;
    userId: string;
    phone: string;
    status: RsvpStatus;
    guestCount: number;
    note: string | null;
    updatedAt: string;
  }>;
}

/**
 * Member / Admin: Get current user RSVP and event attendees count
 */
export async function getEventRsvpDataAction(eventId: string): Promise<{
  success: boolean;
  data?: EventRsvpSummary;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, error: "Vui lòng đăng nhập để xem thông tin sự kiện" };
    }

    const supabase = await createClient();

    // Verify event exists
    const { data: event, error: evErr } = await supabase
      .from("family_events")
      .select("id, visibility, branch_code")
      .eq("id", eventId)
      .is("deleted_at", null)
      .single();

    if (evErr || !event) {
      return { success: false, error: "Không tìm thấy sự kiện này" };
    }

    // Get all attendees for this event
    const { data: attendees, error: attErr } = await supabase
      .from("event_attendees")
      .select("id, event_id, user_id, status, guest_count, note, created_at, updated_at")
      .eq("event_id", eventId);

    if (attErr) {
      return { success: false, error: attErr.message };
    }

    const allAttendees = (attendees || []) as EventAttendee[];

    // Fetch user profiles for attendees if Admin, or just phone mask for members
    const userIds = Array.from(new Set(allAttendees.map((a) => a.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, phone_normalized")
      .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p.phone_normalized]));

    let totalGoing = 0;
    let totalMaybe = 0;
    let totalDeclined = 0;
    let totalGuests = 0;
    let myRsvp: EventAttendee | null = null;

    const attendeesList = allAttendees.map((a) => {
      if (a.user_id === user.id) {
        myRsvp = a;
      }
      if (a.status === "GOING") {
        totalGoing += 1;
        totalGuests += a.guest_count || 0;
      } else if (a.status === "MAYBE") {
        totalMaybe += 1;
      } else if (a.status === "DECLINED") {
        totalDeclined += 1;
      }

      return {
        id: a.id,
        userId: a.user_id,
        phone: profileMap.get(a.user_id) || "Thành viên",
        status: a.status,
        guestCount: a.guest_count,
        note: a.note,
        updatedAt: a.updated_at,
      };
    });

    return {
      success: true,
      data: {
        myRsvp,
        totalGoing,
        totalMaybe,
        totalDeclined,
        totalGuests,
        attendeesList,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi tải thông tin đăng ký" };
  }
}

/**
 * Member: Submit or update own RSVP
 */
export async function submitEventRsvpAction(
  input: RsvpInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE") {
      return { success: false, error: "Vui lòng đăng nhập để xác nhận tham dự" };
    }

    const parsed = rsvpInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
    }

    const val = parsed.data;
    const adminClient = createAdminClient();

    // Check if event is active
    const { data: event, error: evErr } = await adminClient
      .from("family_events")
      .select("id, title")
      .eq("id", val.eventId)
      .is("deleted_at", null)
      .single();

    if (evErr || !event) {
      return { success: false, error: "Sự kiện không tồn tại hoặc đã bị hủy" };
    }

    // Upsert RSVP
    const { data: existing } = await adminClient
      .from("event_attendees")
      .select("id")
      .eq("event_id", val.eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Update
      const { error: updateErr } = await adminClient
        .from("event_attendees")
        .update({
          status: val.status,
          guest_count: val.guestCount,
          note: val.note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateErr) return { success: false, error: updateErr.message };
    } else {
      // Insert
      const { error: insertErr } = await adminClient.from("event_attendees").insert({
        event_id: val.eventId,
        user_id: user.id,
        status: val.status,
        guest_count: val.guestCount,
        note: val.note || null,
      });

      if (insertErr) return { success: false, error: insertErr.message };
    }

    return {
      success: true,
      message: `Đã cập nhật trạng thái tham dự sự kiện "${event.title}" thành công.`,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi lưu đăng ký tham dự" };
  }
}
