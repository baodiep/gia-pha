import { describe, it, expect } from "vitest";

// In-memory simulation of CTE recursion logic matching get_lineage_descendants and get_branch_editable_persons
interface ParentChild {
  parentId: string;
  childId: string;
  isLineageRelation: boolean;
}

interface Union {
  partner1Id: string;
  partner2Id: string;
}

function getLineageDescendants(rootPersonId: string, parentChildList: ParentChild[]): Set<string> {
  const descendants = new Set<string>([rootPersonId]);
  let added = true;

  while (added) {
    added = false;
    for (const pc of parentChildList) {
      if (pc.isLineageRelation && descendants.has(pc.parentId) && !descendants.has(pc.childId)) {
        descendants.add(pc.childId);
        added = true;
      }
    }
  }

  return descendants;
}

function getBranchEditablePersons(rootPersonId: string, parentChildList: ParentChild[], unionsList: Union[]): Set<string> {
  const lineage = getLineageDescendants(rootPersonId, parentChildList);
  const editable = new Set<string>(lineage);

  for (const u of unionsList) {
    if (lineage.has(u.partner1Id)) {
      editable.add(u.partner2Id);
    }
    if (lineage.has(u.partner2Id)) {
      editable.add(u.partner1Id);
    }
  }

  return editable;
}

describe("Database recursive lineage & editable branch logic", () => {
  const parentChildRelations: ParentChild[] = [
    // Đời 1 -> Đời 2
    { parentId: "P001", childId: "P003", isLineageRelation: true },
    { parentId: "P002", childId: "P003", isLineageRelation: false },
    { parentId: "P001", childId: "P005", isLineageRelation: true },
    { parentId: "P002", childId: "P005", isLineageRelation: false },
    // Đời 2 (Chi 1) -> Đời 3
    { parentId: "P003", childId: "P007", isLineageRelation: true },
    { parentId: "P004", childId: "P007", isLineageRelation: false },
    { parentId: "P003", childId: "P008", isLineageRelation: true },
    { parentId: "P004", childId: "P008", isLineageRelation: false },
    // Đời 2 (Chi 2) -> Đời 3
    { parentId: "P005", childId: "P009", isLineageRelation: true },
    { parentId: "P006", childId: "P009", isLineageRelation: false },
  ];

  const unions: Union[] = [
    { partner1Id: "P001", partner2Id: "P002" },
    { partner1Id: "P003", partner2Id: "P004" },
    { partner1Id: "P005", partner2Id: "P006" },
  ];

  it("calculates all lineage descendants from root Cụ Tổ P001", () => {
    const descendants = getLineageDescendants("P001", parentChildRelations);
    expect(Array.from(descendants).sort()).toEqual(["P001", "P003", "P005", "P007", "P008", "P009"].sort());
  });

  it("calculates lineage descendants for Chi 1 (P003)", () => {
    const descendants = getLineageDescendants("P003", parentChildRelations);
    expect(Array.from(descendants).sort()).toEqual(["P003", "P007", "P008"].sort());
  });

  it("calculates lineage descendants for Chi 2 (P005)", () => {
    const descendants = getLineageDescendants("P005", parentChildRelations);
    expect(Array.from(descendants).sort()).toEqual(["P005", "P009"].sort());
  });

  it("calculates branch editable set (lineage + spouses) for Chi 1 (P003)", () => {
    const editable = getBranchEditablePersons("P003", parentChildRelations, unions);
    // Lineage: P003, P007, P008 + Spouse of P003 is P004
    expect(Array.from(editable).sort()).toEqual(["P003", "P004", "P007", "P008"].sort());
  });

  it("ensures outside branch cannot be edited from Chi 1", () => {
    const editable = getBranchEditablePersons("P003", parentChildRelations, unions);
    expect(editable.has("P005")).toBe(false); // Chi 2
    expect(editable.has("P006")).toBe(false); // Vợ Chi 2
    expect(editable.has("P009")).toBe(false); // Cháu Chi 2
  });
});
