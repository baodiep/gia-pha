"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { ShieldCheck, ShieldAlert, Heart, ChevronDown, ChevronRight, User } from "lucide-react";

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
  hasChildren: boolean;
  isExpanded: boolean;
  spouses?: Array<{
    id: string;
    fullName: string;
    lifeStatus: "LIVING" | "DECEASED" | "UNKNOWN";
    status: string;
  }>;
}

export const PersonNode = memo((props: NodeProps) => {
  const data = props.data as unknown as PersonNodeData;
  const isDeceased = data.lifeStatus === "DECEASED";
  const isMale = data.gender === "MALE";

  return (
    <div
      className={`relative rounded-xl border p-3 shadow-sm transition-all duration-200 w-[220px] bg-white dark:bg-slate-900 ${
        data.isEditable
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-slate-200 dark:border-slate-800 opacity-90"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />

      <div className="flex items-start gap-2.5">
        {/* Avatar / Icon */}
        <div
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
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
            <User className="h-5 w-5" />
          )}
          {isDeceased && (
            <span className="absolute -bottom-1 -right-1 rounded-full bg-slate-700 px-1 py-0.2 text-[9px] text-white">
              ✝
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {data.fullName}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {data.generationNo && <span>Đời {data.generationNo}</span>}
            {data.branchCode && <span>• {data.branchCode}</span>}
          </div>

          {/* Editable badge */}
          <div className="mt-1.5 flex items-center gap-1">
            {data.isEditable ? (
              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Được sửa
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <ShieldAlert className="h-3 w-3" /> Chỉ xem
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Spouses List */}
      {data.spouses && data.spouses.length > 0 && (
        <div className="mt-2.5 border-t border-slate-100 pt-1.5 dark:border-slate-800">
          {data.spouses.map((spouse) => (
            <div
              key={spouse.id}
              className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 truncate"
            >
              <Heart className="h-3 w-3 text-rose-500 shrink-0" />
              <span className="truncate">{spouse.fullName}</span>
              {spouse.lifeStatus === "DECEASED" && (
                <span className="text-[10px] text-slate-400">✝</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expand/Collapse Button Indicator */}
      {data.hasChildren && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-0.5 shadow-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100">
          {data.isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
});

PersonNode.displayName = "PersonNode";
