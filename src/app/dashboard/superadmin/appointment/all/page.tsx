import { Suspense } from "react";
import { getAppointmentsData } from "./actions";
import { AppointmentsSkeleton } from "./appointments-skeleton";
import { AppointmentsAnalytics } from "./appointments-analytics";
import { AppointmentsTable } from "./appointments-table";

export const dynamic = "force-dynamic";

type Search = { from?: string; to?: string };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { from, to } = searchParams;
  const appointmentsData = await getAppointmentsData({ from, to });

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rendez-vous</h2>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de tous les rendez-vous sur la plateforme
        </p>
      </div>

      <Suspense fallback={<AppointmentsSkeleton />}>
        <AppointmentsAnalytics
          initialData={appointmentsData}
          initialRange={{
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
          }}
        />
        <AppointmentsTable initialData={appointmentsData} />
      </Suspense>
    </div>
  );
}
