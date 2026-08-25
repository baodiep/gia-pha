import { AdminAccountManagementView } from "@/components/admin/AdminAccountManagementView";

export const metadata = {
  title: "Quản lý tài khoản — Admin Gia phả",
};

export default function AdminAccountsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminAccountManagementView />
    </main>
  );
}
