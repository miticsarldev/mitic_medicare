import { Calendar, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment } from "@/app/dashboard/patient/types";
import { RenderAppointmentStatus } from "../ui/render-appointment-status";
import { AppointmentStatus } from "@prisma/client";

interface PatientAppointmentsCardProps {
  appointments: Appointment[];
}

export function PatientAppointmentsCard({
  appointments,
}: PatientAppointmentsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Rendez-vous Récents
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start justify-between rounded-md border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {appointment.doctorName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(appointment.scheduledAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}{" "}
                      à{" "}
                      {new Date(appointment.scheduledAt).toLocaleTimeString(
                        "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
                {RenderAppointmentStatus({
                  status: appointment.status as AppointmentStatus,
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun rendez-vous récent
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
