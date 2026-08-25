"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getTrashPersons, restorePersonFromTrash, DeletedPersonItem } from "@/features/admin/audit-actions";
import { BackButton } from "@/components/ui/BackButton";
import { Trash2, RotateCcw, AlertTriangle, User } from "lucide-react";

export function AdminTrashView() {
  const [deletedPersons, setDeletedPersons] = useState<DeletedPersonItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadTrash = () => {
    startTransition(async () => {
      try {
        const data = await getTrashPersons();
        setDeletedPersons(data);
      } catch (err) {
        console.error("Failed to load trash:", err);
      }
    });
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = (personId: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục thành viên "${name}" vào cây gia phả?`)) {
      return;
    }

    startTransition(async () => {
      const res = await restorePersonFromTrash(personId);
      if (res.success) {
        alert(res.message || "Đã khôi phục thành công");
        loadTrash();
      } else {
        alert(res.error || "Có lỗi xảy ra khi khôi phục");
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      {/* Header & Back Button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/admin" label="Quay lại Quản trị" />
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Thùng rác & Phục hồi dữ liệu
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách thành viên bị xóa mềm. Khôi phục an toàn, bảo toàn quan hệ.
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải thùng rác...</div>
      ) : deletedPersons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 dark:border-slate-800">
          Thùng rác trống. Không có thành viên nào bị xóa.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">Họ và tên thành viên</th>
                <th className="py-3 px-4 font-medium">Chi / Đời</th>
                <th className="py-3 px-4 font-medium">Người thực hiện xóa</th>
                <th className="py-3 px-4 font-medium">Thời gian xóa</th>
                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deletedPersons.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{p.full_name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {p.generation_no ? `Đời ${p.generation_no}` : "-"}
                    {p.branch_code && ` • ${p.branch_code}`}
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {p.deleted_by_profile?.login_name || "Admin"}
                  </td>

                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {p.deleted_at ? new Date(p.deleted_at).toLocaleString("vi-VN") : "-"}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRestore(p.id, p.full_name)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      <RotateCcw className="h-3 w-3" /> Khôi phục
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
