"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  getAdminBranchGrants,
  revokeBranchPermission,
  BranchGrantDetail,
} from "@/features/admin/permission-actions";
import { BackButton } from "@/components/ui/BackButton";
import { Shield, ShieldAlert, ShieldCheck, Search, Trash2, CheckCircle2, XCircle } from "lucide-react";

export function AdminPermissionManagementView() {
  const [grants, setGrants] = useState<BranchGrantDetail[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadGrants = () => {
    startTransition(async () => {
      try {
        const data = await getAdminBranchGrants({ activeOnly });
        setGrants(data);
      } catch (err) {
        console.error("Failed to load grants:", err);
      }
    });
  };

  useEffect(() => {
    loadGrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const handleRevoke = (grantId: string, userName: string, rootName: string) => {
    if (!confirm(`Bạn có chắc muốn thu hồi quyền quản lý nhánh của "${userName}" từ nút "${rootName}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await revokeBranchPermission(grantId);
      if (res.success) {
        loadGrants();
      } else {
        alert(res.error || "Có lỗi xảy ra khi thu hồi");
      }
    });
  };

  const filteredGrants = grants.filter((g) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const login = g.user_profile?.login_name.toLowerCase() || "";
    const phone = g.user_profile?.phone_normalized.toLowerCase() || "";
    const rootName = g.root_person?.full_name.toLowerCase() || "";
    const branchCode = g.root_person?.branch_code?.toLowerCase() || "";
    return login.includes(term) || phone.includes(term) || rootName.includes(term) || branchCode.includes(term);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Header & Back Button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/admin" label="Quay lại Quản trị" />
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-slate-800 dark:text-slate-200" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Quản lý phân quyền nhánh gia phả
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách quyền quản lý theo nhánh dòng họ (Branch Grants)
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveOnly(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeOnly
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Đang hiệu lực
          </button>
          <button
            onClick={() => setActiveOnly(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !activeOnly
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Tất cả lịch sử (gồm đã thu hồi)
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo người quản lý, nút gốc, chi..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải danh sách phân quyền...</div>
      ) : filteredGrants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 dark:border-slate-800">
          Không tìm thấy bản ghi phân quyền nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">Người được cấp quyền</th>
                <th className="py-3 px-4 font-medium">Nhánh phụ trách (Gốc nhánh)</th>
                <th className="py-3 px-4 font-medium">Trạng thái quyền</th>
                <th className="py-3 px-4 font-medium">Người cấp / Ngày cấp</th>
                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrants.map((grant) => {
                const isRevoked = !!grant.revoked_at;
                const userName = grant.user_profile?.login_name || grant.user_id;
                const rootName = grant.root_person?.full_name || "Nút gốc";

                return (
                  <tr key={grant.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {grant.user_profile?.login_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {grant.user_profile?.person?.full_name ? (
                          <span>{grant.user_profile.person.full_name} • </span>
                        ) : null}
                        {grant.user_profile?.phone_normalized}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{grant.root_person?.full_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {grant.root_person?.generation_no && `Đời ${grant.root_person.generation_no} • `}
                        {grant.root_person?.branch_code || "Toàn nhánh"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isRevoked ? (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <XCircle className="h-3 w-3" /> Đã thu hồi
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(grant.revoked_at!).toLocaleDateString("vi-VN")} bởi{" "}
                            {grant.revoked_by_profile?.login_name || "Admin"}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Đang hiệu lực
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <div>Bởi: {grant.granted_by_profile?.login_name || "Admin"}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(grant.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!isRevoked && (
                        <button
                          onClick={() => handleRevoke(grant.id, userName, rootName)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" /> Thu hồi quyền
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
