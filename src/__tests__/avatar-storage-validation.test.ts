import { describe, it, expect } from "vitest";
import { avatarUploadSchema, MAX_AVATAR_SIZE_BYTES } from "@/features/storage/validation";

describe("Avatar & Storage Validation", () => {
  it("validates allowed mime type and acceptable size", () => {
    const valid = {
      personId: "00000000-0000-0000-0000-000000000001",
      fileSize: 1024 * 1024 * 2, // 2MB
      mimeType: "image/jpeg",
    };

    expect(avatarUploadSchema.safeParse(valid).success).toBe(true);
  });

  it("fails if file exceeds 5MB", () => {
    const tooLarge = {
      personId: "00000000-0000-0000-0000-000000000001",
      fileSize: MAX_AVATAR_SIZE_BYTES + 1,
      mimeType: "image/png",
    };

    expect(avatarUploadSchema.safeParse(tooLarge).success).toBe(false);
  });

  it("fails if mime type is not allowed (e.g. application/pdf or exe)", () => {
    const invalidType = {
      personId: "00000000-0000-0000-0000-000000000001",
      fileSize: 1024,
      mimeType: "application/pdf",
    };

    expect(avatarUploadSchema.safeParse(invalidType).success).toBe(false);
  });
});
