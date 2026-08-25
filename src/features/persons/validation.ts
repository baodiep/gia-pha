import { z } from "zod";

export const personInputSchema = z.object({
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự").max(100, "Họ và tên quá dài"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).default("UNKNOWN"),
  lifeStatus: z.enum(["LIVING", "DECEASED", "UNKNOWN"]).default("LIVING"),
  birthDate: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  deathLunarDay: z.number().int().min(1).max(30).nullable().optional(),
  deathLunarMonth: z.number().int().min(1).max(12).nullable().optional(),
  deathLunarIsLeapMonth: z.boolean().default(false),
  deathAnniversaryNote: z.string().max(500).nullable().optional(),
  birthPlace: z.string().max(200).nullable().optional(),
  hometown: z.string().max(200).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional().or(z.literal("")),
  generationNo: z.number().int().min(1).max(100).nullable().optional(),
  branchCode: z.string().max(50).nullable().optional(),
}).refine((data) => {
  // Validate birth_date vs death_date if both exist
  if (data.birthDate && data.deathDate) {
    return new Date(data.deathDate) >= new Date(data.birthDate);
  }
  return true;
}, {
  message: "Ngày mất phải sau hoặc bằng ngày sinh",
  path: ["deathDate"],
}).refine((data) => {
  // If lifeStatus is DECEASED, ensure lunar date components are consistent if provided
  if (data.lifeStatus !== "DECEASED" && (data.deathDate || data.deathLunarDay || data.deathLunarMonth)) {
    // If not DECEASED, death fields should not be filled
    return false;
  }
  return true;
}, {
  message: "Thông tin ngày mất/ngày giỗ chỉ áp dụng cho người đã mất",
  path: ["lifeStatus"],
});

export type PersonInput = z.infer<typeof personInputSchema>;
