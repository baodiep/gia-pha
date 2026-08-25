import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

export const metadata = {
  title: "Cài đặt Logo & Tên dòng họ — Admin Gia phả",
};

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSettingsView />
    </main>
  );
}
