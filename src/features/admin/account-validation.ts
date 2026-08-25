import { z } from "zod";

export const adminCreateAccountSchema = z.object({
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  personId: z.string().uuid().nullable().optional(),
  isAdmin: z.boolean().default(false),
  temporaryPassword: z.string().min(6, "Mật khẩu tạm tối thiểu 6 ký tự"),
});

export type AdminCreateAccountInput = z.infer<typeof adminCreateAccountSchema>;
