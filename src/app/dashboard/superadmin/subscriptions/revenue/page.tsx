import { getRevenueStats } from "@/app/actions/revenue-ations";
import RevenueClient from "./revenue-client";

export default async function Page() {
  // last 120 days
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 119);

  const initial = await getRevenueStats({
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
    plan: "ALL",
    status: "ALL",
    type: "ALL",
  });

  return <RevenueClient initial={initial} />;
}
