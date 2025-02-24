"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { useSearchParams } from "next/navigation";
import { doctors } from "@/components/doctor-data";
import Navbar from "@/components/custum-navbar";

const Step3 = () => {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (/^\d{4}$/.test(code)) {
      router.push(`/step4?doctorId=${doctorId}`);
    } else {
      alert("Veuillez entrer un code valide à 4 chiffres.");
    }
  };

  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const doctor = doctors.find((doc) => doc.id === parseInt(doctorId || ""));

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
        <ProgressBar step={2} />

        <div className="bg-blue-500 dark:bg-blue-700 text-white p-4 mt-4 rounded-lg flex items-center space-x-4">
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

        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Veuillez saisir le code à 4 chiffres que nous venons de vous envoyer par email
        </p>
        <p className="text-gray-600 dark:text-gray-400 font-semibold">(admin@gmail.com)</p>

        <form onSubmit={handleSubmit} className="mt-4 flex justify-center items-center">
          <input
            type="text"
            className="border p-2 w-24 text-center text-lg tracking-widest rounded-l dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="####"
            value={code}
            maxLength={4}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="submit"
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded-r hover:bg-blue-600 dark:hover:bg-blue-800"
          >
            Valider
          </button>
        </form>

        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Votre connexion est sécurisée</p>
      </div>
    </>
  );
};

export default Step3;