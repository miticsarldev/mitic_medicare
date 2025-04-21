import { getDoctorById } from "@/app/actions/doctor-actions";
import DoctorProfile from "@/components/patient/doctor-profile-page";
import { notFound } from "next/navigation";
import { DoctorProfileComplete } from "../../types";

export default async function DoctorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const doctor: DoctorProfileComplete | null = await getDoctorById(params.id);
  if (!doctor) return notFound();

  return <DoctorProfile doctor={doctor!} />;
}
