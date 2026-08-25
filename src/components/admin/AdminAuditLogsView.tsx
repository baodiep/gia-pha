"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getAuditLogs, AuditLogItem } from "@/features/admin/audit-actions";
import { Activity, Search, Filter, Shield, User, Clock, FileJson } from "lucide-react";

export function AdminAuditLogsView() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadLogs = () => {
    startTransition(async () => {
      try {
        const data = await getAuditLogs({
          entityType: entityFilter === "ALL" ? undefined : entityFilter,
          action: actionFilter.trim() || undefined,
        });
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      }
    });
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityFilter]);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const actor = l.actor_profile?.login_name.toLowerCase() || "";
    const action = l.action.toLowerCase();
    const entityType = l.entity_type.toLowerCase();
    return actor.includes(term) || action.includes(term) || entityType.includes(term);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Nhật ký hệ thống (Audit Logs)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Truy vết mọi thay đổi dữ liệu: thêm/sửa/xóa thành viên, quan hệ, cấp quyền, sự kiện và tài khoản
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {["ALL", "PERSONS", "PARENT_CHILD", "UNIONS", "BRANCH_GRANTS", "PROFILES", "FAMILY_EVENTS"].map(
            (ent) => (
              <button
                key={ent}
                onClick={() => setEntityFilter(ent)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  entityFilter === ent
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {ent === "ALL" ? "Tất cả đối tượng" : ent}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hành động, người thực hiện..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải nhật ký kiểm toán...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 dark:border-slate-800">
          Không có bản ghi nhật ký nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">Thời gian</th>
                <th className="py-3 px-4 font-medium">Người thực hiện</th>
                <th className="py-3 px-4 font-medium">Hành động (Action)</th>
                <th className="py-3 px-4 font-medium">Đối tượng (Entity)</th>
                <th className="py-3 px-4 font-medium text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div>{new Date(log.created_at).toLocaleDateString("vi-VN")}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString("vi-VN")}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {log.actor_profile?.login_name || "System"}
                    </div>
                    <div className="text-[10px] text-slate-400">{log.actor_profile?.phone_normalized}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {log.entity_type}
                    </span>
                    {log.entity_id && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                        {log.entity_id}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <FileJson className="h-3 w-3" /> Xem Snapshot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Snapshot Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Chi tiết Snapshot thay đổi: {selectedLog.action}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {selectedLog.id} • {new Date(selectedLog.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-mono">
              {selectedLog.old_value && (
                <div>
                  <div className="text-rose-600 font-semibold mb-1">Old Value (Trước thay đổi):</div>
                  <pre className="rounded-lg bg-rose-50/50 dark:bg-rose-950/30 p-3 text-slate-800 dark:text-slate-200 border border-rose-100 dark:border-rose-900 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_value && (
                <div>
                  <div className="text-emerald-600 font-semibold mb-1">New Value (Sau thay đổi):</div>
                  <pre className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 p-3 text-slate-800 dark:text-slate-200 border border-emerald-100 dark:border-emerald-900 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
