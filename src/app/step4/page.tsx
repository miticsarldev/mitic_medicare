"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doctors } from "@/components/doctor-data";
import Navbar from "@/components/navbar";
import { ProgressBar } from "@/components/progress-bar";

const Step4 = () => {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const doctor = doctors.find((doc) => doc.id === parseInt(doctorId || ""));

  if (!doctor) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg text-center">
        <p className="text-red-500">Médecin non trouvé</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
        <ProgressBar step={3} />

        <div className="bg-blue-500 text-white p-4 mt-4 rounded-lg flex items-center space-x-4">
          <img
            src={doctor.image}
            alt="Doctor profile"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{doctor.name}</h2>
            <p className="text-sm">{doctor.specialty}</p>
            <p className="text-sm">{doctor.location}</p>
          </div>
        </div>

        <div className="mt-6 text-lg font-medium text-center">
          Félicitations, votre rendez-vous a été pris avec succès !
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded-lg">
            Accueil
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Votre connexion est sécurisée
        </p>
      </div>
    </>
  );
};

export default Step4;
