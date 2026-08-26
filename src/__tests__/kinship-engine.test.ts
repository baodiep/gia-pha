import { describe, it, expect } from "vitest";
import { findShortestKinshipPath, KinshipNode, ParentChildRel, UnionRel } from "@/lib/kinship/engine";

describe("Kinship Relationship Engine (T028)", () => {
  const persons: KinshipNode[] = [
    { id: "P_ONG", fullName: "Nguyễn Văn Ông", gender: "MALE", generationNo: 1 },
    { id: "P_BA", fullName: "Trần Thị Bà", gender: "FEMALE", generationNo: 1 },
    { id: "P_CHA", fullName: "Nguyễn Văn Cha", gender: "MALE", generationNo: 2 },
    { id: "P_ME", fullName: "Lê Thị Mẹ", gender: "FEMALE", generationNo: 2 },
    { id: "P_BAC", fullName: "Nguyễn Văn Bác", gender: "MALE", generationNo: 2 },
    { id: "P_CON1", fullName: "Nguyễn Văn Con Trai", gender: "MALE", generationNo: 3 },
    { id: "P_CON2", fullName: "Nguyễn Thị Con Gái", gender: "FEMALE", generationNo: 3 },
  ];

  const parentChildList: ParentChildRel[] = [
    // Ong & Ba -> Cha & Bac
    { parentId: "P_ONG", childId: "P_CHA", isLineage: true },
    { parentId: "P_BA", childId: "P_CHA", isLineage: false },
    { parentId: "P_ONG", childId: "P_BAC", isLineage: true },
    { parentId: "P_BA", childId: "P_BAC", isLineage: false },

    // Cha & Me -> Con1 & Con2
    { parentId: "P_CHA", childId: "P_CON1", isLineage: true },
    { parentId: "P_ME", childId: "P_CON1", isLineage: false },
    { parentId: "P_CHA", childId: "P_CON2", isLineage: true },
    { parentId: "P_ME", childId: "P_CON2", isLineage: false },
  ];

  const unionsList: UnionRel[] = [
    { partner1Id: "P_ONG", partner2Id: "P_BA" },
    { partner1Id: "P_CHA", partner2Id: "P_ME" },
  ];

  it("should identify parent-child and child-parent direct relationships", () => {
    // Cha -> Con1
    const res1 = findShortestKinshipPath("P_CHA", "P_CON1", persons, parentChildList, unionsList);
    expect(res1?.found).toBe(true);
    expect(res1?.relationshipTitle).toBe("Cha ruột");
    expect(res1?.degree).toBe(1);

    // Con2 -> Cha
    const res2 = findShortestKinshipPath("P_CON2", "P_CHA", persons, parentChildList, unionsList);
    expect(res2?.found).toBe(true);
    expect(res2?.relationshipTitle).toBe("Con gái");
    expect(res2?.degree).toBe(1);
  });

  it("should identify spouse relationships", () => {
    const res = findShortestKinshipPath("P_ME", "P_CHA", persons, parentChildList, unionsList);
    expect(res?.found).toBe(true);
    expect(res?.relationshipTitle).toBe("Vợ");
    expect(res?.degree).toBe(1);
  });

  it("should identify sibling relationships", () => {
    const res = findShortestKinshipPath("P_CON1", "P_CON2", persons, parentChildList, unionsList);
    expect(res?.found).toBe(true);
    expect(res?.relationshipTitle).toContain("Anh / Em trai ruột");
    expect(res?.degree).toBe(2);
  });

  it("should identify grandparent and grandchild relationships", () => {
    // Ong -> Con1 (Grandfather -> Grandson)
    const res1 = findShortestKinshipPath("P_ONG", "P_CON1", persons, parentChildList, unionsList);
    expect(res1?.found).toBe(true);
    expect(res1?.relationshipTitle).toBe("Ông nội");
    expect(res1?.degree).toBe(2);

    // Con2 -> Ba (Granddaughter -> Grandmother)
    const res2 = findShortestKinshipPath("P_CON2", "P_BA", persons, parentChildList, unionsList);
    expect(res2?.found).toBe(true);
    expect(res2?.relationshipTitle).toBe("Cháu nội gái");
    expect(res2?.degree).toBe(2);
  });
});
