export const dynamic = "force-dynamic";

import { loadSubscriptionSelfPage } from "@/app/actions/subscriptions-actions";
import SubscriptionSelfClient from "./subscription-client";

export default async function SubscriptionSelfPage() {
  const data = await loadSubscriptionSelfPage();

  return <SubscriptionSelfClient {...data} />;
}
