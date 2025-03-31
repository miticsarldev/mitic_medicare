import { Suspense } from "react";
import { getAppointmentsData } from "./actions";
import { AppointmentsSkeleton } from "./appointments-skeleton";
import { AppointmentsAnalytics } from "./appointments-analytics";
import { AppointmentsTable } from "./appointments-table";

export default async function AppointmentsPage() {
  const appointmentsData = await getAppointmentsData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rendez-vous</h2>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de tous les rendez-vous sur la plateforme
        </p>
      </div>

      <Suspense fallback={<AppointmentsSkeleton />}>
        <AppointmentsAnalytics initialData={appointmentsData} />
        <AppointmentsTable initialData={appointmentsData} />
      </Suspense>
    </div>
  );
}
