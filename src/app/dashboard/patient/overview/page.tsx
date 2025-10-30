export const dynamic = "force-dynamic";

import { Suspense } from "react";
import {
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

import { PatientOverviewSkeleton } from "@/components/patient/skeletons";
import { PatientAppointmentsCard } from "@/components/patient/patient-appointments-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPatientOverview, getPatientAppointmentStats } from "../actions";
import { PatientHealthSummary } from "@/components/patient/patient-health-summary";
import { PatientMedicationCard } from "@/components/patient/patient-medication-card";
import { PatientVitalSignsCard } from "@/components/patient/patient-vital-signs-card";
import RenderBloodType from "@/components/render-bloodtype";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PatientOverviewPage() {
  return (
    <Suspense fallback={<PatientOverviewSkeleton />}>
      <PatientOverviewContent />
    </Suspense>
  );
}

async function PatientOverviewContent() {
  const data = await getPatientOverview();
  const stats = await getPatientAppointmentStats("upcoming");

  const statusMap: Record<AppointmentStatus, { label: string; color: string }> =
    {
      PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
      CONFIRMED: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
      COMPLETED: { label: "Terminée", color: "bg-green-100 text-green-700" },
      CANCELED: { label: "Annulée", color: "bg-red-100 text-red-700" },
      NO_SHOW: { label: "Absent", color: "bg-gray-200 text-gray-600" },
    };

  const newStatus = data?.nextAppointment?.status;
  const { label } = (newStatus && statusMap[newStatus]) || {
    label: "Inconnu",
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de votre santé
          </p>
        </div>
        <Link href="/dashboard/patient/appointments/book">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Prendre un rendez-vous
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total RDV</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Annulés</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.canceled}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noShow}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Prochain Rendez-vous
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.nextAppointment ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage
                      src={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (data.nextAppointment.doctor as any).user.profile
                          ?.avatarUrl || "/placeholder.svg"
                      }
                      alt={data.nextAppointment.doctorName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {data.nextAppointment.doctorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">
                        {data.nextAppointment.doctorName}
                      </h4>
                      <Badge
                        variant={
                          data.nextAppointment.status === "CONFIRMED"
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          data.nextAppointment.status === "CONFIRMED"
                            ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                        )}
                      >
                        {label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
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
                  </div>
                </div>
                {data.nextAppointment.reason && (
                  <div className="text-sm text-foreground/80 bg-muted/50 rounded-md p-2">
                    <span className="font-medium">Motif:</span>{" "}
                    {data.nextAppointment.reason}
                  </div>
                )}
                <Link href="/dashboard/patient/appointments/all">
                  <Button variant="outline" className="w-full" size="sm">
                    Voir tous mes rendez-vous
                  </Button>
                </Link>
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
                  ? new Date(
                      data?.patient?.user?.dateOfBirth
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
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
    </div>
  );
}
