import { Gender } from "@/types/domain";

export type EdgeType = "PARENT_TO_CHILD" | "CHILD_TO_PARENT" | "SPOUSE";

export interface KinshipNode {
  id: string;
  fullName: string;
  gender: Gender;
  generationNo?: number | null;
}

export interface KinshipEdge {
  fromId: string;
  toId: string;
  type: EdgeType;
  label: string; // e.g. "Cha của", "Mẹ của", "Con của", "Vợ/Chồng của"
}

export interface KinshipPathResult {
  found: boolean;
  sourcePerson: KinshipNode;
  targetPerson: KinshipNode;
  degree: number; // number of hops
  pathNodes: KinshipNode[];
  pathEdges: KinshipEdge[];
  relationshipTitle: string; // e.g. "Bác ruột", "Ông nội", "Vợ chồng", "Cháu nội"
  explanation: string;
}

export interface ParentChildRel {
  parentId: string;
  childId: string;
  isLineage?: boolean;
}

export interface UnionRel {
  partner1Id: string;
  partner2Id: string;
}

/**
 * Build bidirectional graph from relations
 */
export function findShortestKinshipPath(
  sourceId: string,
  targetId: string,
  persons: KinshipNode[],
  parentChildList: ParentChildRel[],
  unionsList: UnionRel[]
): KinshipPathResult | null {
  const personMap = new Map<string, KinshipNode>(persons.map((p) => [p.id, p]));
  const sourcePerson = personMap.get(sourceId);
  const targetPerson = personMap.get(targetId);

  if (!sourcePerson || !targetPerson) {
    return null;
  }

  if (sourceId === targetId) {
    return {
      found: true,
      sourcePerson,
      targetPerson,
      degree: 0,
      pathNodes: [sourcePerson],
      pathEdges: [],
      relationshipTitle: "Chính bản thân",
      explanation: `${sourcePerson.fullName} là chính mình.`,
    };
  }

  // Build Adjacency List
  const adj = new Map<string, Array<{ toId: string; type: EdgeType }>>();

  persons.forEach((p) => adj.set(p.id, []));

  parentChildList.forEach((pc) => {
    adj.get(pc.parentId)?.push({ toId: pc.childId, type: "PARENT_TO_CHILD" });
    adj.get(pc.childId)?.push({ toId: pc.parentId, type: "CHILD_TO_PARENT" });
  });

  unionsList.forEach((u) => {
    adj.get(u.partner1Id)?.push({ toId: u.partner2Id, type: "SPOUSE" });
    adj.get(u.partner2Id)?.push({ toId: u.partner1Id, type: "SPOUSE" });
  });

  // BFS Queue
  const queue: Array<{ currentId: string; path: Array<{ nodeId: string; edgeType?: EdgeType }> }> = [
    { currentId: sourceId, path: [{ nodeId: sourceId }] },
  ];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const { currentId, path } = queue.shift()!;

    if (currentId === targetId) {
      // Reconstruct path
      const pathNodes: KinshipNode[] = path.map((item) => personMap.get(item.nodeId)!);
      const pathEdges: KinshipEdge[] = [];

      for (let i = 0; i < path.length - 1; i++) {
        const fromNode = pathNodes[i];
        const toNode = pathNodes[i + 1];
        const nextEdgeType = path[i + 1].edgeType!;

        let edgeLabel = "";
        if (nextEdgeType === "PARENT_TO_CHILD") {
          edgeLabel = fromNode.gender === "FEMALE" ? "Mẹ của" : "Cha của";
        } else if (nextEdgeType === "CHILD_TO_PARENT") {
          edgeLabel = fromNode.gender === "FEMALE" ? "Con gái của" : "Con trai của";
        } else if (nextEdgeType === "SPOUSE") {
          edgeLabel = fromNode.gender === "FEMALE" ? "Vợ của" : "Chồng của";
        }

        pathEdges.push({
          fromId: fromNode.id,
          toId: toNode.id,
          type: nextEdgeType,
          label: edgeLabel,
        });
      }

      const { title, explanation } = determineKinshipTitle(sourcePerson, targetPerson, pathNodes, pathEdges);

      return {
        found: true,
        sourcePerson,
        targetPerson,
        degree: pathEdges.length,
        pathNodes,
        pathEdges,
        relationshipTitle: title,
        explanation,
      };
    }

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.toId)) {
        visited.add(neighbor.toId);
        queue.push({
          currentId: neighbor.toId,
          path: [...path, { nodeId: neighbor.toId, edgeType: neighbor.type }],
        });
      }
    }
  }

  return {
    found: false,
    sourcePerson,
    targetPerson,
    degree: 0,
    pathNodes: [],
    pathEdges: [],
    relationshipTitle: "Không tìm thấy quan hệ trực tiếp",
    explanation: `Không tìm thấy đường nối trực hệ hoặc hôn phối giữa ${sourcePerson.fullName} và ${targetPerson.fullName} trên cây gia phả.`,
  };
}

/**
 * Determine Vietnamese relationship title (A so với B)
 */
export function determineKinshipTitle(
  source: KinshipNode,
  target: KinshipNode,
  pathNodes: KinshipNode[],
  pathEdges: KinshipEdge[]
): { title: string; explanation: string } {
  const hops = pathEdges.length;

  if (hops === 1) {
    const edge = pathEdges[0];
    if (edge.type === "PARENT_TO_CHILD") {
      const isMother = source.gender === "FEMALE";
      return {
        title: isMother ? "Mẹ ruột" : "Cha ruột",
        explanation: `${source.fullName} là ${isMother ? "mẹ" : "cha"} ruột của ${target.fullName}.`,
      };
    }
    if (edge.type === "CHILD_TO_PARENT") {
      const isDaughter = source.gender === "FEMALE";
      return {
        title: isDaughter ? "Con gái" : "Con trai",
        explanation: `${source.fullName} là ${isDaughter ? "con gái" : "con trai"} của ${target.fullName}.`,
      };
    }
    if (edge.type === "SPOUSE") {
      const isWife = source.gender === "FEMALE";
      return {
        title: isWife ? "Vợ" : "Chồng",
        explanation: `${source.fullName} là ${isWife ? "vợ" : "chồng"} của ${target.fullName}.`,
      };
    }
  }

  if (hops === 2) {
    const e1 = pathEdges[0].type;
    const e2 = pathEdges[1].type;

    // Sibling: Child -> Parent -> Parent's Child (Source -> Parent -> Target)
    if (e1 === "CHILD_TO_PARENT" && e2 === "PARENT_TO_CHILD") {
      const isSister = source.gender === "FEMALE";
      return {
        title: isSister ? "Chị / Em gái ruột" : "Anh / Em trai ruột",
        explanation: `${source.fullName} và ${target.fullName} là anh chị em ruột (cùng cha/mẹ).`,
      };
    }

    // Grandparent: Parent -> Parent (Source is Grandparent of Target)
    if (e1 === "PARENT_TO_CHILD" && e2 === "PARENT_TO_CHILD") {
      const intermediate = pathNodes[1];
      const isMaternal = intermediate.gender === "FEMALE";
      const isGrandmother = source.gender === "FEMALE";
      const title = isMaternal
        ? isGrandmother
          ? "Bà ngoại"
          : "Ông ngoại"
        : isGrandmother
        ? "Bà nội"
        : "Ông nội";
      return {
        title,
        explanation: `${source.fullName} là ${title} của ${target.fullName}.`,
      };
    }

    // Grandchild: Child -> Child (Source is Grandchild of Target)
    if (e1 === "CHILD_TO_PARENT" && e2 === "CHILD_TO_PARENT") {
      const intermediate = pathNodes[1];
      const isMaternal = intermediate.gender === "FEMALE";
      const isGranddaughter = source.gender === "FEMALE";
      const title = isMaternal
        ? isGranddaughter
          ? "Cháu ngoại gái"
          : "Cháu ngoại trai"
        : isGranddaughter
        ? "Cháu nội gái"
        : "Cháu nội trai";
      return {
        title,
        explanation: `${source.fullName} là ${title} của ${target.fullName}.`,
      };
    }

    // Spouse's Parent: Spouse -> Parent
    if (e1 === "SPOUSE" && e2 === "PARENT_TO_CHILD") {
      return {
        title: source.gender === "FEMALE" ? "Mẹ kế / Mẹ" : "Cha kế / Cha",
        explanation: `${source.fullName} là bạn đời của cha/mẹ ${target.fullName}.`,
      };
    }
  }

  // Uncle / Aunt / Niece / Nephew (3 hops: Source -> Parent -> Grandparent -> Target OR Source -> Parent -> Sibling -> Child)
  if (hops === 3) {
    const e1 = pathEdges[0].type;
    const e2 = pathEdges[1].type;
    const e3 = pathEdges[2].type;

    // Uncle/Aunt: Child -> Parent -> Parent's Child -> Child (Source is Uncle/Aunt of Target)
    if (e1 === "PARENT_TO_CHILD" && e2 === "CHILD_TO_PARENT" && e3 === "PARENT_TO_CHILD") {
      const isFemale = source.gender === "FEMALE";
      return {
        title: isFemale ? "Cô / Dì / Bác gái" : "Chú / Bác trai",
        explanation: `${source.fullName} là anh/chị/em của cha/mẹ ${target.fullName}.`,
      };
    }
  }

  // Generic lineage / connection explanation
  const pathStepTexts = pathEdges.map((e, idx) => {
    const from = pathNodes[idx].fullName;
    const to = pathNodes[idx + 1].fullName;
    return `${from} (${e.label}) -> ${to}`;
  });

  return {
    title: `Quan hệ qua ${hops} bước nối`,
    explanation: `Đường liên kết gia phả: ${pathStepTexts.join(" | ")}`,
  };
}
