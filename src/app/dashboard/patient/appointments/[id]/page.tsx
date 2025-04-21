import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { getAppointmentById } from "@/app/actions/patient-actions/appointment-actions";
import { CancelAppointmentButton } from "@/components/patient/cancel-appointment-button";

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const appointment = await getAppointmentById(params.id);

  if (!appointment) {
    notFound();
  }

  const doctor = appointment.doctor;
  const hospital = appointment.hospital;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/patient/appointments/all">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Détails du rendez-vous
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations sur le rendez-vous</CardTitle>
            <CardDescription>
              Détails concernant votre prochain rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Date et heure</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.scheduledAt).toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.scheduledAt).toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )}
                  {appointment.endTime &&
                    ` - ${new Date(appointment.endTime).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}`}
                </p>
              </div>
            </div>

            <Separator />

            {hospital && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Lieu</h3>
                    <p className="text-sm text-muted-foreground">
                      {hospital.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hospital.address}, {hospital.city}, {hospital.state}{" "}
                      {hospital.zipCode}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h3 className="font-medium">Motif de la visite</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {appointment.reason || "Non spécifié"}
              </p>
            </div>

            {appointment.notes && (
              <div>
                <h3 className="font-medium">Notes supplémentaires</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {appointment.notes}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/dashboard/patient/appointments/reschedule/${appointment.doctorId}`}
              >
                <Button className="flex-1">Reprogrammer</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations sur le médecin</CardTitle>
            <CardDescription>
              Détails concernant votre professionnel de santé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src="/placeholder.svg?height=80&width=80"
                  alt={doctor.user.name}
                />
                <AvatarFallback>
                  {doctor.user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{doctor.user.name}</h3>
                <p className="text-muted-foreground">{doctor.specialization}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/patient/doctors/${doctor.id}`}>
                      Voir le profil
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium">Statut du rendez-vous</h3>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${
                    appointment.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : appointment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : appointment.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {appointment.status === "CONFIRMED"
                    ? "Confirmé"
                    : appointment.status === "PENDING"
                      ? "En attente"
                      : appointment.status === "COMPLETED"
                        ? "Terminé"
                        : "Annulé"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Avant votre rendez-vous</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    Veuillez arriver 15 minutes avant l&apos;heure prévue afin
                    de remplir les formalités nécessaires.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    Apportez votre carte d&apos;assurance, une pièce
                    d&apos;identité avec photo et la liste de vos médicaments
                    actuels.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    Si vous devez annuler ou reprogrammer, merci de le faire au
                    moins 24 heures à l&apos;avance.
                  </span>
                </li>
              </ul>
            </div>

            {(appointment.status === "CONFIRMED" ||
              appointment.status === "PENDING") && (
              <div className="flex justify-end">
                <CancelAppointmentButton appointmentId={appointment.id} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
