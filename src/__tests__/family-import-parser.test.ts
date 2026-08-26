import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseFamilyExcelBuffer, generateFamilyExcelTemplateBuffer } from "@/lib/family-import/parser";

describe("Family Excel Import Parser & Template (T023)", () => {
  it("should generate a valid template Excel file buffer", () => {
    const buffer = generateFamilyExcelTemplateBuffer();
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);

    const wb = XLSX.read(buffer, { type: "buffer" });
    expect(wb.SheetNames.length).toBeGreaterThanOrEqual(1);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows[0]["Mã thành viên"]).toBe("TV001");
  });

  it("should successfully parse a valid template buffer", () => {
    const templateBuffer = generateFamilyExcelTemplateBuffer();
    const result = parseFamilyExcelBuffer(templateBuffer);

    expect(result.success).toBe(true);
    expect(result.validRows.length).toBe(3);
    expect(result.errors.length).toBe(0);

    const tv1 = result.validRows.find((r) => r.externalId === "TV001");
    expect(tv1).toBeDefined();
    expect(tv1?.fullName).toBe("Nguyễn Văn Thủy Tổ");
    expect(tv1?.gender).toBe("MALE");
    expect(tv1?.lifeStatus).toBe("DECEASED");
    expect(tv1?.generationNo).toBe(1);
  });

  it("should catch validation errors on missing required fields or duplicate external_ids", () => {
    const headers = ["Mã thành viên", "Họ và tên", "Giới tính", "Tình trạng"];
    const invalidRows = [
      ["TV01", "", "Nam", "Còn sống"], // missing fullName
      ["TV01", "Nguyễn Văn B", "Nam", "Còn sống"], // duplicate TV01
      ["TV02", "Trần Thị C", "KhongBiet", "ConSong"], // unknown enum handled or normalized
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...invalidRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = parseFamilyExcelBuffer(buffer);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes("trùng lặp"))).toBe(true);
  });
});
