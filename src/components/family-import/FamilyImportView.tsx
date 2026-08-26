"use client";

import React, { useState, useTransition } from "react";
import { parseFamilyExcelAction, getFamilyExcelTemplateBase64 } from "@/lib/family-import/actions";
import { ParseFamilyExcelResult } from "@/lib/family-import/parser";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";

export function FamilyImportView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseFamilyExcelResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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
      setParseResult(null);
      setErrorMessage(null);
    }
  };

  const handleUploadAndParse = () => {
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn file Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      setErrorMessage(null);
      const res = await parseFamilyExcelAction(formData);
      if (res.success && res.data) {
        setParseResult(res.data);
      } else {
        setErrorMessage(res.error || "Có lỗi xảy ra khi đọc file");
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
            <span>Chọn file đã điền và nhấn <strong>&quot;Kiểm tra dữ liệu file&quot;</strong>.</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm flex items-start gap-3">
            <span className="bg-emerald-700 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">4</span>
            <span>Xem trước danh sách hợp lệ và xác nhận nhập vào cây gia phả.</span>
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

      {/* Upload Box */}
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
            onClick={handleUploadAndParse}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base sm:text-lg font-semibold text-white min-h-[48px] shrink-0 touch-manipulation cursor-pointer ${
              !selectedFile || isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow"
            }`}
          >
            {isPending ? (
              <span>Đang kiểm tra...</span>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Kiểm tra dữ liệu file</span>
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

      {/* Parse Result Summary */}
      {parseResult && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {parseResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600" />
              )}
              Kết quả kiểm tra file:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-base sm:text-lg">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <span className="text-gray-500 block text-sm">Tổng số dòng đọc:</span>
                <span className="font-bold text-2xl text-gray-900">{parseResult.totalRows}</span>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <span className="text-green-700 block text-sm">Dòng hợp lệ:</span>
                <span className="font-bold text-2xl text-green-800">{parseResult.validRows.length}</span>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <span className="text-red-700 block text-sm">Số lỗi phát hiện:</span>
                <span className="font-bold text-2xl text-red-800">{parseResult.errors.length}</span>
              </div>
            </div>

            {/* Error details if any */}
            {parseResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-red-900 text-base">Danh sách các lỗi cần sửa trong file:</h4>
                <ul className="list-disc pl-5 space-y-1 text-red-800 text-base">
                  {parseResult.errors.map((err, i) => (
                    <li key={i}>
                      <strong>Dòng {err.rowNumber}:</strong> {err.column ? `[${err.column}] ` : ""}{err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning details if any */}
            {parseResult.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-amber-900 text-base">Lưu ý quan hệ tham chiếu:</h4>
                <ul className="list-disc pl-5 space-y-1 text-amber-800 text-base">
                  {parseResult.warnings.map((w, i) => (
                    <li key={i}>
                      <strong>Dòng {w.rowNumber}:</strong> {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Valid rows preview */}
          {parseResult.validRows.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  Xem trước danh sách hợp lệ ({parseResult.validRows.length} thành viên)
                </h3>
              </div>

              {/* Responsive Cards for Mobile & Table for Desktop */}
              <div className="block sm:hidden space-y-3">
                {parseResult.validRows.map((r) => (
                  <div key={r.externalId} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-1 text-base">
                    <div className="flex justify-between items-center font-bold text-gray-900 text-lg">
                      <span>{r.fullName}</span>
                      <span className="text-sm bg-gray-200 px-2 py-0.5 rounded text-gray-700">{r.externalId}</span>
                    </div>
                    <div className="text-gray-600">
                      <span>Giới tính: {r.gender === "MALE" ? "Nam" : r.gender === "FEMALE" ? "Nữ" : "Khác"}</span> |{" "}
                      <span>{r.lifeStatus === "DECEASED" ? "Đã mất" : "Còn sống"}</span>
                    </div>
                    {(r.fatherExternalId || r.motherExternalId) && (
                      <div className="text-sm text-gray-500">
                        Cha: {r.fatherExternalId || "—"} | Mẹ: {r.motherExternalId || "—"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-base">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 border-b">
                      <th className="p-3">Mã</th>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Giới tính</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Đời</th>
                      <th className="p-3">Mã cha / mẹ</th>
                      <th className="p-3">Mã vợ/chồng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parseResult.validRows.map((r) => (
                      <tr key={r.externalId} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm font-semibold text-gray-700">{r.externalId}</td>
                        <td className="p-3 font-medium text-gray-900">{r.fullName}</td>
                        <td className="p-3 text-gray-700">{r.gender === "MALE" ? "Nam" : r.gender === "FEMALE" ? "Nữ" : "Khác"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                            r.lifeStatus === "DECEASED" ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-800"
                          }`}>
                            {r.lifeStatus === "DECEASED" ? "Đã mất" : "Còn sống"}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">{r.generationNo ? `Đời ${r.generationNo}` : "—"}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {r.fatherExternalId || r.motherExternalId ? `${r.fatherExternalId || "—"} / ${r.motherExternalId || "—"}` : "—"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {r.spouseExternalIds.length > 0 ? r.spouseExternalIds.join(", ") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parseResult.success && (
                <div className="pt-3 border-t flex justify-end">
                  <div className="flex items-center gap-2 text-base text-gray-500 italic">
                    <span>Sẵn sàng cho bước xem trước & đối chiếu trùng lặp (Task T024)</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
