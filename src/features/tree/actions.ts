"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/features/auth/actions";
import { getEditablePersonIds, getManagedBranches } from "@/features/permissions/actions";
import { TreePersonNodeData } from "@/lib/tree/elk-layout";
import { Profile } from "@/types/domain";

export interface TreeDataResponse {
  nodes: Array<{ id: string; data: TreePersonNodeData }>;
  edges: Array<{ id: string; source: string; target: string }>;
  userManagedRootIds: string[];
}

/**
 * Server action to fetch family tree data for visualization
 * Supports lazy branch loading or focusing on a root person ID
 */
export async function getTreeGraphData(options?: {
  rootPersonId?: string;
  myBranchOnly?: boolean;
}): Promise<TreeDataResponse> {
  const supabase = await createClient();

  // Try fetching current session without throwing 500 when unauthenticated or uninitialized
  let profile: Profile | null = null;
  let userId: string | null = null;

  try {
    const userAuth = await requireActiveUser();
    profile = userAuth.profile;
    userId = userAuth.userId;
  } catch {
    // Unauthenticated guest user: return empty tree
    return {
      nodes: [],
      edges: [],
      userManagedRootIds: [],
    };
  }

  const managedBranches = userId ? await getManagedBranches(userId) : [];
  const editableSet = userId ? await getEditablePersonIds(userId, profile?.is_admin || false) : new Set<string>();

  // Determine starting root persons
  let targetRootId = options?.rootPersonId;
  if (targetRootId === "$undefined" || targetRootId === "undefined" || !targetRootId) {
    targetRootId = undefined;
  }

  if (options?.myBranchOnly && managedBranches.length > 0) {
    targetRootId = managedBranches[0];
  }

  // Fetch persons (active only)
  let personsQuery = supabase
    .from("persons")
    .select("*")
    .is("deleted_at", null);

  if (targetRootId) {
    // Fetch only descendants of this root
    const { data: descendantIds } = await supabase.rpc("get_branch_editable_persons", {
      p_root_person_id: targetRootId,
    });
    const ids = (descendantIds || []).map((d: { person_id: string }) => d.person_id);
    if (ids.length > 0) {
      personsQuery = personsQuery.in("id", ids);
    }
  }

  const [{ data: persons }, { data: relations }, { data: unions }, { data: branchGrants }] = await Promise.all([
    personsQuery,
    supabase.from("parent_child").select("*").eq("is_lineage_relation", true),
    supabase.from("unions").select("*, partner1:partner1_id(id, full_name, gender, life_status, avatar_url), partner2:partner2_id(id, full_name, gender, life_status, avatar_url)"),
    supabase.from("branch_grants").select("root_person_id, user_id, user_profile:user_id(id, login_name, phone_normalized, person:person_id(full_name))").is("revoked_at", null),
  ]);

  const personsList = persons || [];
  const relationsList = relations || [];
  const unionsList = unions || [];
  const branchGrantsList = branchGrants || [];

  // Map managers by root_person_id
  const managerMap = new Map<string, Array<{ userId: string; loginName: string; phone: string; fullName?: string }>>();
  for (const bg of branchGrantsList) {
    if (bg.root_person_id && bg.user_profile) {
      const up = bg.user_profile as any;
      if (!managerMap.has(bg.root_person_id)) {
        managerMap.set(bg.root_person_id, []);
      }
      managerMap.get(bg.root_person_id)!.push({
        userId: up.id,
        loginName: up.login_name,
        phone: up.phone_normalized,
        fullName: up.person?.full_name || undefined,
      });
    }
  }

  // Map unions by partner ID
  const spouseMap = new Map<string, Array<{ id: string; fullName: string; gender?: any; lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN"; avatarUrl?: string | null; status: string }>>();
  const spouseIdSet = new Set<string>();

  for (const u of unionsList) {
    // Partner 1's spouse is Partner 2
    if (u.partner2) {
      if (!spouseMap.has(u.partner1_id)) spouseMap.set(u.partner1_id, []);
      spouseMap.get(u.partner1_id)!.push({
        id: u.partner2.id,
        fullName: u.partner2.full_name,
        gender: u.partner2.gender,
        lifeStatus: u.partner2.life_status,
        avatarUrl: u.partner2.avatar_url,
        status: u.status,
      });
    }
    // Partner 2's spouse is Partner 1
    if (u.partner1) {
      if (!spouseMap.has(u.partner2_id)) spouseMap.set(u.partner2_id, []);
      spouseMap.get(u.partner2_id)!.push({
        id: u.partner1.id,
        fullName: u.partner1.full_name,
        gender: u.partner1.gender,
        lifeStatus: u.partner1.life_status,
        avatarUrl: u.partner1.avatar_url,
        status: u.status,
      });
    }
  }

  // Xác định người thuộc trực hệ (lineage): là con trong quan hệ is_lineage_relation hoặc là cụ đời 1
  const lineageChildIdSet = new Set(relationsList.map((r) => r.child_id));
  const lineageParentIdSet = new Set(relationsList.map((r) => r.parent_id));

  // Tập hợp những người là dâu/rể (kết hôn với người trực hệ nhưng không phải là con trực hệ của đời trước)
  const isSpouseOfLineage = (personId: string, generationNo: number | null) => {
    // Nếu là đời 1 (Cụ bà) hoặc đời sau mà không có parent_child lineage thì là Dâu/Rể
    if (lineageChildIdSet.has(personId)) return false;
    // Nếu là partner2 trong unions thì thường là dâu/rể
    for (const u of unionsList) {
      if (u.partner2_id === personId && (lineageChildIdSet.has(u.partner1_id) || lineageParentIdSet.has(u.partner1_id))) {
        return true;
      }
    }
    return false;
  };

  // Check which persons have children
  const parentWithChildrenSet = new Set(relationsList.map((r) => r.parent_id));

  // Lọc chỉ lấy những người là Trực hệ làm Nút chính của cây (người phối ngẫu sẽ được gắn ngang hàng bên cạnh nút chính)
  const mainLineagePersons = personsList.filter((p) => !isSpouseOfLineage(p.id, p.generation_no));

  // Build nodes
  const nodes = mainLineagePersons.map((p) => {
    const isEditable = profile.is_admin || editableSet.has(p.id) || editableSet.has("*");
    return {
      id: p.id,
      data: {
        id: p.id,
        fullName: p.full_name,
        gender: p.gender,
        lifeStatus: p.life_status,
        generationNo: p.generation_no,
        branchCode: p.branch_code,
        avatarUrl: p.avatar_url,
        isEditable,
        isSpouse: false,
        hasChildren: parentWithChildrenSet.has(p.id),
        isExpanded: true,
        managers: managerMap.get(p.id) || [],
        spouses: spouseMap.get(p.id) || [],
      },
    };
  });

  // Filter edges to only include nodes present in the current view
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = relationsList
    .filter((r) => nodeIds.has(r.parent_id) && nodeIds.has(r.child_id))
    .map((r) => ({
      id: `e-${r.parent_id}-${r.child_id}`,
      source: r.parent_id,
      target: r.child_id,
    }));

  return {
    nodes,
    edges,
    userManagedRootIds: managedBranches,
  };
}
