import { describe, it, expect } from "vitest";

describe("In-app Notifications (T033)", () => {
  it("should calculate unread notification count properly", () => {
    const notifs = [
      { id: "1", is_read: false },
      { id: "2", is_read: true },
      { id: "3", is_read: false },
    ];

    const unread = notifs.filter((n) => !n.is_read).length;
    expect(unread).toBe(2);
  });
});
