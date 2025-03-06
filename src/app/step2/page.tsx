"use client";

import { useSearchParams } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import Link from "next/link";
import { doctors } from "@/components/doctor-data";
import Navbar from "@/components/custum-navbar";
import Image from "next/image";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

const Step2 = () => {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const doctor = doctors.find(
    (doc: { id: number }) => doc.id === parseInt(doctorId || "")
  );

  if (!doctor) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <p className="text-center text-red-500">Médecin non trouvé</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <ProgressBar step={1} />

        <div className="bg-blue-500 dark:bg-blue-700 text-white p-4 mt-4 rounded-lg flex items-center space-x-4">
          <Image
            src={doctor.image}
            alt="Doctor profile"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{doctor.name}</h2>
            <p className="text-sm">{doctor.specialty}</p>
            <p className="text-sm">{doctor.location}</p>
          </div>
        </div>

        {/* Section de la date et de l'heure */}
        <div className="p-4 border-b dark:border-gray-600">
          <p className="text-sm dark:text-gray-300">Votre rendez-vous le :</p>
          <p className="font-semibold dark:text-white">
            📅 21/02/2025 &nbsp; ⏰ 08:20
          </p>
        </div>

        <div className="p-4">
          <h3 className="text-center font-semibold dark:text-white">
            Saisissez vos informations
          </h3>
          <input
            type="text"
            placeholder="Votre nom complet"
            className="w-full p-2 border rounded mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div className="flex items-center mt-2">
            <select className="border p-2 rounded-l dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option>+223</option>
            </select>
            <input
              type="text"
              placeholder="Votre numéro"
              className="w-full p-2 border rounded-r dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            Un code va vous être envoyé sur ce numéro pour valider votre RDV.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            En cliquant sur « Suivant », vous acceptez les{" "}
            <a href="#" className="text-blue-500 dark:text-blue-300">
              CGU
            </a>{" "}
            ainsi que la{" "}
            <a href="#" className="text-blue-500 dark:text-blue-300">
              politique de confidentialité
            </a>{" "}
            du site.
          </p>
          <div className="mt-4 text-center">
            <Link
              href={`/step3?doctorId=${doctorId}`}
              className="bg-blue-500 dark:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Suivant
            </Link>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <input type="checkbox" className="mr-2 dark:accent-blue-500" />{" "}
              Votre connexion est sécurisée
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<Loader size="lg" />}>
      <Step2 />
    </Suspense>
  );
}
