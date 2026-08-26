import { ParsedFamilyMemberRow } from "./parser";

export interface TransactionalImportPlan {
  batchId: string;
  personsToInsert: ParsedFamilyMemberRow[];
  parentChildLinks: Array<{
    parentExternalId: string;
    childExternalId: string;
    isLineage: boolean;
  }>;
  unionsToCreate: Array<{
    partner1ExternalId: string;
    partner2ExternalId: string;
  }>;
}

export function buildImportTransactionPlan(
  batchId: string,
  validRows: ParsedFamilyMemberRow[]
): TransactionalImportPlan {
  const parentChildLinks: TransactionalImportPlan["parentChildLinks"] = [];
  const unionsToCreate: TransactionalImportPlan["unionsToCreate"] = [];
  const processedUnions = new Set<string>();

  validRows.forEach((r) => {
    // 1. Father linkage
    if (r.fatherExternalId) {
      parentChildLinks.push({
        parentExternalId: r.fatherExternalId,
        childExternalId: r.externalId,
        isLineage: true,
      });
    }

    // 2. Mother linkage
    if (r.motherExternalId) {
      parentChildLinks.push({
        parentExternalId: r.motherExternalId,
        childExternalId: r.externalId,
        isLineage: false,
      });
    }

    // 3. Spouse unions (deduplicated undirected pairs)
    r.spouseExternalIds.forEach((spExt) => {
      const pairKey = [r.externalId, spExt].sort().join("::");
      if (!processedUnions.has(pairKey)) {
        processedUnions.add(pairKey);
        unionsToCreate.push({
          partner1ExternalId: r.externalId,
          partner2ExternalId: spExt,
        });
      }
    });
  });

  return {
    batchId,
    personsToInsert: validRows,
    parentChildLinks,
    unionsToCreate,
  };
}
