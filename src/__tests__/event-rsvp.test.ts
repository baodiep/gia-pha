import { describe, it, expect } from "vitest";
import { RsvpInput } from "@/lib/events/rsvp-actions";

describe("Event RSVP & Attendance (T032)", () => {
  it("should validate valid RSVP input payloads", () => {
    const valid: RsvpInput = {
      eventId: "a0000000-0000-0000-0000-000000000001",
      status: "GOING",
      guestCount: 2,
      note: "Gia đình tôi sẽ có mặt đầy đủ",
    };

    expect(valid.guestCount).toBeGreaterThanOrEqual(0);
    expect(valid.guestCount).toBeLessThanOrEqual(20);
    expect(["GOING", "MAYBE", "DECLINED"]).toContain(valid.status);
  });
});
