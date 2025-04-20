import BookAppointmentByDoctorIdPage from "@/components/patient/book-appointment-by-doctor";
import { redirect } from "next/navigation";

export default function BookByDoctorIdAppointmentPageWrapper({
  params,
}: {
  params: { id: string };
}) {
  if (!params.id) {
    redirect("/dashboard/patient/appointments/all");
  }

  return <BookAppointmentByDoctorIdPage doctorId={params.id} />;
}
