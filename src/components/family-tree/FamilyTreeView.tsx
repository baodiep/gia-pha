"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { PersonDetailModal } from "./PersonDetailModal";
import { AddPersonModal } from "./AddPersonModal";
import { HeritageFrameOverlay } from "./HeritageFrameOverlay";
import { AuthModal } from "@/components/auth/AuthModal";
import { computeTreeLayout, TreePersonNodeData } from "@/lib/tree/elk-layout";

import { getTreeGraphData } from "@/features/tree/actions";
import { getAncestorPath } from "@/features/tree/search-actions";
import { getCurrentUser } from "@/features/auth/actions";
import { getSystemSettings, SystemSettings } from "@/features/admin/settings-actions";
import { Profile } from "@/types/domain";
import { Users, Filter, PlusCircle, ChevronsDown, ChevronsUp, RotateCw } from "lucide-react";
import Link from "next/link";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedIsEditable, setSelectedIsEditable] = useState(false);
  const [treeBackgroundUrl, setTreeBackgroundUrl] = useState<string | null>(null);

  // Add person modal state
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addPersonRelative, setAddPersonRelative] = useState<any>(null);
  const [addPersonRelationType, setAddPersonRelationType] = useState<"CHILD" | "SPOUSE" | "PARENT" | "ROOT">("ROOT");
  
  // Lưu trữ full data ban đầu từ server để toggle expand/collapse
  const rawGraphDataRef = useRef<{
    nodes: Array<{ id: string; data: TreePersonNodeData }>;
    edges: Array<{ id: string; source: string; target: string }>;
  }>({ nodes: [], edges: [] });

  // Set các ID person đang bị collapse (ẩn cây con)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);

  // State giữ viewport tự do, chỉ fitView ở lần tải đầu tiên
  const isInitialLoadRef = useRef(true);
  const { setCenter, getNode, getViewport, setViewport, fitView } = useReactFlow();

  // Custom pointer drag để kéo nền canvas mượt mà ngay cả khi bấm giữ trên thẻ thành viên (node)
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; vpX: number; vpY: number; vpZoom: number }>({
    x: 0,
    y: 0,
    vpX: 0,
    vpY: 0,
    vpZoom: 1,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      // Không can thiệp nếu bấm vào các nút điều khiển / input
      if (target.closest("button") || target.closest("input") || target.closest("a")) {
        return;
      }
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;

      const vp = getViewport();
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        vpX: vp.x,
        vpY: vp.y,
        vpZoom: vp.zoom,
      };
    },
    [getViewport]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (!hasMovedRef.current) {
        if (Math.hypot(dx, dy) > 4) {
          hasMovedRef.current = true;
        }
      }

      if (hasMovedRef.current) {
        setViewport(
          {
            x: dragStartRef.current.vpX + dx,
            y: dragStartRef.current.vpY + dy,
            zoom: dragStartRef.current.vpZoom,
          },
          { duration: 0 }
        );
      }
    },
    [setViewport]
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);
  }, []);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(() => {});
    getSystemSettings()
      .then((settings) => {
        if (settings.tree_background_url) {
          setTreeBackgroundUrl(settings.tree_background_url);
        }
      })
      .catch(() => {});
  }, []);

  // Hàm tính toán tập hợp các node và edge hiển thị dựa trên collapsedIds
  const applyCollapseAndLayout = useCallback(
    async (
      allNodes: Array<{ id: string; data: TreePersonNodeData }>,
      allEdges: Array<{ id: string; source: string; target: string }>,
      collapsed: Set<string>,
      anchorPersonId?: string
    ) => {
      // Lưu lại tọa độ của node anchor trước khi relayout (nếu có)
      let anchorPrevPos: { x: number; y: number } | null = null;
      if (anchorPersonId) {
        const prevNode = getNode(anchorPersonId);
        if (prevNode) {
          anchorPrevPos = { x: prevNode.position.x, y: prevNode.position.y };
        }
      }

      const currentViewport = getViewport();

      // Xây dựng bản đồ quan hệ cha -> con
      const childrenMap = new Map<string, string[]>();
      for (const e of allEdges) {
        if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
        childrenMap.get(e.source)!.push(e.target);
      }

      // Tìm tất cả các hậu duệ cần ẩn (DFS / BFS)
      const hiddenNodeIds = new Set<string>();
      const queue: string[] = [];

      collapsed.forEach((collapsedParentId) => {
        const directChildren = childrenMap.get(collapsedParentId) || [];
        directChildren.forEach((childId) => {
          if (!hiddenNodeIds.has(childId)) {
            hiddenNodeIds.add(childId);
            queue.push(childId);
          }
        });
      });

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const descendants = childrenMap.get(currentId) || [];
        for (const descId of descendants) {
          if (!hiddenNodeIds.has(descId)) {
            hiddenNodeIds.add(descId);
            queue.push(descId);
          }
        }
      }

      // Lọc các node không bị ẩn
      const visibleNodes = allNodes
        .filter((n) => !hiddenNodeIds.has(n.id))
        .map((n) => ({
          ...n,
          data: {
            ...n.data,
            isExpanded: !collapsed.has(n.id),
          },
        }));

      const visibleNodeIdSet = new Set(visibleNodes.map((n) => n.id));
      const visibleEdges = allEdges.filter(
        (e) => visibleNodeIdSet.has(e.source) && visibleNodeIdSet.has(e.target)
      );

      const layouted = await computeTreeLayout(visibleNodes, visibleEdges, {
        direction: "DOWN",
      });

      // Gắn callback toggle và click spouse vào data từng node
      const nodesWithHandlers = layouted.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onSpouseClick: (spouseId: string) => {
            if (hasMovedRef.current) return;
            setSelectedPersonId(spouseId);
            setSelectedIsEditable((node.data as any)?.isEditable ?? false);
          },
          onToggleExpand: (personId: string) => {
            setAnchorId(personId);
            setCollapsedIds((prev) => {
              const next = new Set(prev);
              if (next.has(personId)) {
                next.delete(personId);
              } else {
                next.add(personId);
              }
              return next;
            });
          },
        },
      }));

      setNodes(nodesWithHandlers as unknown as Node[]);
      setEdges(layouted.edges as Edge[]);

      // Sau khi layout xong, neo giữ vị trí chính xác của node vừa bấm
      if (anchorPersonId && anchorPrevPos) {
        const newAnchorNode = layouted.nodes.find((n) => n.id === anchorPersonId);
        if (newAnchorNode) {
          const deltaX = (newAnchorNode.position.x - anchorPrevPos.x) * currentViewport.zoom;
          const deltaY = (newAnchorNode.position.y - anchorPrevPos.y) * currentViewport.zoom;
          setViewport(
            {
              x: currentViewport.x - deltaX,
              y: currentViewport.y - deltaY,
              zoom: currentViewport.zoom,
            },
            { duration: 0 }
          );
        }
      } else if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setTimeout(() => {
          fitView({ padding: 0.2, duration: 400 });
        }, 50);
      }
    },
    [getNode, getViewport, setViewport, setNodes, setEdges, fitView]
  );

  const loadTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const cleanRootId =
        initialRootId && initialRootId !== "$undefined" && initialRootId !== "undefined"
          ? initialRootId
          : undefined;
      const data = await getTreeGraphData({
        rootPersonId: cleanRootId,
        myBranchOnly,
      });

      rawGraphDataRef.current = {
        nodes: data.nodes,
        edges: data.edges,
      };
      setManagedRoots(data.userManagedRootIds);

      await applyCollapseAndLayout(data.nodes, data.edges, collapsedIds);
    } catch (err) {
      console.error("Failed to load tree:", err);
    } finally {
      setIsLoading(false);
    }
  }, [initialRootId, myBranchOnly, collapsedIds, applyCollapseAndLayout]);

  useEffect(() => {
    let ignore = false;
    async function fetchTree() {
      setIsLoading(true);
      try {
        const cleanRootId =
          initialRootId && initialRootId !== "$undefined" && initialRootId !== "undefined"
            ? initialRootId
            : undefined;
        const data = await getTreeGraphData({
          rootPersonId: cleanRootId,
          myBranchOnly,
        });

        if (!ignore) {
          rawGraphDataRef.current = {
            nodes: data.nodes,
            edges: data.edges,
          };
          setManagedRoots(data.userManagedRootIds);
          await applyCollapseAndLayout(data.nodes, data.edges, collapsedIds);
        }
      } catch (err: any) {
        if (!ignore) {
          console.error("Failed to load tree:", err);
          if (err?.message === "UNAUTHORIZED" || err?.message?.includes("UNAUTHORIZED")) {
            setShowAuthModal(true);
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchTree();

    return () => {
      ignore = true;
    };
  }, [initialRootId, myBranchOnly, applyCollapseAndLayout]);

  // Cập nhật lại layout khi collapsedIds thay đổi
  useEffect(() => {
    if (rawGraphDataRef.current.nodes.length > 0) {
      applyCollapseAndLayout(
        rawGraphDataRef.current.nodes,
        rawGraphDataRef.current.edges,
        collapsedIds,
        anchorId || undefined
      );
      setAnchorId(null);
    }
  }, [collapsedIds, applyCollapseAndLayout, anchorId]);

  // Đóng toàn bộ các nhánh con (thu gọn về cụ tổ / đời 1)
  const handleCollapseAll = () => {
    const allParents = new Set<string>();
    rawGraphDataRef.current.edges.forEach((e) => {
      allParents.add(e.source);
    });
    setAnchorId(null);
    setCollapsedIds(allParents);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 100);
  };

  // Mở rộng toàn bộ
  const handleExpandAll = () => {
    setAnchorId(null);
    setCollapsedIds(new Set());
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 100);
  };

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (hasMovedRef.current) {
        return;
      }
      const isEditable = (node.data as any)?.isEditable ?? false;
      setSelectedPersonId(node.id);
      setSelectedIsEditable(isEditable);

      if (onSelectPerson) {
        onSelectPerson(node.id);
      }
    },
    [onSelectPerson]
  );

  const handleFocusPerson = useCallback(
    async (personId: string) => {
      try {
        // Đảm bảo node không bị collapse nếu đang tìm kiếm
        const path = await getAncestorPath(personId);
        if (path.ancestorIds.length > 0) {
          setCollapsedIds((prev) => {
            const next = new Set(prev);
            path.ancestorIds.forEach((id) => next.delete(id));
            return next;
          });
        }

        const targetNode = getNode(personId);
        if (targetNode) {
          setCenter(targetNode.position.x + 110, targetNode.position.y + 55, {
            zoom: 1.1,
            duration: 800,
          });
        }
      } catch (err) {
        console.error("Focus error:", err);
      }
    },
    [getNode, setCenter]
  );

  const hasManagedBranches = useMemo(() => managedRoots.length > 0, [managedRoots]);
  const isAnyCollapsed = collapsedIds.size > 0;

  return (
    <div className="relative h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex max-w-[calc(100vw-120px)] sm:max-w-none flex-wrap items-center gap-1.5 rounded-xl bg-white/95 p-1.5 shadow-md backdrop-blur dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMyBranchOnly(false)}
          className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
            !myBranchOnly
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Toàn bộ</span>
        </button>

        {hasManagedBranches && (
          <button
            onClick={() => setMyBranchOnly(true)}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
              myBranchOnly
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Nhánh quản lý</span>
          </button>
        )}

        {/* Nút Thêm Thành Viên Mới */}
        {currentUser && (
          <button
            onClick={() => {
              setAddPersonRelative(null);
              setAddPersonRelationType("ROOT");
              setShowAddPersonModal(true);
            }}
            title="Thêm thành viên mới vào gia phả"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm người</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Nút Đóng / Mở toàn bộ */}
        {isAnyCollapsed ? (
          <button
            onClick={handleExpandAll}
            title="Mở rộng toàn bộ các nhánh"
            className="flex items-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <ChevronsDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mở toàn bộ</span>
          </button>
        ) : (
          <button
            onClick={handleCollapseAll}
            title="Thu gọn tất cả các nhánh con"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            <ChevronsUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Đóng toàn bộ</span>
          </button>
        )}

        <button
          onClick={loadTree}
          title="Tải lại cây gia phả"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Top Right Search Bar */}
      <div className="absolute top-3 right-3 z-10">
        <TreeSearchOverlay onFocusPerson={handleFocusPerson} />
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-sm font-medium text-slate-500">Đang tải sơ đồ cây gia phả...</div>
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-4">
          {currentUser ? (
            <>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Chưa có dữ liệu thành viên trong cây gia phả.
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Hãy nạp dữ liệu mẫu hoặc vào trang Quản trị để bắt đầu thêm Cụ Tổ và các chi nhánh.
              </p>
              {currentUser.is_admin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 mt-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Vào trang Quản trị</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Bạn cần đăng nhập tài khoản để xem dữ liệu cây gia phả dòng họ.
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Đăng nhập / Đăng ký
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className="h-full w-full select-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={[0, 1, 2]}
            selectionOnDrag={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            minZoom={0.1}
            maxZoom={2.5}
            className="relative h-full w-full"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      )}

      {/* 9-Slice Heritage Frame Overlay bao quanh màn hình cây gia phả */}
      <HeritageFrameOverlay
        watermarkUrl={treeBackgroundUrl}
        showCenterWatermark={true}
      />

      {/* Auth Modal when unauthorized */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          loadTree();
        }}
      />

      {/* Person Detail & Edit Modal when clicking on any tree node */}
      <PersonDetailModal
        personId={selectedPersonId}
        isEditable={selectedIsEditable}
        onClose={() => setSelectedPersonId(null)}
        onSuccess={() => {
          loadTree();
        }}
        onAddRelative={(person, relType) => {
          setAddPersonRelative(person);
          setAddPersonRelationType(relType);
          setShowAddPersonModal(true);
        }}
      />

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={showAddPersonModal}
        relatedPerson={addPersonRelative}
        relationType={addPersonRelationType}
        onClose={() => setShowAddPersonModal(false)}
        onSuccess={() => {
          setShowAddPersonModal(false);
          loadTree();
        }}
      />
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

