"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  getActiveEligibleAccounts,
  grantBranchPermission,
} from "@/features/admin/permission-actions";
import { getPersons } from "@/features/persons/actions";
import { Person } from "@/types/domain";
import { ShieldCheck, User, Sparkles, CheckCircle2, AlertCircle, X } from "lucide-react";

interface GrantBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GrantBranchModal({ isOpen, onClose, onSuccess }: GrantBranchModalProps) {
  const [accounts, setAccounts] = useState<
    Array<{ id: string; login_name: string; phone_normalized: string; full_name: string | null }>
  >([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRootId, setSelectedRootId] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const [accList, personList] = await Promise.all([
          getActiveEligibleAccounts(),
          getPersons(),
        ]);
        setAccounts(accList);
        setPersons(personList);
        if (accList.length > 0) setSelectedUserId(accList[0].id);
        if (personList.length > 0) setSelectedRootId(personList[0].id);
      } catch (err) {
        console.error("Load modal data error:", err);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedUserId || !selectedRootId) {
      setMessage({ type: "error", text: "Vui lòng chọn tài khoản và thành viên gốc của nhánh" });
      return;
    }

    startTransition(async () => {
      const res = await grantBranchPermission(selectedUserId, selectedRootId);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Cấp quyền thành công!" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setMessage({ type: "error", text: res.error || "Cấp quyền thất bại" });
      }
    });
  };

  const selectedPerson = persons.find((p) => p.id === selectedRootId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Cấp quyền quản lý nhánh gia phả
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Giao quyền chỉnh sửa cây phả hệ theo nhánh trực hệ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Chọn tài khoản */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              1. Chọn tài khoản người phụ trách (Đã kích hoạt) *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.full_name ? `${acc.full_name} — ` : ""}
                  Tài khoản: {acc.login_name} ({acc.phone_normalized})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Nút gốc của Nhánh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              2. Chọn thành viên đứng đầu nhánh (Nút gốc) *
            </label>
            <select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} {p.generation_no ? `(Đời ${p.generation_no})` : ""} {p.branch_code ? `— ${p.branch_code}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Hộp giải thích trực quan về phạm vi quyền */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 text-xs space-y-2">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Phạm vi quyền được áp dụng:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Người này sẽ có toàn quyền <strong>chỉnh sửa thông tin, thêm con cháu, thêm vợ/chồng</strong> cho:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1 font-medium">
              <li>Chính cụ/ông/bà <strong>{selectedPerson?.full_name || "được chọn"}</strong>.</li>
              <li>Toàn bộ con, cháu, chắt và các thế hệ sau thuộc nhánh này (tính tự động theo phả hệ).</li>
              <li>Vợ/chồng của các thành viên trong nhánh.</li>
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-1">
              * Người này không thể sửa thông tin các chi/nhánh khác hoặc các bậc tiền nhân đời trên.
            </p>
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 text-xs sm:text-sm font-semibold ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? "Đang xử lý..." : "Cấp quyền ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
