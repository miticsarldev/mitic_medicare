"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import Navbar from "@/components/custum-navbar";
import { doctors } from "@/components/doctor-data";

const AppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showMoreHours, setShowMoreHours] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const params = useParams(); 
  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;

  const dates = ["24 Fév.", "25 Fév.", "26 Fév.", "27 Fév.", "28 Fév.", "28 Fév."];
  const hours = [
    "08:00", "08:20", "08:40", "09:00", "09:20", "09:40", "10:00", "10:20", "10:40",
    "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    "20:00", "21:00", "22:00",
  ];
  const doctor = doctors.find((doc: { id: number; }) => doc.id === parseInt(doctorId || "")); 

  if (!doctor) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
        <p className="text-center text-red-500">Médecin non trouvé</p>
      </div>
    );
  }

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep(1);
      router.push(`/step2?doctorId=${doctorId}`); 
    } else {
      alert("Veuillez sélectionner une date et une heure.");
    }
  };

  return (   
    <>
    <Navbar />
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
    <ProgressBar step={1} />

    {/* Section du médecin */}
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
      <h2 className="text-lg font-semibold mt-4">Veuillez choisir la date du rendez-vous</h2>
      <div className="flex space-x-2 mt-2">
        {dates.map((date, index) => (
          <button
            key={index}
            className={`px-4 py-2 border rounded ${selectedDate === date ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </button>
        ))}
      </div>
      <h2 className="text-lg font-semibold mt-4">Veuillez choisir l'heure du rendez-vous</h2>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {(showMoreHours ? hours : hours.slice(0, 6)).map((hour, index) => (
          <button
            key={index}
            className={`px-4 py-2 border rounded ${selectedTime === hour ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setSelectedTime(hour)}
          >
            {hour}
          </button>
        ))}
      </div>
      {!showMoreHours && (
        <button className="text-blue-500 mt-2" onClick={() => setShowMoreHours(true)}>
          Voir plus d'horaires
        </button>
      )}
      <div className="mt-4">
        <label className="block text-gray-700">Motif de consultation</label>
        <input type="text" className="w-full p-2 border rounded mt-1" />
      </div>
      <div className="flex justify-between mt-4">
        <button className="text-red-500">Annuler</button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleConfirm}
        >
          Confirmer
        </button>
      </div>
    </div></>
  );
};

export default AppointmentPage;