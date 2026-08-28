import { describe, it, expect } from "vitest";
import { parentChildInputSchema } from "@/features/relationships/validation";

describe("Multi-spouse child relationship validation", () => {
  it("allows unionId in parentChildInputSchema", () => {
    const validParentId = "11111111-1111-4111-8111-111111111111";
    const validChildId = "22222222-2222-4222-8222-222222222222";
    const validUnionId = "33333333-3333-4333-8333-333333333333";

    const parsed = parentChildInputSchema.parse({
      parentId: validParentId,
      childId: validChildId,
      relationshipType: "BIOLOGICAL",
      isLineageRelation: true,
      displayOrder: 1,
      unionId: validUnionId,
    });

    expect(parsed.unionId).toBe(validUnionId);
    expect(parsed.parentId).toBe(validParentId);
    expect(parsed.childId).toBe(validChildId);
  });

  it("allows parentChild without unionId (backward compatibility)", () => {
    const validParentId = "11111111-1111-4111-8111-111111111111";
    const validChildId = "22222222-2222-4222-8222-222222222222";

    const parsed = parentChildInputSchema.parse({
      parentId: validParentId,
      childId: validChildId,
      relationshipType: "BIOLOGICAL",
      isLineageRelation: true,
      displayOrder: 2,
    });

    expect(parsed.unionId).toBeUndefined();
  });
});
