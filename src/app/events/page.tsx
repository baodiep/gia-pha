import { FamilyEventsListView } from "@/components/events/FamilyEventsListView";

export const metadata = {
  title: "Sự kiện dòng họ — Gia phả",
};

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <FamilyEventsListView />
    </main>
  );
}
