import { describe, it, expect } from "vitest";

// In-memory simulation of ancestor path calculation matching getAncestorPath
interface ParentChild {
  parentId: string;
  childId: string;
}

function computeAncestorPath(targetPersonId: string, relations: ParentChild[]) {
  const ancestorSet = new Set<string>();
  const queue = [targetPersonId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const r of relations) {
      if (r.childId === current && !ancestorSet.has(r.parentId)) {
        ancestorSet.add(r.parentId);
        queue.push(r.parentId);
      }
    }
  }

  const subtreeSet = new Set<string>([targetPersonId, ...ancestorSet]);
  for (const r of relations) {
    if (r.parentId === targetPersonId) {
      subtreeSet.add(r.childId);
    }
  }

  return {
    targetPersonId,
    ancestorIds: Array.from(ancestorSet),
    subtreePersonIds: Array.from(subtreeSet),
  };
}

describe("Search & Tree Focus - Ancestor Path Calculation", () => {
  // Tree:
  // P001 (Cụ Tổ) -> P003 (Chi Trưởng) -> P007 (Cháu Đích Tôn) -> P010 (Chắt)
  // P001 -> P005 (Chi Thứ) -> P009 (Cháu Chi 2)

  const relations: ParentChild[] = [
    { parentId: "P001", childId: "P003" },
    { parentId: "P001", childId: "P005" },
    { parentId: "P003", childId: "P007" },
    { parentId: "P007", childId: "P010" },
    { parentId: "P005", childId: "P009" },
  ];

  it("finds full ancestor chain for grandchild P007 (P003 -> P001)", () => {
    const path = computeAncestorPath("P007", relations);
    expect(path.ancestorIds.sort()).toEqual(["P001", "P003"].sort());
    // Subtree includes target P007 + ancestors P001, P003 + child P010
    expect(path.subtreePersonIds.sort()).toEqual(["P001", "P003", "P007", "P010"].sort());
  });

  it("does not include sibling branch (P005, P009) in ancestor path for P007", () => {
    const path = computeAncestorPath("P007", relations);
    expect(path.ancestorIds.includes("P005")).toBe(false);
    expect(path.ancestorIds.includes("P009")).toBe(false);
  });

  it("returns empty ancestor list for root node P001", () => {
    const path = computeAncestorPath("P001", relations);
    expect(path.ancestorIds).toEqual([]);
    // Direct children P003 and P005 in subtree
    expect(path.subtreePersonIds.sort()).toEqual(["P001", "P003", "P005"].sort());
  });
});
