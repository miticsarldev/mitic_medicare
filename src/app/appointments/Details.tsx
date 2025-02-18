import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function Details() {
  const [selectedDate, setSelectedDate] = useState("Lun. 03 Mars");
  const [selectedTime, setSelectedTime] = useState("11:00");
  const [reason, setReason] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-lg mt-6 flex-1">
        {/* Profil Médecin */}
        <div className="flex items-center gap-4 border-b pb-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div>
            <h2 className="text-xl font-bold text-blue-700">Dr Manares Bouabdallah Hamrouni</h2>
            <p className="text-gray-600">Dentiste - Gabes Medina Gabes</p>
          </div>
        </div>

        {/* Étapes */}
        <div className="flex justify-between items-center mt-6 text-gray-500 text-sm">
          <span className="text-yellow-500 font-bold">Date/Heure</span>
          <span>Vérification</span>
          <span>Confirmation</span>
          <span>Succès</span>
        </div>

        {/* Choix de la date */}
        <h3 className="mt-6 font-bold text-lg">Veuillez choisir la date du rendez-vous</h3>
        <div className="flex gap-2 mt-4">
          {["Mar. 25 Févr.", "Mer. 26 Févr.", "Jeu. 27 Févr.", "Ven. 28 Févr.", "Lun. 03 Mars"].map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedDate === date ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {date}
            </button>
          ))}
        </div>

        {/* Choix de l'heure */}
        <h3 className="mt-6 font-bold text-lg">Veuillez choisir l'heure du rendez-vous</h3>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {["08:00", "08:20", "09:00", "10:40", "11:00", "11:20"].map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedTime === time ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Motif de consultation */}
        <h3 className="mt-6 font-bold text-lg">Choisir le motif de consultation</h3>
        <input
          type="text"
          placeholder="Motif de consultation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mt-2"
        />

        {/* Boutons */}
        <div className="flex justify-between mt-6">
          <button className="text-red-500">Annuler</button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Confirmer</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
