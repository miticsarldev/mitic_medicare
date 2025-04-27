import { notFound } from "next/navigation";
import { Patient } from "@/types/patient";
import PatientProfilePage from "../PatientProfilPage";
import { getPatientById } from "@/app/actions/patient-actions";

interface PageProps {
    params: { id: string };
}
export default async function PatientPage({ params }: PageProps) {
    try {
        const patient: Patient = await getPatientById(params.id);
        return <PatientProfilePage patient={patient} />;
    } catch (error) {
        console.error("Erreur de chargement du patient :", error);
        return notFound();
    }
}
