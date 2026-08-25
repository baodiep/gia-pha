import { MemorialListView } from "@/components/memorials/MemorialListView";

export const metadata = {
  title: "Tưởng niệm & Ngày giỗ — Gia phả",
};

export default function MemorialsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MemorialListView />
    </main>
  );
}
