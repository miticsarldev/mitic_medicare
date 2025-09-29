// =============================================================
// File: app/(dashboard)/superadmin/finance/revenue/page.tsx
// =============================================================
import { getRevenueStats } from "@/app/actions/revenue-ations";
import RevenueClient from "./revenue-client";
// import { getRevenueStats } from "@/app/actions/revenue-actions";

export default async function Page() {
  // Default range: last 90 days
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 89);

  const initial = await getRevenueStats({
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
    plan: "ALL",
    status: "ALL",
    type: "ALL",
  });

  return <RevenueClient initial={initial} />;
}
