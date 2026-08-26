import { describe, it, expect } from "vitest";
import { parseContributionExcel } from "@/lib/contributions/excel-parser";
import * as XLSX from "xlsx";

describe("Contribution Excel Import (T037)", () => {
  it("should parse and validate valid contribution rows", () => {
    const headers = [
      "Họ và tên (*)",
      "Số điện thoại",
      "Số tiền VNĐ (*)",
      "Mục đích đóng góp (*)",
      "Ngày đóng góp (YYYY-MM-DD) (*)",
      "Mã biên lai/Chứng từ",
      "Ghi chú",
    ];

    const sample = [
      [
        "Nguyễn Văn Tuấn",
        "0912345678",
        3000000,
        "Đóng góp xây lăng mộ",
        "2026-08-26",
        "BL-01",
        "Chuyển khoản",
      ],
      [
        "Trần Thị Lan",
        "0987654321",
        1500000,
        "Quỹ khuyến học",
        "2026-08-25",
        "",
        "",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const res = parseContributionExcel(buffer);

    expect(res.totalRows).toBe(2);
    expect(res.validRows).toBe(2);
    expect(res.errorRows).toBe(0);
    expect(res.rows[0].contributorName).toBe("Nguyễn Văn Tuấn");
    expect(res.rows[0].amount).toBe(3000000);
    expect(res.rows[0].phoneNormalized).toBe("0912345678");
  });

  it("should flag invalid rows with errors", () => {
    const headers = ["Họ và tên (*)", "Số điện thoại", "Số tiền VNĐ (*)", "Mục đích đóng góp (*)", "Ngày đóng góp (*)"];
    const invalidSample = [
      ["", "0912", "invalid_amount", "", ""], // Missing required fields
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...invalidSample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const res = parseContributionExcel(buffer);

    expect(res.totalRows).toBe(1);
    expect(res.errorRows).toBe(1);
    expect(res.rows[0].status).toBe("ERROR");
    expect(res.rows[0].errors.length).toBeGreaterThanOrEqual(3);
  });
});
