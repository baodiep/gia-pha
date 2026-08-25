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
  hasChildren: boolean;
  isExpanded: boolean;
  managers?: Array<{
    userId: string;
    loginName: string;
    phone: string;
    fullName?: string;
  }>;
  spouses?: Array<{
    id: string;
    fullName: string;
    lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
    status: string;
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
  const nodeWidth = options.nodeWidth || 220;
  const nodeHeight = options.nodeHeight || 110;

  const elkGraph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": options.direction === "RIGHT" ? "RIGHT" : "DOWN",
      "elk.spacing.nodeNode": "40",
      "elk.layered.spacing.nodeNodeBetweenLayers": "60",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: nodeWidth,
      height: nodeHeight,
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
