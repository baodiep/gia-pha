import { z } from "zod";

export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const avatarUploadSchema = z.object({
  personId: z.string().uuid("ID thành viên không hợp lệ"),
  fileSize: z
    .number()
    .max(MAX_AVATAR_SIZE_BYTES, "Kích thước ảnh đại diện tối đa 5MB"),
  mimeType: z
    .string()
    .refine(
      (type) => ALLOWED_AVATAR_MIME_TYPES.includes(type),
      "Định dạng tệp không được hỗ trợ. Vui lòng chọn JPG, PNG, WEBP hoặc GIF"
    ),
});
