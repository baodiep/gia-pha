"use client";

import React, { useState, useTransition } from "react";
import {
  generateContributionTemplateAction,
} from "@/lib/contributions/excel-parser";
import {
  previewContributionImportAction,
  executeContributionImportAction,
  ContributionImportPreviewResult,
} from "@/lib/contributions/excel-actions";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export function ContributionImportView() {
  const [step, setStep] = useState<"UPLOAD" | "PREVIEW" | "RESULT">("UPLOAD");
  const [previewData, setPreviewData] = useState<ContributionImportPreviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDownloadTemplate = async () => {
    try {
      const base64 = await generateContributionTemplateAction();
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = "mau_so_cong_duc_dong_ho.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setErrorMsg("Không thể tải file mẫu. Vui lòng thử lại.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      if (typeof binaryStr === "string") {
        const base64 = btoa(binaryStr);
        startTransition(async () => {
          const res = await previewContributionImportAction(base64);
          if (res.success && res.data) {
            setPreviewData(res.data);
            setStep("PREVIEW");
          } else {
            setErrorMsg(res.error || "Không thể đọc file Excel");
          }
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (!previewData) return;

    const importableRows = previewData.rowsWithAccountMatches
      .filter((r) => r.status !== "ERROR")
      .map((r) => ({
        contributorName: r.contributorName,
        phone: r.phone,
        phoneNormalized: r.phoneNormalized,
        amount: r.amount,
        purpose: r.purpose,
        contributionDate: r.contributionDate,
        receiptCode: r.receiptCode,
        note: r.note,
        userId: r.matchedUserId,
      }));

    startTransition(async () => {
      const res = await executeContributionImportAction(importableRows);
      if (res.success) {
        setSuccessMsg(res.message || "Nhập dữ liệu thành công!");
        setStep("RESULT");
      } else {
        setErrorMsg(res.error || "Có lỗi xảy ra khi nhập dữ liệu");
      }
    });
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
          Nhập Sổ Công Đức Từ Excel
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Nhanh chóng cập nhật danh sách đóng góp của bà con từ file Excel mẫu của Ban Quản trị.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-start gap-3 text-base">
          <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "UPLOAD" && (
        <div className="space-y-6">
          {/* Guide Card (40+ friendly UX) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-gray-800 space-y-3">
            <h3 className="font-bold text-emerald-950 text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
              Hướng dẫn 3 bước đơn giản:
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-base sm:text-lg text-gray-700">
              <li>Tải file mẫu Excel chuẩn bên dưới về máy tính/điện thoại.</li>
              <li>Nhập các khoản đóng góp theo đúng các cột bắt buộc có dấu (*).</li>
              <li>Bấm nút &ldquo;Chọn file Excel để tải lên&rdquo; để xem trước và xác nhận.</li>
            </ol>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-5 py-3 bg-white hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-600 font-bold rounded-xl text-base min-h-[48px] flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-5 h-5" />
                <span>Tải File Excel Mẫu (.XLSX)</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center space-y-4 hover:border-emerald-500 transition-colors">
            <Upload className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">
                Tải lên bảng tính đóng góp
              </h3>
              <p className="text-base text-gray-500">Hỗ trợ các định dạng .xlsx, .xls</p>
            </div>

            <label className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-base sm:text-lg cursor-pointer shadow min-h-[50px]">
              <FileSpreadsheet className="w-5 h-5" />
              <span>{isPending ? "Đang đọc dữ liệu..." : "Chọn File Excel"}</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isPending}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Confirmation */}
      {step === "PREVIEW" && previewData && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <span className="text-xs text-gray-500 font-bold uppercase">Tổng số dòng</span>
              <p className="text-2xl font-extrabold text-gray-900">
                {previewData.parseResult.totalRows}
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <span className="text-xs text-green-700 font-bold uppercase">Hợp lệ</span>
              <p className="text-2xl font-extrabold text-green-800">
                {previewData.parseResult.validRows}
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-xs text-amber-700 font-bold uppercase">Cảnh báo / Trùng</span>
              <p className="text-2xl font-extrabold text-amber-800">
                {previewData.parseResult.warningRows}
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="text-xs text-red-700 font-bold uppercase">Lỗi (Bỏ qua)</span>
              <p className="text-2xl font-extrabold text-red-800">
                {previewData.parseResult.errorRows}
              </p>
            </div>
          </div>

          {/* Rows List (Card format for mobile 40+) */}
          <div className="space-y-3">
            {previewData.rowsWithAccountMatches.map((row) => (
              <div
                key={row.rowNumber}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-3 ${
                  row.status === "ERROR"
                    ? "bg-red-50/50 border-red-300"
                    : row.status === "WARNING"
                    ? "bg-amber-50/50 border-amber-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                      Dòng {row.rowNumber}
                    </span>
                    <h4 className="font-bold text-lg text-gray-900">{row.contributorName}</h4>
                    {row.phone && <span className="text-sm text-gray-600 font-mono">({row.phone})</span>}
                  </div>

                  <p className="text-base text-gray-700 font-medium">{row.purpose}</p>

                  {/* Account match pill */}
                  {row.matchedUserLogin ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Khớp tài khoản: {row.matchedUserLogin}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Chưa liên kết tài khoản hệ thống</span>
                  )}

                  {/* Warnings & Errors */}
                  {row.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-800 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {w}
                    </p>
                  ))}
                  {row.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-800 flex items-center gap-1 font-bold">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-xl font-bold text-emerald-800">
                    {formatVnd(row.amount)}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{row.contributionDate}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep("UPLOAD")}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-base min-h-[48px] cursor-pointer"
            >
              Chọn lại file khác
            </button>

            <button
              type="button"
              disabled={isPending || previewData.parseResult.validRows + previewData.parseResult.warningRows === 0}
              onClick={handleConfirmImport}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-base sm:text-lg shadow min-h-[50px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-5 h-5" />
              <span>
                {isPending
                  ? "Đang lưu..."
                  : `Xác nhận nhập ${previewData.parseResult.validRows + previewData.parseResult.warningRows} dòng`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === "RESULT" && (
        <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm text-center space-y-5">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nhập Dữ Liệu Thành Công!
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-lg mx-auto">
            {successMsg}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="/contributions/list"
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-base sm:text-lg min-h-[50px] flex items-center justify-center"
            >
              Xem Sổ Công Đức
            </a>
            <button
              type="button"
              onClick={() => {
                setStep("UPLOAD");
                setPreviewData(null);
                setSuccessMsg(null);
              }}
              className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-base min-h-[50px]"
            >
              Nhập tiếp file khác
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="pt-6 flex justify-center">
        <BackButton fallbackHref="/contributions/list" label="Về Sổ Công Đức" />
      </div>
    </div>
  );
}
