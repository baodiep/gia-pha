"use client";

import React, { useState, useTransition } from "react";
import { getFamilyExcelTemplateBase64 } from "@/lib/family-import/actions";
import { parseAndPreviewFamilyExcelAction, filterOrUpdatePreviewRowsAction } from "@/lib/family-import/preview-actions";
import { executeFamilyImportTransactionAction, ImportExecutionResult } from "@/lib/family-import/transaction-actions";
import { FamilyImportPreviewResult, PreviewRowItem } from "@/lib/family-import/preview";
import { ParsedFamilyMemberRow } from "@/lib/family-import/parser";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Trash2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Database,
  Eye,
} from "lucide-react";

export function FamilyImportView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewResult, setPreviewResult] = useState<FamilyImportPreviewResult | null>(null);
  const [activeRows, setActiveRows] = useState<ParsedFamilyMemberRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportExecutionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDownloadTemplate = async () => {
    try {
      const res = await getFamilyExcelTemplateBase64();
      if (res.success && res.base64) {
        const byteCharacters = atob(res.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mau_nhap_lieu_gia_pha.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setErrorMessage(res.error || "Không thể tải file mẫu");
      }
    } catch {
      setErrorMessage("Lỗi tải file mẫu");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewResult(null);
      setActiveRows([]);
      setImportResult(null);
      setErrorMessage(null);
    }
  };

  const handleUploadAndAnalyze = () => {
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn file Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      setErrorMessage(null);
      setImportResult(null);
      const res = await parseAndPreviewFamilyExcelAction(formData);
      if (res.success && res.data) {
        setPreviewResult(res.data);
        setActiveRows(
          res.data.rows.map((r) => ({
            rowNumber: r.rowNumber,
            externalId: r.externalId,
            fullName: r.fullName,
            gender: r.gender,
            lifeStatus: r.lifeStatus,
            birthDate: r.birthDate,
            deathDate: r.deathDate,
            deathLunarDay: r.deathLunarDay,
            deathLunarMonth: r.deathLunarMonth,
            deathLunarIsLeapMonth: r.deathLunarIsLeapMonth,
            deathAnniversaryNote: r.deathAnniversaryNote,
            fatherExternalId: r.fatherExternalId,
            motherExternalId: r.motherExternalId,
            spouseExternalIds: r.spouseExternalIds,
            generationNo: r.generationNo,
            branchCode: r.branchCode,
            birthPlace: r.birthPlace,
            hometown: r.hometown,
            bio: r.bio,
          }))
        );
      } else {
        setErrorMessage(res.error || "Có lỗi xảy ra khi phân tích file");
      }
    });
  };

  const handleDeleteRow = (externalId: string) => {
    const nextRows = activeRows.filter((r) => r.externalId !== externalId);
    setActiveRows(nextRows);

    startTransition(async () => {
      const res = await filterOrUpdatePreviewRowsAction(nextRows);
      if (res.success && res.data) {
        setPreviewResult(res.data);
      }
    });
  };

  const handleExecuteImport = () => {
    if (!previewResult || !previewResult.canProceed || activeRows.length === 0) {
      return;
    }

    const batchId = crypto.randomUUID();

    startTransition(async () => {
      setErrorMessage(null);
      const res = await executeFamilyImportTransactionAction(activeRows, batchId);
      if (res.success) {
        setImportResult(res);
        setPreviewResult(null);
        setActiveRows([]);
        setSelectedFile(null);
      } else {
        setErrorMessage(res.error || "Nhập dữ liệu thất bại");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
          Nhập Dữ Liệu Gia Phả Bằng Excel
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Dễ dàng tải lên danh sách thành viên và mối quan hệ trực hệ số lượng lớn.
        </p>
      </div>

      {/* 4-Step Instructions Card for 40+ Friendly UX */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 sm:p-6 text-gray-800 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-emerald-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-700" />
          Hướng dẫn 4 bước nhập dữ liệu:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base sm:text-lg">
          <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm flex items-start gap-3">
            <span className="bg-emerald-700 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">1</span>
            <span>Tải file Excel mẫu chuẩn bằng nút bên dưới.</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm flex items-start gap-3">
            <span className="bg-emerald-700 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">2</span>
            <span>Điền thông tin và mã tự đặt (ví dụ: TV01, TV02) để nối cha/mẹ/vợ/chồng.</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm flex items-start gap-3">
            <span className="bg-emerald-700 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">3</span>
            <span>Chọn file đã điền và nhấn <strong>&quot;Xem trước & Kiểm tra dữ liệu&quot;</strong>.</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm flex items-start gap-3">
            <span className="bg-emerald-700 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">4</span>
            <span>Đối chiếu danh sách, loại bỏ lỗi (nếu có) và xác nhận nhập vào gia phả.</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-base sm:text-lg font-medium rounded-lg shadow min-h-[48px] touch-manipulation cursor-pointer"
          >
            <Download className="w-5 h-5" />
            Tải File Excel Mẫu Chuẩn (.xlsx)
          </button>
        </div>
      </div>

      {/* Success Import Notification */}
      {importResult && (
        <div className="p-6 bg-green-50 border border-green-300 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-green-900">Nhập dữ liệu thành công!</h3>
              <p className="text-green-800 text-base">{importResult.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-base font-semibold pt-2">
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <span className="text-gray-500 block text-xs">Thành viên mới:</span>
              <span className="text-2xl text-green-700 font-bold">{importResult.createdPersons}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <span className="text-gray-500 block text-xs">Quan hệ cha/mẹ - con:</span>
              <span className="text-2xl text-green-700 font-bold">{importResult.createdRelationships}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <span className="text-gray-500 block text-xs">Quan hệ vợ/chồng:</span>
              <span className="text-2xl text-green-700 font-bold">{importResult.createdUnions}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg shadow min-h-[48px] text-base sm:text-lg"
            >
              <Eye className="w-5 h-5" />
              Xem Cây Gia Phả Ngay
            </Link>
          </div>
        </div>
      )}

      {/* Upload Box */}
      {!importResult && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <label className="block text-lg font-semibold text-gray-900">
            Chọn file Excel từ điện thoại hoặc máy tính:
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-base text-gray-700 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer min-h-[48px]"
            />
            <button
              type="button"
              disabled={!selectedFile || isPending}
              onClick={handleUploadAndAnalyze}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base sm:text-lg font-semibold text-white min-h-[48px] shrink-0 touch-manipulation cursor-pointer ${
                !selectedFile || isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow"
              }`}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang phân tích...
                </span>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Xem trước & Kiểm tra dữ liệu</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3 text-base">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Preview Result Summary */}
      {previewResult && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {previewResult.canProceed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              Kết quả kiểm tra dữ liệu trước khi nhập:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-base sm:text-lg">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <span className="text-gray-500 block text-sm">Tổng số thành viên:</span>
                <span className="font-bold text-2xl text-gray-900">{previewResult.totalCount}</span>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <span className="text-green-700 block text-sm">Hợp lệ (Sẵn sàng):</span>
                <span className="font-bold text-2xl text-green-800">{previewResult.validCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <span className="text-amber-700 block text-sm">Có cảnh báo:</span>
                <span className="font-bold text-2xl text-amber-800">{previewResult.warningCount}</span>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <span className="text-red-700 block text-sm">Có lỗi chặn:</span>
                <span className="font-bold text-2xl text-red-800">{previewResult.errorCount}</span>
              </div>
            </div>

            {!previewResult.canProceed && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-900 text-base space-y-1">
                <strong>Chưa thể nhập vào gia phả:</strong> Vui lòng loại bỏ hoặc sửa các dòng có lỗi đỏ bên dưới (hoặc chỉnh sửa file Excel gốc rồi tải lên lại).
              </div>
            )}
          </div>

          {/* List/Cards Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              Chi tiết từng thành viên trong file ({previewResult.rows.length})
            </h3>

            <div className="space-y-4">
              {previewResult.rows.map((row: PreviewRowItem) => (
                <div
                  key={row.externalId}
                  className={`border rounded-xl p-4 sm:p-5 space-y-3 ${
                    row.status === "ERROR"
                      ? "border-red-300 bg-red-50/40"
                      : row.status === "WARNING"
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm bg-gray-200 text-gray-800 px-2.5 py-1 rounded font-bold">
                        {row.externalId}
                      </span>
                      <span className="text-xl font-bold text-gray-900">{row.fullName}</span>
                      <span
                        className={`text-sm px-2.5 py-0.5 rounded font-medium ${
                          row.status === "ERROR"
                            ? "bg-red-200 text-red-900"
                            : row.status === "WARNING"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {row.status === "ERROR" ? "Có lỗi" : row.status === "WARNING" ? "Cảnh báo" : "Hợp lệ"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.externalId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition min-h-[44px] cursor-pointer"
                      title="Bỏ dòng này khỏi đợt nhập"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Bỏ dòng này</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-base text-gray-700">
                    <div>
                      <span className="text-gray-500 text-sm block">Giới tính:</span>
                      <span>{row.gender === "MALE" ? "Nam" : row.gender === "FEMALE" ? "Nữ" : "Khác"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Tình trạng:</span>
                      <span>{row.lifeStatus === "DECEASED" ? "Đã mất" : "Còn sống"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Mã cha / Mẹ:</span>
                      <span>{row.fatherExternalId || "—"} / {row.motherExternalId || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Vợ/Chồng:</span>
                      <span>{row.spouseExternalIds.length > 0 ? row.spouseExternalIds.join(", ") : "—"}</span>
                    </div>
                  </div>

                  {/* Errors display */}
                  {row.errors.length > 0 && (
                    <div className="p-3 bg-red-100/80 border border-red-200 rounded-lg text-red-900 text-base space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-700" />
                        Lỗi chặn cần sửa:
                      </div>
                      <ul className="list-disc pl-5 text-sm sm:text-base">
                        {row.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings display */}
                  {row.warnings.length > 0 && (
                    <div className="p-3 bg-amber-100/80 border border-amber-200 rounded-lg text-amber-900 text-base space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        Cảnh báo kiểm tra:
                      </div>
                      <ul className="list-disc pl-5 text-sm sm:text-base">
                        {row.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Proceed Action */}
            {previewResult.canProceed && (
              <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-green-800 text-base font-semibold">
                  ✓ Toàn bộ {previewResult.totalCount} thành viên đã được kiểm tra hợp lệ và sẵn sàng nhập.
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleExecuteImport}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-bold rounded-xl shadow-lg min-h-[52px] cursor-pointer"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Đang xử lý nhập dữ liệu...
                    </span>
                  ) : (
                    <>
                      <Database className="w-6 h-6" />
                      <span>Xác nhận Nhập vào Cây Gia Phả</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

