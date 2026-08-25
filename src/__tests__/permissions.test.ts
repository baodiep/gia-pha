import { describe, it, expect } from "vitest";
import { PermissionService, LineageRelation, SpouseUnion } from "@/lib/permissions/permission-service";
import { Profile } from "@/types/domain";

describe("PermissionService & Branch Grants logic", () => {
  // Tree Structure:
  // Root: Cụ Tổ (P001) + Cụ Bà (P002)
  //   -> Chi 1 (P003) + Vợ Chi 1 (P004)
  //        -> Cháu 1.1 (P007)
  //        -> Cháu 1.2 (P008)
  //   -> Chi 2 (P005) + Vợ Chi 2 (P006)
  //        -> Cháu 2.1 (P009)

  const relations: LineageRelation[] = [
    { parentId: "P001", childId: "P003", isLineageRelation: true },
    { parentId: "P002", childId: "P003", isLineageRelation: false },
    { parentId: "P001", childId: "P005", isLineageRelation: true },
    { parentId: "P002", childId: "P005", isLineageRelation: false },
    { parentId: "P003", childId: "P007", isLineageRelation: true },
    { parentId: "P004", childId: "P007", isLineageRelation: false },
    { parentId: "P003", childId: "P008", isLineageRelation: true },
    { parentId: "P004", childId: "P008", isLineageRelation: false },
    { parentId: "P005", childId: "P009", isLineageRelation: true },
    { parentId: "P006", childId: "P009", isLineageRelation: false },
  ];

  const unions: SpouseUnion[] = [
    { partner1Id: "P001", partner2Id: "P002" },
    { partner1Id: "P003", partner2Id: "P004" },
    { partner1Id: "P005", partner2Id: "P006" },
  ];

  const activeAdminProfile: Profile = {
    id: "admin-1",
    phone_normalized: "0900000001",
    login_name: "0900000001@",
    person_id: null,
    status: "ACTIVE",
    is_admin: true,
    must_change_password: false,
    activated_at: "2026-08-25T00:00:00Z",
    activated_by: null,
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
  };

  const activeMemberProfile: Profile = {
    id: "member-chi1",
    phone_normalized: "0900000002",
    login_name: "0900000002@",
    person_id: "P003",
    status: "ACTIVE",
    is_admin: false,
    must_change_password: false,
    activated_at: "2026-08-25T00:00:00Z",
    activated_by: "admin-1",
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
  };

  const pendingProfile: Profile = {
    ...activeMemberProfile,
    id: "pending-user",
    status: "PENDING",
  };

  // User granted branch Chi 1 (P003)
  const editableChi1 = PermissionService.computeEditablePersonIds(["P003"], relations, unions);

  it("calculates editable set for Chi 1 (Root, Children, Grandchildren, Spouses)", () => {
    // Should include: P003 (root), P007 (child), P008 (child), P004 (spouse of P003)
    expect(Array.from(editableChi1).sort()).toEqual(["P003", "P004", "P007", "P008"].sort());
  });

  it("allows Chi 1 manager to edit root, child, grandchild, and spouse in Chi 1", () => {
    expect(PermissionService.canEditPerson(activeMemberProfile, "P003", editableChi1)).toBe(true);
    expect(PermissionService.canEditPerson(activeMemberProfile, "P004", editableChi1)).toBe(true); // Spouse
    expect(PermissionService.canEditPerson(activeMemberProfile, "P007", editableChi1)).toBe(true); // Child
    expect(PermissionService.canEditPerson(activeMemberProfile, "P008", editableChi1)).toBe(true); // Child
  });

  it("DENIES Chi 1 manager from editing Sibling branch (Chi 2) and Ancestors (Cụ Tổ)", () => {
    // Sibling branch (Chi 2)
    expect(PermissionService.canEditPerson(activeMemberProfile, "P005", editableChi1)).toBe(false);
    expect(PermissionService.canEditPerson(activeMemberProfile, "P006", editableChi1)).toBe(false);
    expect(PermissionService.canEditPerson(activeMemberProfile, "P009", editableChi1)).toBe(false);

    // Ancestor (Cụ Tổ P001, Cụ Bà P002)
    expect(PermissionService.canEditPerson(activeMemberProfile, "P001", editableChi1)).toBe(false);
    expect(PermissionService.canEditPerson(activeMemberProfile, "P002", editableChi1)).toBe(false);
  });

  it("allows active member to VIEW any person outside their branch (Read-only ngoài nhánh)", () => {
    expect(PermissionService.canViewPerson(activeMemberProfile)).toBe(true);
  });

  it("allows Admin full access to edit, change parents, and grant branch", () => {
    expect(PermissionService.canEditPerson(activeAdminProfile, "P001", editableChi1)).toBe(true);
    expect(PermissionService.canEditPerson(activeAdminProfile, "P005", editableChi1)).toBe(true);
    expect(PermissionService.canChangeParent(activeAdminProfile)).toBe(true);
    expect(PermissionService.canGrantBranch(activeAdminProfile)).toBe(true);
  });

  it("DENIES regular members from changing parents or granting branch", () => {
    expect(PermissionService.canChangeParent(activeMemberProfile)).toBe(false);
    expect(PermissionService.canGrantBranch(activeMemberProfile)).toBe(false);
  });

  it("DENIES all actions for PENDING or SUSPENDED users", () => {
    expect(PermissionService.canViewPerson(pendingProfile)).toBe(false);
    expect(PermissionService.canEditPerson(pendingProfile, "P003", editableChi1)).toBe(false);
    expect(PermissionService.canAddChild(pendingProfile, "P003", editableChi1)).toBe(false);
    expect(PermissionService.canAddSpouse(pendingProfile, "P003", editableChi1)).toBe(false);
    expect(PermissionService.canChangeParent(pendingProfile)).toBe(false);
    expect(PermissionService.canGrantBranch(pendingProfile)).toBe(false);
  });
});
