import { z } from "zod";

export const familyEventInputSchema = z.object({
  title: z.string().min(2, "Tiêu đề sự kiện tối thiểu 2 ký tự").max(200, "Tiêu đề quá dài"),
  description: z.string().max(3000).nullable().optional(),
  startsAt: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endsAt: z.string().nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).default("DRAFT"),
  visibility: z.enum(["ALL_MEMBERS", "BRANCH", "ADMIN_ONLY"]).default("ALL_MEMBERS"),
  rootPersonId: z.string().uuid().nullable().optional(),
}).refine((data) => {
  if (data.endsAt && data.startsAt) {
    return new Date(data.endsAt) >= new Date(data.startsAt);
  }
  return true;
}, {
  message: "Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu",
  path: ["endsAt"],
}).refine((data) => {
  if (data.visibility === "BRANCH" && !data.rootPersonId) {
    return false;
  }
  return true;
}, {
  message: "Sự kiện cấp nhánh bắt buộc phải chọn chi/nhánh gốc (root person)",
  path: ["rootPersonId"],
});

export type FamilyEventInput = z.infer<typeof familyEventInputSchema>;
