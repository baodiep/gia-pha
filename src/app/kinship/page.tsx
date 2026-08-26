import { KinshipLookupView } from "@/components/kinship/KinshipLookupView";
import { getPersons } from "@/features/persons/actions";

export const metadata = {
  title: "Tra cứu quan hệ họ hàng — Gia phả dòng họ",
};

export default async function KinshipPage() {
  const persons = await getPersons();
  return <KinshipLookupView initialPersons={persons} />;
}
