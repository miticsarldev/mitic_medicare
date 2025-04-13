import RescheduleAppointmentPage from "@/components/patient/reschedule-appointment";
import { redirect } from "next/navigation";

export default function RescheduleAppointmentPageWrapper({
  params,
}: {
  params: { id: string };
}) {
  if (!params.id) {
    redirect("/dashboard/patient/appointments/all");
  }

  return <RescheduleAppointmentPage appointmentId={params.id} />;
}
