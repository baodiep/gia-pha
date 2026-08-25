import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata = {
  title: "Tổng quan Quản trị — Gia phả",
};

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboardView />
    </main>
  );
}
