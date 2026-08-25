import { AdminTrashView } from "@/components/admin/AdminTrashView";

export const metadata = {
  title: "Thùng rác & Phục hồi — Admin Gia phả",
};

export default function AdminTrashPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminTrashView />
    </main>
  );
}
