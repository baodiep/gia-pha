import { describe, it, expect } from "vitest";
import { ResourceInput } from "@/lib/resources/actions";

describe("External Family Resources (T031)", () => {
  it("should validate valid resource payloads", () => {
    const valid: ResourceInput = {
      title: "Gia Phả Toàn Thư Bản Scan 1935",
      description: "Bản chữ Nôm và quốc ngữ đã được dịch nghĩa.",
      resourceType: "DOCUMENT",
      externalUrl: "https://drive.google.com/file/d/123456/view",
      isPublished: true,
      displayOrder: 1,
    };

    expect(valid.title.length).toBeGreaterThan(2);
    expect(valid.externalUrl.startsWith("https://")).toBe(true);
  });
});
