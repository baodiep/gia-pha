import { Profile } from "@/types/domain";

export interface BranchGrant {
  id: string;
  user_id: string;
  root_person_id: string;
  granted_by: string;
  granted_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
}

export interface LineageRelation {
  parentId: string;
  childId: string;
  isLineageRelation: boolean;
}

export interface SpouseUnion {
  partner1Id: string;
  partner2Id: string;
}

export class PermissionService {
  /**
   * Tính toán toàn bộ lineage descendants từ một root person ID
   */
  static computeLineageDescendants(
    rootPersonId: string,
    relations: LineageRelation[]
  ): Set<string> {
    const descendants = new Set<string>([rootPersonId]);
    let added = true;

    while (added) {
      added = false;
      for (const r of relations) {
        if (r.isLineageRelation && descendants.has(r.parentId) && !descendants.has(r.childId)) {
          descendants.add(r.childId);
          added = true;
        }
      }
    }

    return descendants;
  }

  /**
   * Tính toán toàn bộ Editable Set = Lineage Descendants (gồm root) + Vợ/Chồng của họ
   */
  static computeEditablePersonIds(
    managedRootPersonIds: string[],
    relations: LineageRelation[],
    unions: SpouseUnion[]
  ): Set<string> {
    const allEditable = new Set<string>();

    for (const rootId of managedRootPersonIds) {
      const lineage = this.computeLineageDescendants(rootId, relations);
      for (const id of lineage) {
        allEditable.add(id);
      }

      // Add spouses/partners of lineage members
      for (const u of unions) {
        if (lineage.has(u.partner1Id)) {
          allEditable.add(u.partner2Id);
        }
        if (lineage.has(u.partner2Id)) {
          allEditable.add(u.partner1Id);
        }
      }
    }

    return allEditable;
  }

  /**
   * Kiểm tra quyền xem thông tin person
   * Mọi user ACTIVE đều có quyền xem (Read-only ngoài nhánh)
   */
  static canViewPerson(profile: Profile | null | undefined): boolean {
    if (!profile || profile.status !== "ACTIVE") {
      return false;
    }
    return true;
  }

  /**
   * Kiểm tra quyền chỉnh sửa thông tin person
   */
  static canEditPerson(
    profile: Profile | null | undefined,
    targetPersonId: string,
    editablePersonIds: Set<string>
  ): boolean {
    if (!profile || profile.status !== "ACTIVE") {
      return false;
    }
    if (profile.is_admin) {
      return true;
    }
    return editablePersonIds.has(targetPersonId);
  }

  /**
   * Kiểm tra quyền thêm con cho một person
   */
  static canAddChild(
    profile: Profile | null | undefined,
    parentPersonId: string,
    editablePersonIds: Set<string>
  ): boolean {
    if (!profile || profile.status !== "ACTIVE") {
      return false;
    }
    if (profile.is_admin) {
      return true;
    }
    return editablePersonIds.has(parentPersonId);
  }

  /**
   * Kiểm tra quyền thêm hôn phối cho một person
   */
  static canAddSpouse(
    profile: Profile | null | undefined,
    personId: string,
    editablePersonIds: Set<string>
  ): boolean {
    if (!profile || profile.status !== "ACTIVE") {
      return false;
    }
    if (profile.is_admin) {
      return true;
    }
    return editablePersonIds.has(personId);
  }

  /**
   * Kiểm tra quyền thay đổi cha/mẹ của branch root hoặc ancestor (Chỉ Admin)
   */
  static canChangeParent(
    profile: Profile | null | undefined
  ): boolean {
    if (!profile || profile.status !== "ACTIVE") {
      return false;
    }
    return profile.is_admin;
  }

  /**
   * Kiểm tra quyền cấp/thu hồi branch grant (Chỉ Admin)
   */
  static canGrantBranch(
    profile: Profile | null | undefined
  ): boolean {
    if (!profile || profile.status !== "ACTIVE") {
      return false;
    }
    return profile.is_admin;
  }
}
