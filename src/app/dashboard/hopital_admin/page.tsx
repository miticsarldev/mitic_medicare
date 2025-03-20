import { redirect } from "next/navigation";

export default function PatientPage() {
  redirect("/dashboard/hopital_admin/overview");
}
