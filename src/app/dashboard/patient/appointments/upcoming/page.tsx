"use client";

import { useState } from "react";
import { patientAppointments } from "@/data/appointment-data";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash } from "lucide-react";
import SearchBar from "@/components/search-filtre-section";
import { Pagination } from "@/components/pagination";

// Fenêtre modale pour la confirmation d'annulation
const CancelAppointmentModal = ({ isOpen, onCancel, onConfirm, appointmentId, close }) => {
  const [motif, setMotif] = useState("");

  const handleConfirm = () => {
    onConfirm(appointmentId, motif);
    close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h3 className="text-xl font-semibold mb-4">Annuler le rendez-vous</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Entrez le motif de l'annulation"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={close}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={handleConfirm}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
    const [listRdv, setAppointments] = useState(
        patientAppointments
          .filter(appointment => new Date(appointment.date) > new Date())
          .map(rdv => ({ ...rdv, status: rdv.status === "true" })) // Convertir status en boolean
      );
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleChange = (id: number) => {
    setAppointments(prev =>
      prev.map(rdv =>
        rdv.id === id ? { ...rdv, status: !rdv.status } : rdv
      )
    );
  };

  const handleCancelClick = (id) => {
    setSelectedAppointment(id);
    setModalOpen(true);
  };

  const handleCancelAppointment = (id, motif) => {
    setAppointments((prev) =>
      prev.filter((appointment) => appointment.id !== id)
    );
    // Logique d'envoi du motif d'annulation (par exemple, à une API)
    console.log(`Rendez-vous ${id} annulé pour le motif : ${motif}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Section "Prochains Rendez-vous" */}
      <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 rounded-xl">
        <div className="mx-auto max-w-screen-xl px-4 lg:px-4">
          <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            {/* Barre de recherche */}
            <SearchBar path="/ajouter-specialite" />

            {/* Tableau des Rendez-vous */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Médecin</th>
                    <th scope="col" className="px-4 py-3">Spécialité</th>
                    <th scope="col" className="px-4 py-3">Date</th>
                    <th scope="col" className="px-4 py-3">Statut</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listRdv.length > 0 ? (
                    listRdv.map((rdv) => (
                      <tr key={rdv.id} className="border-b dark:border-gray-700">
                        <td className="px-4 py-3">{rdv.doctor}</td>
                        <td className="px-4 py-3">{rdv.specialty}</td>
                        <td className="px-4 py-3">{rdv.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center cursor-pointer">
                            <Switch
                              checked={rdv.status}
                              onCheckedChange={() => handleChange(rdv.id)}
                              className="dark:bg-gray-700 dark:text-gray-300"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" title="Modifier">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Annuler"
                            onClick={() => handleCancelClick(rdv.id)}
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-gray-500">
                        Aucun rendez-vous à venir
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination totalPages={0} />
          </div>
        </div>
      </section>
    </div>
    {/* Modale de confirmation d'annulation */}
    <CancelAppointmentModal
      isOpen={isModalOpen}
      appointmentId={selectedAppointment}
      onCancel={() => setModalOpen(false)}
      onConfirm={handleCancelAppointment}
      close={() => setModalOpen(false)}
    />
    
  );
};

export default Page;
