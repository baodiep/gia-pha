import { describe, it, expect } from "vitest";
import { wouldCreateCycle } from "@/features/relationships/cycle-detection";
import { parentChildInputSchema, unionInputSchema } from "@/features/relationships/validation";

describe("Parent-Child cycle detection", () => {
  // Existing tree: A -> B -> C -> D
  const existingEdges = [
    { parentId: "node-A", childId: "node-B" },
    { parentId: "node-B", childId: "node-C" },
    { parentId: "node-C", childId: "node-D" },
  ];

  it("detects self relation as cycle", () => {
    expect(wouldCreateCycle("node-A", "node-A", existingEdges)).toBe(true);
  });

  it("allows valid forward descendant edges", () => {
    // Adding B -> E
    expect(wouldCreateCycle("node-B", "node-E", existingEdges)).toBe(false);
    // Adding D -> F
    expect(wouldCreateCycle("node-D", "node-F", existingEdges)).toBe(false);
  });

  it("detects direct cycle (e.g. B as parent of A when A is already parent of B)", () => {
    expect(wouldCreateCycle("node-B", "node-A", existingEdges)).toBe(true);
  });

  it("detects indirect long cycle (e.g. D as parent of A when A -> B -> C -> D)", () => {
    expect(wouldCreateCycle("node-D", "node-A", existingEdges)).toBe(true);
    expect(wouldCreateCycle("node-C", "node-A", existingEdges)).toBe(true);
  });

  it("allows multiple parents (e.g. Mother M -> B alongside Father A -> B)", () => {
    const withMotherEdges = [
      ...existingEdges,
      { parentId: "node-M", childId: "node-B" },
    ];
    // Adding M -> C is fine if no cycle to M
    expect(wouldCreateCycle("node-M", "node-C", withMotherEdges)).toBe(false);
    // But D -> M would create a cycle (M -> B -> C -> D -> M)
    expect(wouldCreateCycle("node-D", "node-M", withMotherEdges)).toBe(true);
  });
});

describe("Relationship input schema validation", () => {
  const p1 = "00000000-0000-0000-0000-000000000001";
  const p2 = "00000000-0000-0000-0000-000000000002";

  it("validates valid parent-child input", () => {
    const valid = {
      parentId: p1,
      childId: p2,
      relationshipType: "BIOLOGICAL" as const,
      isLineageRelation: true,
      displayOrder: 1,
    };
    expect(parentChildInputSchema.safeParse(valid).success).toBe(true);
  });

  it("fails parent-child when parentId === childId", () => {
    const invalid = {
      parentId: p1,
      childId: p1,
    };
    expect(parentChildInputSchema.safeParse(invalid).success).toBe(false);
  });

  it("validates valid union input", () => {
    const valid = {
      partner1Id: p1,
      partner2Id: p2,
      status: "MARRIED" as const,
      marriageDate: "2010-01-01",
      endedDate: "2020-01-01",
    };
    expect(unionInputSchema.safeParse(valid).success).toBe(true);
  });

  it("fails union when partner1Id === partner2Id", () => {
    const invalid = {
      partner1Id: p1,
      partner2Id: p1,
    };
    expect(unionInputSchema.safeParse(invalid).success).toBe(false);
  });

  it("fails union when endedDate is before marriageDate", () => {
    const invalidDates = {
      partner1Id: p1,
      partner2Id: p2,
      marriageDate: "2020-01-01",
      endedDate: "2010-01-01",
    };
    expect(unionInputSchema.safeParse(invalidDates).success).toBe(false);
  });
});
