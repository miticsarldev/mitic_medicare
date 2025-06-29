export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPatientMedicalRecords } from "@/app/dashboard/patient/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalRecordsClient } from "@/components/patient/medical-records";

export default async function MedicalRecordsPage() {
  // Fetch data server-side for initial load
  const medicalRecordsData = await getPatientMedicalRecords();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-2">
        Mon Dossier Médical
      </h1>
      <p className="text-muted-foreground mb-6">
        Consultez et gérez l&apos;ensemble de vos documents médicaux
      </p>

      <Suspense fallback={<MedicalRecordsLoading />}>
        <MedicalRecordsClient initialData={medicalRecordsData} />
      </Suspense>
    </div>
  );
}

function MedicalRecordsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar skeleton */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-px w-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="md:col-span-3">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-card shadow-sm overflow-hidden"
                  >
                    <Skeleton className="h-8 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-24 mb-3" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-full mb-3" />
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
