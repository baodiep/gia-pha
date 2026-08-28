import ELK, { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

export type TreePersonNodeData = {
  [key: string]: unknown;
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
  generationNo: number | null;
  branchCode: string | null;
  avatarUrl: string | null;
  isEditable: boolean;
  isSpouse?: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  displayOrder?: number;
  motherName?: string | null;
  motherOrderLabel?: string | null;
  managers?: Array<{
    userId: string;
    loginName: string;
    phone: string;
    fullName?: string;
  }>;
  spouses?: Array<{
    id: string;
    fullName: string;
    gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
    lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
    avatarUrl?: string | null;
    status: string;
    orderIndex?: number;
  }>;
};

export interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  direction?: "DOWN" | "RIGHT";
}

/**
 * Calculates hierarchical tree layout using ELK.js
 */
export async function computeTreeLayout(
  nodes: Array<{ id: string; data: TreePersonNodeData }>,
  edges: Array<{ id: string; source: string; target: string }>,
  options: LayoutOptions = {}
) {
  // Nếu có vợ/chồng đi kèm ngang hàng, tăng chiều rộng của node layout
  const nodeHeight = options.nodeHeight || 135;

  const elkGraph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": options.direction === "RIGHT" ? "RIGHT" : "DOWN",
      "elk.spacing.nodeNode": "60",
      "elk.layered.spacing.nodeNodeBetweenLayers": "90",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.considerModelOrder.strategy": "PREFER_NODES",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.data.spouses && node.data.spouses.length > 0 ? 380 : 200,
      height: nodeHeight,
      layoutOptions: {
        "elk.position": `(${node.data.displayOrder ?? 0}, 0)`,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })) as ElkExtendedEdge[],
  };

  const layoutedGraph = await elk.layout(elkGraph);

  const layoutedNodes = (layoutedGraph.children || []).map((node) => {
    const original = nodes.find((n) => n.id === node.id);
    return {
      id: node.id,
      type: "personNode",
      position: {
        x: node.x || 0,
        y: node.y || 0,
      },
      data: original ? original.data : ({} as TreePersonNodeData),
    };
  });

  return {
    nodes: layoutedNodes,
    edges: edges.map((e) => ({
      ...e,
      type: "smoothstep",
      animated: false,
    })),
  };
}
