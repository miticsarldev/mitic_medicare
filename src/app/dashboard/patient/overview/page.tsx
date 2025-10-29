export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Calendar, Clock, FileText, Stethoscope, User } from "lucide-react";

import { PatientOverviewSkeleton } from "@/components/patient/skeletons";
import { PatientAppointmentsCard } from "@/components/patient/patient-appointments-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPatientOverview } from "../actions";
import { PatientHealthSummary } from "@/components/patient/patient-health-summary";
import { PatientMedicationCard } from "@/components/patient/patient-medication-card";
import { PatientVitalSignsCard } from "@/components/patient/patient-vital-signs-card";
import RenderBloodType from "@/components/render-bloodtype";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export default function PatientOverviewPage() {
  return (
    <Suspense fallback={<PatientOverviewSkeleton />}>
      <PatientOverviewContent />
    </Suspense>
  );
}

async function PatientOverviewContent() {
  const data = await getPatientOverview();

  const statusMap: Record<AppointmentStatus, { label: string; color: string }> =
    {
      PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
      CONFIRMED: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
      COMPLETED: { label: "Terminée", color: "bg-green-100 text-green-700" },
      CANCELED: { label: "Annulée", color: "bg-red-100 text-red-700" },
      NO_SHOW: { label: "Absent", color: "bg-gray-200 text-gray-600" },
    };

  const newStatus = data?.nextAppointment?.status;
  const { label, color } = (newStatus && statusMap[newStatus]) || {
    label: "Inconnu",
    color: "bg-muted text-muted-foreground",
  };

  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 p-4 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Prochain Rendez-vous
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {data.nextAppointment ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {data.nextAppointment.doctorName}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    color
                  )}
                >
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(
                    data.nextAppointment.scheduledAt
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  à{" "}
                  {new Date(
                    data.nextAppointment.scheduledAt
                  ).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Motif:</span>{" "}
                {data.nextAppointment.reason}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun rendez-vous à venir
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Dernière Mise à Jour Médicale
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {data.latestMedicalRecord ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {data.latestMedicalRecord.diagnosis}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(
                    data.latestMedicalRecord.createdAt
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Traitement:</span>{" "}
                {data.latestMedicalRecord.treatment}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Médecin:</span>{" "}
                {data.latestMedicalRecord.doctorName}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun dossier médical récent
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Informations Personnelles
          </CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Groupe Sanguin:</span>
              {data.patient.bloodType ? (
                <RenderBloodType bloodType={data.patient.bloodType} />
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Non spécifié
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Date de naissance:</span>{" "}
              {data?.patient?.user?.dateOfBirth
                ? new Date(data?.patient?.user?.dateOfBirth).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "Date de naissance non spécifiée"}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Allergies:</span>{" "}
              {data.patient.allergies || "Aucune allergie connue"}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Contact d&apos;urgence:</span>{" "}
              {data.patient.emergencyContact
                ? `${data.patient.emergencyContact} (${data.patient.emergencyPhone ? data.patient.emergencyPhone : "Téléphone non spécifié"})`
                : "Non spécifié"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Link href="/dashboard/patient/settings/profile">
            <Button variant="default" size="sm">
              Mettre à jour mes informations
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <PatientVitalSignsCard vitalSigns={data.vitalSigns} />
      <PatientMedicationCard
        prescriptions={data.activePrescriptions}
        latestPrescriptionOrder={data.latestPrescriptionOrder}
      />
      <PatientAppointmentsCard appointments={data.recentAppointments} />
      <PatientHealthSummary
        className="md:col-span-2 lg:col-span-3"
        medicalHistory={data.medicalHistory}
      />
    </div>
  );
}
