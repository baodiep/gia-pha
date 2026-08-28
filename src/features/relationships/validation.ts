import { z } from "zod";

export const parentChildInputSchema = z.object({
  parentId: z.string().uuid("Parent ID không hợp lệ"),
  childId: z.string().uuid("Child ID không hợp lệ"),
  relationshipType: z.enum(["BIOLOGICAL", "ADOPTED", "STEP"]).default("BIOLOGICAL"),
  isLineageRelation: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  unionId: z.string().uuid("Union ID không hợp lệ").nullable().optional(),
}).refine((data) => data.parentId !== data.childId, {
  message: "Không thể tạo quan hệ cha/mẹ-con với chính bản thân (self relation)",
  path: ["childId"],
});

export const unionInputSchema = z.object({
  partner1Id: z.string().uuid("Partner 1 ID không hợp lệ"),
  partner2Id: z.string().uuid("Partner 2 ID không hợp lệ"),
  status: z.enum(["MARRIED", "PARTNER", "DIVORCED", "ENDED"]).default("MARRIED"),
  marriageDate: z.string().nullable().optional(),
  endedDate: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
}).refine((data) => data.partner1Id !== data.partner2Id, {
  message: "Không thể tạo quan hệ hôn phối với chính bản thân",
  path: ["partner2Id"],
}).refine((data) => {
  if (data.marriageDate && data.endedDate) {
    return new Date(data.endedDate) >= new Date(data.marriageDate);
  }
  return true;
}, {
  message: "Ngày kết thúc hôn phối phải sau hoặc bằng ngày kết hôn",
  path: ["endedDate"],
});

export type ParentChildInput = z.infer<typeof parentChildInputSchema>;
export type UnionInput = z.infer<typeof unionInputSchema>;
