import { AdminPermissionManagementView } from "@/components/admin/AdminPermissionManagementView";

export const metadata = {
  title: "Phân quyền quản lý nhánh — Admin Gia phả",
};

export default function AdminPermissionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminPermissionManagementView />
    </main>
  );
}
