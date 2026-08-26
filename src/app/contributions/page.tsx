import { ContributionQrView } from "@/components/contributions/ContributionQrView";
import { getActiveContributionSettingsAction } from "@/lib/contributions/settings-actions";

export const metadata = {
  title: "Đóng góp dòng họ & Quỹ khuyến học — Gia phả dòng họ",
};

export default async function ContributionPage() {
  const res = await getActiveContributionSettingsAction();
  return <ContributionQrView settings={res.settings || null} />;
}
