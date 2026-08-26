import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("MVP2 Database Schema Foundations", () => {
  const migrationPath = path.join(process.cwd(), "supabase", "migrations", "006_mvp2_foundations.sql");

  it("should have migration 006 file exists", () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it("should define all required MVP2 tables and enums", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Enums
    expect(sql).toContain("create type public.claim_status");
    expect(sql).toContain("create type public.profile_change_status");
    expect(sql).toContain("create type public.password_reset_status");
    expect(sql).toContain("create type public.resource_type");
    expect(sql).toContain("create type public.rsvp_status");
    expect(sql).toContain("create type public.notification_type");

    // Required tables
    const requiredTables = [
      "person_claim_requests",
      "profile_change_requests",
      "password_reset_requests",
      "family_resources",
      "event_attendees",
      "notifications",
      "notification_preferences",
      "push_subscriptions",
      "contribution_settings",
      "contributions",
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`create table public.${table}`);
      expect(sql).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("should define essential indexes on query paths", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Contributions indexes
    expect(sql).toContain("idx_contributions_date");
    expect(sql).toContain("idx_contributions_phone");
    expect(sql).toContain("idx_contributions_amount");
    expect(sql).toContain("idx_contributions_user");

    // Password reset indexes
    expect(sql).toContain("idx_password_reset_phone");
    expect(sql).toContain("idx_password_reset_status");

    // Notifications indexes
    expect(sql).toContain("idx_notifications_user_read");
    expect(sql).toContain("idx_notifications_user_created");
  });

  it("should not store plaintext passwords or secrets in table definitions", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    expect(sql).not.toContain("password_plaintext");
    expect(sql).not.toContain("raw_password");
    expect(sql).not.toContain("captcha_answer");
  });
});
