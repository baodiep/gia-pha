"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getAdminAccounts,
  adminSetAccountStatus,
  adminCreateAccount,
  adminToggleAdminRole,
  AccountWithPerson,
} from "@/features/admin/account-actions";
import { AccountStatus } from "@/types/domain";
import { BackButton } from "@/components/ui/BackButton";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  KeyRound,
  GitBranch,
} from "lucide-react";

export function AdminAccountManagementView() {
  const [accounts, setAccounts] = useState<AccountWithPerson[]>([]);
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newTempPassword, setNewTempPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [createErrors, setCreateErrors] = useState<{
    phone?: string;
    name?: string;
    password?: string;
  }>({});
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAccounts = () => {
    startTransition(async () => {
      try {
        const data = await getAdminAccounts({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: search.trim() || undefined,
        });
        setAccounts(data);
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    });
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = (userId: string, newStatus: AccountStatus) => {
    startTransition(async () => {
      const res = await adminSetAccountStatus(userId, newStatus);
      if (res.success) {
        loadAccounts();
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalMessage(null);

    const errors: { phone?: string; name?: string; password?: string } = {};
    if (!newPhone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    }
    if (!newName.trim()) {
      errors.name = "Vui lòng nhập họ và tên";
    }
    if (!newTempPassword.trim()) {
      errors.password = "Vui lòng nhập mật khẩu tạm thời";
    } else if (newTempPassword.length < 6) {
      errors.password = "Mật khẩu tạm thời phải từ 6 ký tự trở lên";
    }

    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const res = await adminCreateAccount({
      phone: newPhone.trim(),
      fullName: newName.trim(),
      temporaryPassword: newTempPassword,
      isAdmin: newIsAdmin,
    });

    if (res.success) {
      setModalMessage({ type: "success", text: res.message || "Tạo tài khoản thành công" });
      setTimeout(() => {
        setShowCreateModal(false);
        setNewPhone("");
        setNewName("");
        setNewTempPassword("");
        setNewIsAdmin(false);
        setCreateErrors({});
        setModalMessage(null);
        loadAccounts();
      }, 1200);
    } else {
      setModalMessage({ type: "error", text: res.error || "Tạo tài khoản thất bại" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Header & Back Button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/admin" label="Quay lại Quản trị" />
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-slate-800 dark:text-slate-200" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Quản lý tài khoản người dùng
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Kích hoạt tài khoản đăng ký mới, cấp mật khẩu tạm và phân quyền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/permissions"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 shadow-sm"
          >
            <GitBranch className="h-4 w-4" />
            <span>Phân quyền nhánh</span>
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {(["ALL", "PENDING", "ACTIVE", "SUSPENDED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {st === "ALL"
                ? "Tất cả"
                : st === "PENDING"
                ? "Chờ duyệt (PENDING)"
                : st === "ACTIVE"
                ? "Đang hoạt động (ACTIVE)"
                : "Tạm khóa (SUSPENDED)"}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadAccounts()}
            placeholder="Tìm theo số điện thoại, tên login..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải danh sách tài khoản...</div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500 dark:border-slate-800">
          Không có tài khoản nào theo bộ lọc đã chọn.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">Tên đăng nhập / SĐT</th>
                <th className="py-3 px-4 font-medium">Hồ sơ liên kết</th>
                <th className="py-3 px-4 font-medium">Vai trò</th>
                <th className="py-3 px-4 font-medium">Trạng thái</th>
                <th className="py-3 px-4 font-medium">Ngày đăng ký</th>
                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <div>{acc.login_name}</div>
                    <div className="text-[11px] font-normal text-slate-400">{acc.phone_normalized}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {acc.person ? (
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">{acc.person.full_name}</span>
                        <div className="text-[10px] text-slate-400">
                          {acc.person.generation_no && `Đời ${acc.person.generation_no} • `}
                          {acc.person.branch_code}
                        </div>
                      </div>
                    ) : (
                      <span className="italic text-slate-400">Chưa liên kết</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {acc.is_admin ? (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn chuyển tài khoản ${acc.login_name} về làm Thành viên thường?`)) {
                            startTransition(async () => {
                              const res = await adminToggleAdminRole(acc.id, false);
                              if (res.success) loadAccounts();
                              else alert(res.error);
                            });
                          }
                        }}
                        title="Bấm để chuyển về thành viên thường"
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300"
                      >
                        <Shield className="h-3 w-3" /> Admin (Bấm để gỡ)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn thăng cấp tài khoản ${acc.login_name} lên làm Quản trị viên (Admin)?`)) {
                            startTransition(async () => {
                              const res = await adminToggleAdminRole(acc.id, true);
                              if (res.success) loadAccounts();
                              else alert(res.error);
                            });
                          }
                        }}
                        title="Bấm để thăng cấp lên Admin"
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        Thành viên (Bấm để đặt Admin)
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {acc.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="h-3 w-3" /> Chờ duyệt
                      </span>
                    )}
                    {acc.status === "ACTIVE" && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle className="h-3 w-3" /> Hoạt động
                      </span>
                    )}
                    {acc.status === "SUSPENDED" && (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <AlertCircle className="h-3 w-3" /> Tạm khóa
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {new Date(acc.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {acc.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusChange(acc.id, "ACTIVE")}
                          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                        >
                          <UserCheck className="h-3 w-3" /> Kích hoạt
                        </button>
                      )}

                      {acc.status === "ACTIVE" && !acc.is_admin && (
                        <button
                          onClick={() => handleStatusChange(acc.id, "SUSPENDED")}
                          className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
                        >
                          <UserX className="h-3 w-3" /> Khóa
                        </button>
                      )}

                      {acc.status === "SUSPENDED" && (
                        <button
                          onClick={() => handleStatusChange(acc.id, "ACTIVE")}
                          className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                          <UserCheck className="h-3 w-3" /> Mở lại
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Tạo tài khoản hộ thành viên
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Tài khoản do Admin tạo sẽ có trạng thái Hoạt động và yêu cầu đổi mật khẩu ở lần đăng nhập đầu.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại (SĐT đăng nhập) *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0912345678"
                  value={newPhone}
                  onChange={(e) => {
                    setNewPhone(e.target.value);
                    if (createErrors.phone) setCreateErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none dark:bg-slate-800 dark:text-white ${
                    createErrors.phone
                      ? "border-rose-500 bg-rose-50/50"
                      : "border-slate-200 focus:ring-1 focus:ring-slate-900 dark:border-slate-700"
                  }`}
                />
                {createErrors.phone && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{createErrors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên thành viên *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Nam"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none dark:bg-slate-800 dark:text-white ${
                    createErrors.name
                      ? "border-rose-500 bg-rose-50/50"
                      : "border-slate-200 focus:ring-1 focus:ring-slate-900 dark:border-slate-700"
                  }`}
                />
                {createErrors.name && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{createErrors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu tạm thời *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newTempPassword}
                    onChange={(e) => {
                      setNewTempPassword(e.target.value);
                      if (createErrors.password) setCreateErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs focus:outline-none dark:bg-slate-800 dark:text-white font-mono ${
                      createErrors.password
                        ? "border-rose-500 bg-rose-50/50"
                        : "border-slate-200 focus:ring-1 focus:ring-slate-900 dark:border-slate-700"
                    }`}
                  />
                </div>
                {createErrors.password && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{createErrors.password}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAdminCheckbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isAdminCheckbox" className="text-xs text-slate-700 dark:text-slate-300">
                  Cấp quyền Quản trị viên (Admin)
                </label>
              </div>

              {modalMessage && (
                <div
                  className={`rounded-lg p-2.5 text-xs ${
                    modalMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {modalMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
