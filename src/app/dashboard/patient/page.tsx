import { redirect } from "next/navigation";

export default function PatientPage() {
  redirect("/dashboard/patient/overview");
}
