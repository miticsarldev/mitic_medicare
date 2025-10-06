export const dynamic = "force-dynamic";

import { Suspense } from "react";
import {
  getDashboardStats,
  getPendingApprovals,
  getSubscriptionStats,
} from "./actions";
import { DashboardSkeleton } from "./skeleton";
import { DashboardContent } from "./content";

export default async function AdminDashboardPage() {
  // Fetch all required data in parallel
  const [dashboardStats, pendingApprovals, subscriptionStats] =
    await Promise.all([
      getDashboardStats(),
      getPendingApprovals(),
      getSubscriptionStats(),
    ]);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Bienvenue dans votre espace d&apos;administration. Voici un aperçu de
          votre plateforme.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          dashboardStats={dashboardStats}
          pendingApprovals={pendingApprovals}
          subscriptionStats={subscriptionStats}
        />
      </Suspense>
    </div>
  );
}
