import { getDoctorDetailsById } from "@/app/actions/doctor-actions";
import DoctorProfilePage from "../DoctorProfilPage";
import { notFound } from "next/navigation";
import { DoctorType } from "@/types/doctor";



export default async function DoctorPage({ params }: { params: { id: string } }) {
    try {
        const doctor: DoctorType = await getDoctorDetailsById(params.id);
        return <DoctorProfilePage doctor={doctor} />;
    } catch (error) {
        console.error("Erreur de chargement du médecin:", error);
        return notFound();
    }
}
