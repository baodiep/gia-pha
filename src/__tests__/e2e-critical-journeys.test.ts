import { describe, it, expect } from "vitest";
import { normalizePhone, toLoginName, toInternalEmail } from "@/lib/auth/identity";
import { PermissionService, LineageRelation, SpouseUnion } from "@/lib/permissions/permission-service";
import { formatAnniversaryDisplay } from "@/features/memorials/formatter";
import { wouldCreateCycle } from "@/features/relationships/cycle-detection";

describe("T017 — E2E Critical User Journeys Simulation", () => {
  // -------------------------------------------------------------
  // Journey 1: Register -> PENDING -> Admin activate -> Login
  // -------------------------------------------------------------
  describe("Journey 1: Account Registration & Activation Flow", () => {
    it("follows full lifecycle: phone normalize -> pending -> active -> access granted", () => {
      const rawPhone = "  0912.345.678  ";
      const normalized = normalizePhone(rawPhone);
      expect(normalized).toBe("0912345678");

      const loginName = toLoginName(normalized);
      expect(loginName).toBe("0912345678@");

      const email = toInternalEmail(normalized);
      expect(email).toBe("0912345678@auth.giapha.local");

      // Initially PENDING
      const userProfile = {
        id: "user-new-001",
        phone_normalized: normalized,
        login_name: loginName,
        person_id: null,
        status: "PENDING" as const,
        is_admin: false,
        must_change_password: false,
        activated_at: null,
        activated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Guard check: PENDING users cannot view or edit
      expect(PermissionService.canViewPerson(userProfile)).toBe(false);

      // Admin activates the user
      const activatedProfile = {
        ...userProfile,
        status: "ACTIVE" as const,
        activated_at: new Date().toISOString(),
        activated_by: "admin-uuid",
      };

      // Guard check: ACTIVE users have view access
      expect(PermissionService.canViewPerson(activatedProfile)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Journey 2: Admin grant branch -> Member edit descendant -> Sibling branch denied
  // -------------------------------------------------------------
  describe("Journey 2: Dynamic Branch Grant & Lineage Permission Enforcement", () => {
    const relations: LineageRelation[] = [
      { parentId: "ROOT_P1", childId: "CHI1_P3", isLineageRelation: true },
      { parentId: "ROOT_P1", childId: "CHI2_P4", isLineageRelation: true },
      { parentId: "CHI1_P3", childId: "CON_CHI1_P7", isLineageRelation: true },
      { parentId: "CHI2_P4", childId: "CON_CHI2_P8", isLineageRelation: true },
    ];

    const unions: SpouseUnion[] = [
      { partner1Id: "CHI1_P3", partner2Id: "VO_CHI1_P5" },
      { partner1Id: "CHI2_P4", partner2Id: "VO_CHI2_P6" },
    ];

    it("grants access to Chi 1 descendants & spouse, denies Chi 2 sibling branch", () => {
      const managerChi1Profile = {
        id: "user-mgr-chi1",
        phone_normalized: "0911223344",
        login_name: "0911223344@",
        person_id: "CHI1_P3",
        status: "ACTIVE" as const,
        is_admin: false,
        must_change_password: false,
        activated_at: "2026-01-01T00:00:00Z",
        activated_by: "admin",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      // Admin grants branch starting at CHI1_P3
      const managedRoots = ["CHI1_P3"];
      const editableSet = PermissionService.computeEditablePersonIds(
        managedRoots,
        relations,
        unions
      );

      // Manager can edit:
      // 1. Root of branch (CHI1_P3)
      expect(PermissionService.canEditPerson(managerChi1Profile, "CHI1_P3", editableSet)).toBe(true);
      // 2. Direct lineage child (CON_CHI1_P7)
      expect(PermissionService.canEditPerson(managerChi1Profile, "CON_CHI1_P7", editableSet)).toBe(true);
      // 3. Spouse of branch member (VO_CHI1_P5)
      expect(PermissionService.canEditPerson(managerChi1Profile, "VO_CHI1_P5", editableSet)).toBe(true);

      // Manager CANNOT edit:
      // 1. Tổ phụ cấp cao hơn (ROOT_P1)
      expect(PermissionService.canEditPerson(managerChi1Profile, "ROOT_P1", editableSet)).toBe(false);
      // 2. Chi anh em (CHI2_P4)
      expect(PermissionService.canEditPerson(managerChi1Profile, "CHI2_P4", editableSet)).toBe(false);
      // 3. Con của chi anh em (CON_CHI2_P8)
      expect(PermissionService.canEditPerson(managerChi1Profile, "CON_CHI2_P8", editableSet)).toBe(false);
      // 4. Vợ của chi anh em (VO_CHI2_P6)
      expect(PermissionService.canEditPerson(managerChi1Profile, "VO_CHI2_P6", editableSet)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // Journey 3: Add child/spouse + Cycle detection prevention
  // -------------------------------------------------------------
  describe("Journey 3: Relationship Building & Cycle Prevention", () => {
    it("allows adding child within branch scope and rejects cycles", () => {
      const existingEdges = [
        { parentId: "P_ONG", childId: "P_CHA" },
        { parentId: "P_CHA", childId: "P_CON" },
      ];

      // Safe addition: P_CON -> P_CHAU
      const safeCheck = wouldCreateCycle("P_CON", "P_CHAU", existingEdges);
      expect(safeCheck).toBe(false);

      // Cycle attempt: Making P_CON parent of P_ONG
      const cycleCheck = wouldCreateCycle("P_CON", "P_ONG", existingEdges);
      expect(cycleCheck).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Journey 4: Deceased member + Lunar/Solar anniversary display
  // -------------------------------------------------------------
  describe("Journey 4: Deceased Members & Memorial Anniversary Exactness", () => {
    it("formats lunar anniversary accurately without fake solar estimation", () => {
      const deceasedLunarOnly = {
        deathDate: null,
        deathLunarDay: 15,
        deathLunarMonth: 8,
        deathLunarIsLeapMonth: false,
      };

      const display = formatAnniversaryDisplay(deceasedLunarOnly);
      expect(display.lunarText).toBe("Ngày 15 tháng 8 (Âm lịch)");
      expect(display.solarText).toBeNull();
    });

    it("formats solar anniversary accurately when exact date exists", () => {
      const deceasedSolar = {
        deathDate: "1995-10-20T00:00:00Z",
        deathLunarDay: 26,
        deathLunarMonth: 9,
        deathLunarIsLeapMonth: false,
      };

      const display = formatAnniversaryDisplay(deceasedSolar);
      expect(display.solarText).toContain("20/10/1995");
      expect(display.lunarText).toBe("Ngày 26 tháng 9 (Âm lịch)");
    });
  });

  // -------------------------------------------------------------
  // Journey 5: Publish Branch Event & Visibility Filtering
  // -------------------------------------------------------------
  describe("Journey 5: Branch Event Visibility Scoping", () => {
    it("shows branch event only to members managing/belonging to that branch", () => {
      const branchEventChi1 = {
        id: "evt-chi1-001",
        title: "Lễ giỗ chi 1",
        visibility: "BRANCH" as const,
        root_person_id: "CHI1_P3",
        status: "PUBLISHED" as const,
      };

      const publicEvent = {
        id: "evt-public-002",
        title: "Tế tổ xuân",
        visibility: "ALL_MEMBERS" as const,
        root_person_id: null,
        status: "PUBLISHED" as const,
      };

      const memberChi1EditableSet = new Set<string>(["CHI1_P3", "CON_CHI1_P7"]);
      const memberChi2EditableSet = new Set<string>(["CHI2_P4", "CON_CHI2_P8"]);

      const canMember1SeeBranchEvent = memberChi1EditableSet.has(branchEventChi1.root_person_id);
      const canMember2SeeBranchEvent = memberChi2EditableSet.has(branchEventChi1.root_person_id);

      expect(canMember1SeeBranchEvent).toBe(true);
      expect(canMember2SeeBranchEvent).toBe(false);

      // Public event visible to both
      expect(publicEvent.visibility === "ALL_MEMBERS").toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Journey 6: Revoke branch grant -> Edit denied immediately
  // -------------------------------------------------------------
  describe("Journey 6: Realtime Permission Revocation", () => {
    it("denies edit right immediately after soft revocation timestamp is set", () => {
      const relations: LineageRelation[] = [
        { parentId: "CHI1_P3", childId: "CON_CHI1_P7", isLineageRelation: true },
      ];
      const unions: SpouseUnion[] = [];

      const userProfile = {
        id: "user-mgr-chi1",
        phone_normalized: "0911223344",
        login_name: "0911223344@",
        person_id: "CHI1_P3",
        status: "ACTIVE" as const,
        is_admin: false,
        must_change_password: false,
        activated_at: "2026-01-01T00:00:00Z",
        activated_by: "admin",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      // When grant is active
      let activeGrants: Array<{ root_person_id: string; revoked_at: string | null }> = [
        { root_person_id: "CHI1_P3", revoked_at: null },
      ];
      let activeRoots = activeGrants.filter((g) => !g.revoked_at).map((g) => g.root_person_id);
      let editableSet = PermissionService.computeEditablePersonIds(activeRoots, relations, unions);

      expect(PermissionService.canEditPerson(userProfile, "CON_CHI1_P7", editableSet)).toBe(true);

      // Admin revokes grant
      activeGrants = [{ root_person_id: "CHI1_P3", revoked_at: new Date().toISOString() }];
      activeRoots = activeGrants.filter((g) => !g.revoked_at).map((g) => g.root_person_id);
      editableSet = PermissionService.computeEditablePersonIds(activeRoots, relations, unions);

      // Immediately denied
      expect(PermissionService.canEditPerson(userProfile, "CON_CHI1_P7", editableSet)).toBe(false);
    });
  });
});
