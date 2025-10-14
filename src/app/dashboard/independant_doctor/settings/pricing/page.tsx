export const dynamic = "force-dynamic";

import { loadSubscriptionSelfPage } from "@/app/actions/subscriptions-actions";
import SubscriptionSelfClient from "@/app/dashboard/hopital_admin/management/pricing/subscription-client";

export default async function SubscriptionSelfPage() {
  const data = await loadSubscriptionSelfPage();
  return <SubscriptionSelfClient {...data} />;
}
