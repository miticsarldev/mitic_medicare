import { getAllPlansWithStats } from "@/app/actions/plan-config-actions";
import PlansClient from "./plans-client";

export default async function PlansPage() {
  const plans = await getAllPlansWithStats();
  return <PlansClient plans={plans} />;
}
