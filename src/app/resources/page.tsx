import { FamilyResourcesView } from "@/components/resources/FamilyResourcesView";
import { getPublishedFamilyResourcesAction } from "@/lib/resources/actions";

export const metadata = {
  title: "Tư liệu & Lịch sử dòng họ — Gia phả dòng họ",
};

export default async function ResourcesPage() {
  const res = await getPublishedFamilyResourcesAction();
  return <FamilyResourcesView initialResources={res.data || []} />;
}
