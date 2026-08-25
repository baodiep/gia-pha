"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PersonNode } from "./PersonNode";
import { TreeSearchOverlay } from "./TreeSearchOverlay";
import { computeTreeLayout, TreePersonNodeData } from "@/lib/tree/elk-layout";
import { getTreeGraphData } from "@/features/tree/actions";
import { getAncestorPath } from "@/features/tree/search-actions";
import { Users, Filter } from "lucide-react";

const nodeTypes = {
  personNode: PersonNode,
};

interface FamilyTreeViewProps {
  initialRootId?: string;
  onSelectPerson?: (personId: string) => void;
}

function FamilyTreeContent({ initialRootId, onSelectPerson }: FamilyTreeViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myBranchOnly, setMyBranchOnly] = useState(false);
  const [managedRoots, setManagedRoots] = useState<string[]>([]);
  const { setCenter, getNode } = useReactFlow();

  const loadTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTreeGraphData({
        rootPersonId: initialRootId,
        myBranchOnly,
      });

      setManagedRoots(data.userManagedRootIds);

      const layouted = await computeTreeLayout(data.nodes, data.edges, {
        direction: "DOWN",
      });

      setNodes(layouted.nodes as unknown as Node[]);
      setEdges(layouted.edges as Edge[]);
    } catch (err) {
      console.error("Failed to load tree:", err);
    } finally {
      setIsLoading(false);
    }
  }, [initialRootId, myBranchOnly, setNodes, setEdges]);

  useEffect(() => {
    let ignore = false;
    async function fetchTree() {
      setIsLoading(true);
      try {
        const data = await getTreeGraphData({
          rootPersonId: initialRootId,
          myBranchOnly,
        });

        if (!ignore) {
          setManagedRoots(data.userManagedRootIds);
          const layouted = await computeTreeLayout(data.nodes, data.edges, {
            direction: "DOWN",
          });
          setNodes(layouted.nodes as unknown as Node[]);
          setEdges(layouted.edges as Edge[]);
        }
      } catch (err) {
        if (!ignore) console.error("Failed to load tree:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchTree();

    return () => {
      ignore = true;
    };
  }, [initialRootId, myBranchOnly, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onSelectPerson) {
        onSelectPerson(node.id);
      }
    },
    [onSelectPerson]
  );

  const handleFocusPerson = useCallback(
    async (personId: string) => {
      try {
        const targetNode = getNode(personId);
        if (targetNode) {
          setCenter(targetNode.position.x + 110, targetNode.position.y + 55, {
            zoom: 1.1,
            duration: 800,
          });
        } else {
          // If node not in current loaded view, fetch ancestor path and reload tree with focused branch
          const path = await getAncestorPath(personId);
          if (path.ancestorIds.length > 0) {
            const rootId = path.ancestorIds[path.ancestorIds.length - 1];
            const data = await getTreeGraphData({ rootPersonId: rootId });
            const layouted = await computeTreeLayout(data.nodes, data.edges, { direction: "DOWN" });
            setNodes(layouted.nodes as unknown as Node[]);
            setEdges(layouted.edges as Edge[]);
            setTimeout(() => {
              const loadedNode = layouted.nodes.find((n) => n.id === personId);
              if (loadedNode) {
                setCenter(loadedNode.position.x + 110, loadedNode.position.y + 55, {
                  zoom: 1.1,
                  duration: 800,
                });
              }
            }, 100);
          }
        }
      } catch (err) {
        console.error("Focus error:", err);
      }
    },
    [getNode, setCenter, setNodes, setEdges]
  );

  const hasManagedBranches = useMemo(() => managedRoots.length > 0, [managedRoots]);

  return (
    <div className="relative h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 p-1.5 shadow-md backdrop-blur dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMyBranchOnly(false)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            !myBranchOnly
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Toàn bộ gia phả
        </button>

        {hasManagedBranches && (
          <button
            onClick={() => setMyBranchOnly(true)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              myBranchOnly
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="h-3.5 w-3.5" /> Nhánh tôi quản lý
          </button>
        )}

        <button
          onClick={loadTree}
          className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Làm mới
        </button>
      </div>

      {/* Top Right Search Bar */}
      <div className="absolute top-4 right-4 z-10">
        <TreeSearchOverlay onFocusPerson={handleFocusPerson} />
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-sm font-medium text-slate-500">Đang tải sơ đồ cây gia phả...</div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
        </ReactFlow>
      )}
    </div>
  );
}

export function FamilyTreeView(props: FamilyTreeViewProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeContent {...props} />
    </ReactFlowProvider>
  );
}
