import { describe, it, expect } from "vitest";
import { familyEventInputSchema } from "@/features/events/validation";

describe("Family Events input validation", () => {
  it("validates valid public event", () => {
    const valid = {
      title: "Lễ tế tổ mùa xuân",
      startsAt: "2026-03-10T08:00:00Z",
      endsAt: "2026-03-10T12:00:00Z",
      location: "Từ đường họ Nguyễn, Bắc Ninh",
      visibility: "ALL_MEMBERS" as const,
      status: "PUBLISHED" as const,
    };

    expect(familyEventInputSchema.safeParse(valid).success).toBe(true);
  });

  it("validates valid branch event with rootPersonId", () => {
    const validBranch = {
      title: "Họp chi 1 bàn việc tu sửa nhà thờ chi",
      startsAt: "2026-04-15T09:00:00Z",
      visibility: "BRANCH" as const,
      rootPersonId: "00000000-0000-0000-0000-000000000003",
      status: "PUBLISHED" as const,
    };

    expect(familyEventInputSchema.safeParse(validBranch).success).toBe(true);
  });

  it("fails branch event when rootPersonId is missing", () => {
    const invalidBranch = {
      title: "Họp chi không có root",
      startsAt: "2026-04-15T09:00:00Z",
      visibility: "BRANCH" as const,
      rootPersonId: null,
    };

    expect(familyEventInputSchema.safeParse(invalidBranch).success).toBe(false);
  });

  it("fails when endsAt is before startsAt", () => {
    const invalidDates = {
      title: "Sự kiện thời gian lỗi",
      startsAt: "2026-05-10T10:00:00Z",
      endsAt: "2026-05-10T08:00:00Z",
      visibility: "ALL_MEMBERS" as const,
    };

    expect(familyEventInputSchema.safeParse(invalidDates).success).toBe(false);
  });
});
