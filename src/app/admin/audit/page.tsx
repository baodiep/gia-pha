import { AdminAuditLogsView } from "@/components/admin/AdminAuditLogsView";

export const metadata = {
  title: "Nhật ký kiểm toán (Audit Log) — Admin Gia phả",
};

export default function AdminAuditPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminAuditLogsView />
    </main>
  );
}
