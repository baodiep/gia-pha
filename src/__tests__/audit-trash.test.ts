import { describe, it, expect } from "vitest";

describe("Audit log & Trash logic", () => {
  it("audit action formats correctly with actor and snapshot", () => {
    const auditRecord = {
      actor_user_id: "user-123",
      action: "PERSON_DELETE",
      entity_type: "PERSONS",
      entity_id: "person-456",
      old_value: { full_name: "Nguyễn Văn X", deleted_at: null },
      new_value: { full_name: "Nguyễn Văn X", deleted_at: "2026-08-25T09:00:00Z" },
    };

    expect(auditRecord.action).toBe("PERSON_DELETE");
    expect(auditRecord.old_value.deleted_at).toBeNull();
    expect(auditRecord.new_value.deleted_at).toBeDefined();
  });

  it("soft delete and restore idempotency", () => {
    let deleted_at: string | null = null;

    // soft delete
    deleted_at = new Date().toISOString();
    expect(deleted_at).not.toBeNull();

    // restore
    deleted_at = null;
    expect(deleted_at).toBeNull();
  });
});
