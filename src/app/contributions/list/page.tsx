import { ContributionsListView } from "@/components/contributions/ContributionsListView";
import { getContributionsListAction } from "@/lib/contributions/contributions-actions";

export const metadata = {
  title: "Sổ công đức & Đóng góp — Gia phả dòng họ",
};

export default async function ContributionsListPage() {
  const res = await getContributionsListAction();
  return (
    <ContributionsListView
      initialContributions={res.contributions}
      initialStats={res.stats}
    />
  );
}
