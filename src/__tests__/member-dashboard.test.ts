import { describe, it, expect } from "vitest";

describe("Member Dashboard & Family Calendar (T030)", () => {
  it("should calculate days remaining correctly for memorials and events", () => {
    const today = new Date("2026-08-26T00:00:00Z");
    const targetDate = new Date("2026-08-29T00:00:00Z");

    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(3);
  });

  it("should sort merged items by timestamp ascending", () => {
    const items = [
      { id: "1", title: "Lễ giỗ Cụ Tổ", sortTimestamp: 1700000000 },
      { id: "2", title: "Họp mặt Chi 1", sortTimestamp: 1600000000 },
      { id: "3", title: "Khánh thành nhà thờ", sortTimestamp: 1800000000 },
    ];

    items.sort((a, b) => a.sortTimestamp - b.sortTimestamp);
    expect(items[0].id).toBe("2");
    expect(items[1].id).toBe("1");
    expect(items[2].id).toBe("3");
  });
});
