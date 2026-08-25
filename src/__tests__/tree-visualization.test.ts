import { describe, it, expect } from "vitest";
import { computeTreeLayout, TreePersonNodeData } from "@/lib/tree/elk-layout";

describe("Family Tree ELK Layout & Node Structure", () => {
  const sampleNodes: Array<{ id: string; data: TreePersonNodeData }> = [
    {
      id: "P001",
      data: {
        id: "P001",
        fullName: "Nguyễn Văn Cụ Tổ",
        gender: "MALE",
        lifeStatus: "DECEASED",
        generationNo: 1,
        branchCode: "ROOT",
        avatarUrl: null,
        isEditable: false,
        hasChildren: true,
        isExpanded: true,
        spouses: [
          { id: "P002", fullName: "Trần Thị Cụ Bà", lifeStatus: "DECEASED", status: "MARRIED" },
        ],
      },
    },
    {
      id: "P003",
      data: {
        id: "P003",
        fullName: "Nguyễn Văn Chi Trưởng",
        gender: "MALE",
        lifeStatus: "LIVING",
        generationNo: 2,
        branchCode: "CHI_1",
        avatarUrl: null,
        isEditable: true,
        hasChildren: true,
        isExpanded: true,
        spouses: [
          { id: "P004", fullName: "Lê Thị Dâu Trưởng", lifeStatus: "LIVING", status: "MARRIED" },
        ],
      },
    },
    {
      id: "P007",
      data: {
        id: "P007",
        fullName: "Nguyễn Văn Đích Tôn",
        gender: "MALE",
        lifeStatus: "LIVING",
        generationNo: 3,
        branchCode: "CHI_1",
        avatarUrl: null,
        isEditable: true,
        hasChildren: false,
        isExpanded: false,
        spouses: [],
      },
    },
  ];

  const sampleEdges = [
    { id: "e-P001-P003", source: "P001", target: "P003" },
    { id: "e-P003-P007", source: "P003", target: "P007" },
  ];

  it("calculates layered hierarchical positions using ELK without overlapping coordinates", async () => {
    const layout = await computeTreeLayout(sampleNodes, sampleEdges, { direction: "DOWN" });

    expect(layout.nodes.length).toBe(3);
    expect(layout.edges.length).toBe(2);

    const node1 = layout.nodes.find((n) => n.id === "P001")!;
    const node2 = layout.nodes.find((n) => n.id === "P003")!;
    const node3 = layout.nodes.find((n) => n.id === "P007")!;

    // Layer 1 (Cụ Tổ) y coordinate must be above Layer 2 (Chi Trưởng), which is above Layer 3
    expect(node1.position.y).toBeLessThan(node2.position.y);
    expect(node2.position.y).toBeLessThan(node3.position.y);
  });

  it("preserves isEditable and spouse metadata on tree nodes", async () => {
    const layout = await computeTreeLayout(sampleNodes, sampleEdges);
    const node1 = layout.nodes.find((n) => n.id === "P001")!;
    const node2 = layout.nodes.find((n) => n.id === "P003")!;

    expect(node1.data?.isEditable).toBe(false);
    expect(node2.data?.isEditable).toBe(true);
    expect(node1.data?.spouses?.length).toBe(1);
    expect(node1.data?.spouses?.[0].fullName).toBe("Trần Thị Cụ Bà");
  });
});
