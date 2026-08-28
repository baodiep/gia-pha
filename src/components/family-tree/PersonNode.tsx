"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { ShieldCheck, ShieldAlert, Heart, ChevronDown, ChevronRight, User, Shield, KeyRound } from "lucide-react";

export interface PersonNodeData {
  [key: string]: unknown;
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
  generationNo: number | null;
  branchCode: string | null;
  avatarUrl: string | null;
  isEditable: boolean;
  isSpouse?: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand?: (personId: string, e: React.MouseEvent) => void;
  onSpouseClick?: (spouseId: string, e: React.MouseEvent) => void;
  managers?: Array<{
    userId: string;
    loginName: string;
    phone: string;
    fullName?: string;
  }>;
  spouses?: Array<{
    id: string;
    fullName: string;
    gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
    lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
    avatarUrl?: string | null;
    status: string;
  }>;
}

export const PersonNode = memo((props: NodeProps) => {
  const data = props.data as unknown as PersonNodeData;
  const isDeceased = data.lifeStatus === "DECEASED";
  const isMale = data.gender === "MALE";
  const hasSpouses = data.spouses && data.spouses.length > 0;

  return (
    <div className="relative flex items-center gap-2">
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2.5 !h-2.5 !-top-1.5" />

      {/* Thẻ thành viên chính (Trực hệ) */}
      <div
        className={`relative rounded-xl border p-2.5 sm:p-3 shadow-sm transition-all duration-200 w-[190px] bg-white dark:bg-slate-900 ${
          data.isEditable
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : "border-slate-200 dark:border-slate-800 opacity-95"
        }`}
      >
        <div className="flex items-start gap-2">
          {/* Avatar / Icon */}
          <div
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              isDeceased
                ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                : isMale
                ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.avatarUrl}
                alt={data.fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white" title={data.fullName}>
              {data.fullName}
            </h4>

            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              {data.generationNo && <span>Đời {data.generationNo}</span>}
              {data.branchCode && <span>• {data.branchCode}</span>}
            </div>

            {/* Editable badge */}
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              {data.isEditable ? (
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <ShieldCheck className="h-2.5 w-2.5" /> Được sửa
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1 py-0.2 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <ShieldAlert className="h-2.5 w-2.5" /> Chỉ xem
                </span>
              )}
            </div>

            {/* Manager / Phụ trách nhánh badge */}
            {data.managers && data.managers.length > 0 && (
              <div className="mt-1 flex flex-col gap-0.5 border-t border-indigo-100 dark:border-indigo-900/60 pt-1">
                <span className="text-[8px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-0.5">
                  <Shield className="h-2 w-2 text-indigo-600" /> Quản lý:
                </span>
                {data.managers.map((m) => (
                  <div
                    key={m.userId}
                    className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-1 py-0.2 text-[8px] font-semibold text-indigo-900 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-200 truncate"
                    title={`Người quản lý: ${m.fullName || m.loginName} (${m.phone})`}
                  >
                    <User className="h-2 w-2 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="truncate">{m.fullName || m.loginName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button Indicator */}
        {data.hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onToggleExpand) {
                data.onToggleExpand(data.id, e);
              }
            }}
            title={data.isExpanded ? "Đóng nhánh con" : "Mở nhánh con"}
            className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 active:scale-95 z-20 ${
              data.isExpanded
                ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 h-6 w-6"
                : "bg-indigo-600 text-white border-indigo-700 h-6 w-6 ring-2 ring-indigo-500/30"
            }`}
          >
            {data.isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Danh sách Dâu / Rể (Ngang hàng kết nối bên phải) */}
      {hasSpouses && (
        <div className="flex items-center gap-1.5">
          {/* Đường nối hôn phối ngang */}
          <div className="flex items-center text-rose-500">
            <div className="w-3 h-0.5 bg-rose-300 dark:bg-rose-700" />
            <Heart className="h-3.5 w-3.5 -mx-0.5 fill-rose-500 text-rose-500 shrink-0" />
            <div className="w-3 h-0.5 bg-rose-300 dark:bg-rose-700" />
          </div>

          {data.spouses!.map((sp) => {
            const spIsDeceased = sp.lifeStatus === "DECEASED";
            const spIsMale = sp.gender === "MALE";

            return (
              <div
                key={sp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.onSpouseClick) {
                    data.onSpouseClick(sp.id, e);
                  }
                }}
                className="relative rounded-xl border border-amber-300 bg-amber-50/70 p-2.5 shadow-sm transition-all duration-200 w-[170px] dark:border-amber-900/60 dark:bg-amber-950/30 hover:border-amber-400 cursor-pointer"
                title="Bấm để xem chi tiết / sửa thông tin Dâu/Rể"
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      spIsDeceased
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : spIsMale
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {sp.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sp.avatarUrl}
                        alt={sp.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-xs font-bold text-amber-950 dark:text-amber-200" title={sp.fullName}>
                      {sp.fullName}
                    </h4>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 border border-amber-300 px-1 py-0.2 text-[8px] font-bold text-amber-800 dark:bg-amber-900/60 dark:border-amber-800 dark:text-amber-200">
                        {spIsMale ? "Rể" : "Dâu"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2.5 !h-2.5 !-bottom-1.5" />
    </div>
  );
});

PersonNode.displayName = "PersonNode";
