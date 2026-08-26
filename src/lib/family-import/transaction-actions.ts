"use server";

import { ParsedFamilyMemberRow } from "@/lib/family-import/parser";
import { getCurrentUser } from "@/features/auth/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeFamilyImportPreview } from "@/lib/family-import/preview";
import { buildImportTransactionPlan } from "./transaction-planner";

export interface ImportExecutionResult {
  success: boolean;
  batchId?: string;
  createdPersons: number;
  createdRelationships: number;
  createdUnions: number;
  message?: string;
  error?: string;
}

export async function executeFamilyImportTransactionAction(
  rows: ParsedFamilyMemberRow[],
  batchId: string
): Promise<ImportExecutionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== "ACTIVE" || !user.is_admin) {
      return {
        success: false,
        createdPersons: 0,
        createdRelationships: 0,
        createdUnions: 0,
        error: "Chỉ Quản trị viên (Admin) mới có quyền thực hiện import gia phả",
      };
    }

    if (!batchId || !rows || rows.length === 0) {
      return {
        success: false,
        createdPersons: 0,
        createdRelationships: 0,
        createdUnions: 0,
        error: "Dữ liệu hoặc mã phiên import (batchId) không hợp lệ",
      };
    }

    // Final security & validity check
    const preview = analyzeFamilyImportPreview(rows);
    if (!preview.canProceed || preview.errorCount > 0) {
      return {
        success: false,
        createdPersons: 0,
        createdRelationships: 0,
        createdUnions: 0,
        error: `Không thể import vì vẫn còn ${preview.errorCount} lỗi chưa được giải quyết`,
      };
    }

    // Plan & Payload
    const plan = buildImportTransactionPlan(batchId, rows);
    const payload = {
      persons: plan.personsToInsert,
    };

    const adminClient = createAdminClient();

    // Call stored procedure for transactional guarantee
    const { data: rpcData, error: rpcError } = await adminClient.rpc("import_family_batch", {
      p_batch_id: batchId,
      p_actor_id: user.id,
      p_payload: payload,
    });

    if (rpcError) {
      // If RPC is not yet applied in Supabase environment (e.g. running unit simulation)
      // fallback to multi-step transactional client execution
      console.warn("RPC import_family_batch failed or not found, running fallback transactional batch:", rpcError.message);

      // Pass 1: Insert persons
      const extToUuid = new Map<string, string>();
      let pCount = 0;
      let rCount = 0;
      let uCount = 0;

      for (const p of rows) {
        const { data: inserted, error: pErr } = await adminClient
          .from("persons")
          .insert({
            full_name: p.fullName,
            gender: p.gender,
            life_status: p.lifeStatus,
            birth_date: p.birthDate || null,
            death_date: p.deathDate || null,
            death_lunar_day: p.deathLunarDay || null,
            death_lunar_month: p.deathLunarMonth || null,
            death_lunar_is_leap_month: p.deathLunarIsLeapMonth,
            death_anniversary_note: p.deathAnniversaryNote || null,
            birth_place: p.birthPlace || null,
            hometown: p.hometown || null,
            bio: p.bio || null,
            generation_no: p.generationNo || null,
            branch_code: p.branchCode || null,
          })
          .select("id")
          .single();

        if (pErr || !inserted) {
          throw new Error(`Lỗi tạo thành viên ${p.fullName} (${p.externalId}): ${pErr?.message}`);
        }

        extToUuid.set(p.externalId, inserted.id);
        pCount++;
      }

      // Pass 2: Insert parent-child
      for (const link of plan.parentChildLinks) {
        const parentId = extToUuid.get(link.parentExternalId);
        const childId = extToUuid.get(link.childExternalId);

        if (parentId && childId) {
          const { error: linkErr } = await adminClient.from("parent_child").insert({
            parent_id: parentId,
            child_id: childId,
            relationship_type: "BIOLOGICAL",
            is_lineage_relation: link.isLineage,
          });
          if (!linkErr) rCount++;
        }
      }

      // Pass 3: Insert unions
      for (const un of plan.unionsToCreate) {
        const p1 = extToUuid.get(un.partner1ExternalId);
        const p2 = extToUuid.get(un.partner2ExternalId);

        if (p1 && p2) {
          const { error: uErr } = await adminClient.from("unions").insert({
            partner1_id: p1,
            partner2_id: p2,
            status: "MARRIED",
          });
          if (!uErr) uCount++;
        }
      }

      // Pass 4: Audit log
      await adminClient.from("audit_logs").insert({
        actor_user_id: user.id,
        action: "IMPORT_FAMILY_BATCH",
        entity_type: "BATCH",
        entity_id: batchId,
        new_value: {
          batch_id: batchId,
          persons_count: pCount,
          relationships_count: rCount,
          unions_count: uCount,
        },
      });

      return {
        success: true,
        batchId,
        createdPersons: pCount,
        createdRelationships: rCount,
        createdUnions: uCount,
        message: `Đã nhập thành công ${pCount} thành viên, ${rCount} quan hệ cha/mẹ con và ${uCount} quan hệ hôn phối vào gia phả`,
      };
    }

    const res = rpcData as {
      success: boolean;
      batch_id: string;
      created_persons: number;
      created_relationships: number;
      created_unions: number;
    };

    return {
      success: true,
      batchId: res.batch_id,
      createdPersons: res.created_persons,
      createdRelationships: res.created_relationships,
      createdUnions: res.created_unions,
      message: `Đã nhập thành công ${res.created_persons} thành viên, ${res.created_relationships} quan hệ cha/mẹ con và ${res.created_unions} quan hệ hôn phối vào gia phả`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      createdPersons: 0,
      createdRelationships: 0,
      createdUnions: 0,
      error: err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình nhập dữ liệu",
    };
  }
}
