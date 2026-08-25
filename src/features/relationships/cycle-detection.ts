/**
 * Cycle detection for parent-child tree hierarchy
 */

export interface RelationEdge {
  parentId: string;
  childId: string;
}

/**
 * Checks if adding an edge (parentId -> childId) creates a directed cycle.
 * A cycle occurs if childId is already an ancestor of parentId (i.e. parentId is reachable from childId).
 */
export function wouldCreateCycle(
  newParentId: string,
  newChildId: string,
  existingEdges: RelationEdge[]
): boolean {
  if (newParentId === newChildId) {
    return true;
  }

  // Build adjacency list: node -> array of children
  const adj = new Map<string, string[]>();
  for (const edge of existingEdges) {
    if (!adj.has(edge.parentId)) {
      adj.set(edge.parentId, []);
    }
    adj.get(edge.parentId)!.push(edge.childId);
  }

  // Check if we can reach newParentId starting from newChildId (DFS/BFS)
  const visited = new Set<string>();
  const queue = [newChildId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === newParentId) {
      return true; // Cycle detected
    }

    if (!visited.has(current)) {
      visited.add(current);
      const children = adj.get(current) || [];
      for (const child of children) {
        if (!visited.has(child)) {
          queue.push(child);
        }
      }
    }
  }

  return false;
}
