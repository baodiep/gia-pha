"use client";

import React, { useState, useTransition } from "react";
import { calculateKinshipPathAction } from "@/lib/kinship/actions";
import { KinshipPathResult } from "@/lib/kinship/engine";
import { Person } from "@/types/domain";
import { Users2, ArrowRightLeft, Search, CheckCircle2, HelpCircle, ArrowDown } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

interface KinshipLookupViewProps {
  initialPersons: Person[];
}

export function KinshipLookupView({ initialPersons }: KinshipLookupViewProps) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [result, setResult] = useState<KinshipPathResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredSourcePersons = initialPersons.filter((p) =>
    p.full_name.toLowerCase().includes(sourceSearch.toLowerCase().trim())
  );

  const filteredTargetPersons = initialPersons.filter((p) =>
    p.full_name.toLowerCase().includes(targetSearch.toLowerCase().trim())
  );

  const handleSwap = () => {
    const temp = sourceId;
    setSourceId(targetId);
    setTargetId(temp);
    setResult(null);
  };

  const handleLookup = () => {
    if (!sourceId || !targetId) {
      setErrorMessage("Vui lòng chọn đầy đủ Thành viên A và Thành viên B");
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      const res = await calculateKinshipPathAction(sourceId, targetId);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMessage(res.error || "Không thể tính toán quan hệ");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users2 className="w-8 h-8 text-emerald-600" />
          Tra Cứu Quan Hệ Họ Hàng
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
          Chọn hai người bất kỳ trên cây gia phả để biết cách xưng hô và xem đường nối họ hàng.
        </p>
      </div>

      {/* Guide card for 40+ friendly UX */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 text-gray-800 space-y-2">
        <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          Hướng dẫn 2 bước đơn giản:
        </h3>
        <ol className="list-decimal pl-5 space-y-1 text-base sm:text-lg">
          <li>Chọn <strong>Thành viên A</strong> (Người cần xưng hô / người hỏi).</li>
          <li>Chọn <strong>Thành viên B</strong> (Người được đối chiếu) và bấm <strong>&quot;Tra cứu quan hệ&quot;</strong>.</li>
        </ol>
      </div>

      {/* Selection Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Person A */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              1. Thành viên A (Người xưng hô):
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                placeholder="Tìm họ tên người A..."
                className="w-full pl-10 pr-3 py-2.5 text-base border border-gray-300 rounded-lg min-h-[44px]"
              />
            </div>
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                setResult(null);
              }}
              className="w-full text-base sm:text-lg p-3 border border-gray-300 rounded-xl font-medium text-gray-900 bg-white min-h-[50px]"
            >
              <option value="">-- Chọn thành viên A --</option>
              {filteredSourcePersons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} {p.generation_no ? `(Đời ${p.generation_no})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button for Mobile/Desktop */}
          <div className="flex justify-center md:hidden">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer shadow-sm"
              title="Đổi chiều A và B"
            >
              <ArrowRightLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Person B */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-lg font-bold text-gray-900">
                2. Thành viên B (Người đối chiếu):
              </label>
              <button
                type="button"
                onClick={handleSwap}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 cursor-pointer"
                title="Đổi vị trí A và B"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Đổi A / B</span>
              </button>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                placeholder="Tìm họ tên người B..."
                className="w-full pl-10 pr-3 py-2.5 text-base border border-gray-300 rounded-lg min-h-[44px]"
              />
            </div>
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                setResult(null);
              }}
              className="w-full text-base sm:text-lg p-3 border border-gray-300 rounded-xl font-medium text-gray-900 bg-white min-h-[50px]"
            >
              <option value="">-- Chọn thành viên B --</option>
              {filteredTargetPersons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} {p.generation_no ? `(Đời ${p.generation_no})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base">
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            disabled={!sourceId || !targetId || isPending}
            onClick={handleLookup}
            className={`w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-bold text-white shadow-lg min-h-[52px] cursor-pointer ${
              !sourceId || !targetId || isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-700 hover:bg-emerald-800"
            }`}
          >
            {isPending ? "Đang tính toán..." : "Tra Cứu Quan Hệ Ngay"}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-2 border-b pb-6">
            <span className="text-sm font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Kết Quả Xưng Hô
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-900 pt-2">
              {result.relationshipTitle}
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto pt-1">
              {result.explanation}
            </p>
          </div>

          {/* Path Steps Visualizer */}
          {result.pathNodes.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                Đường quan hệ chi tiết ({result.degree} bước nối):
              </h3>

              <div className="space-y-3">
                {result.pathNodes.map((node, index) => {
                  const edge = result.pathEdges[index];
                  return (
                    <div key={node.id} className="space-y-2">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-lg text-gray-900">{node.fullName}</span>
                          <span className="text-sm text-gray-500 block">
                            {node.gender === "FEMALE" ? "Nữ" : "Nam"} {node.generationNo ? `• Đời ${node.generationNo}` : ""}
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            Người A
                          </span>
                        )}
                        {index === result.pathNodes.length - 1 && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            Người B
                          </span>
                        )}
                      </div>

                      {edge && (
                        <div className="flex justify-center items-center gap-2 text-emerald-700 font-semibold text-base py-1">
                          <ArrowDown className="w-5 h-5 text-emerald-600 animate-bounce" />
                          <span>{edge.label}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-4 flex justify-center">
        <BackButton fallbackHref="/" label="Về Cây Gia Phả" />
      </div>
    </div>
  );
}
