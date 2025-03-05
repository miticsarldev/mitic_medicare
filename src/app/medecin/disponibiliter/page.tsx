"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Edit, Trash, Eye } from "lucide-react";
import { doctorAvailability } from "@/data/appointment-data"; 
import Header from "@/components/dashboard-header";
import SearchBar from "@/components/search-filtre-section";
import Pagination from "@/components/pagination-dashboard";  
import Modal from "@/components/ui/modal";
import Link from "next/link";

export default function Page() { 
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fonction pour afficher les créneaux d'un médecin
    const openModal = (doctorName: string) => {
        setSelectedDoctor(doctorName);
        setIsModalOpen(true);
    };

    // Récupérer les disponibilités du médecin sélectionné
    // const doctorSlots = doctorAvailability.find((doc) => doc.doctorName === selectedDoctor)?.slots || [];
    const doctorSlots = doctorAvailability.find((doc) => doc.doctorName === selectedDoctor)?.slots || [];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Section "Liste des Rendez-vous" */}
                    <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 rounded-xl">
                        <div className="mx-auto max-w-screen-xl px-4 lg:px-4">
                            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                                {/* Barre de recherche et boutons */}
                                <SearchBar path="/ajouter-specialite"/>

                                {/* Tableau des Rendez-vous */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3">Médecin</th>
                                                <th className="px-4 py-3">Disponibilité</th>
                                                <th className="px-4 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {doctorAvailability.map((doctor) => (
                                                <tr key={doctor.id} className="border-b dark:border-gray-700">
                                                    <td className="px-4 py-3">{doctor.doctorName}</td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => openModal(doctor.doctorName)}
                                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                            Voir
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 flex items-center space-x-2">
                                                        <Link href="/form/AppointmentForm">
                                                        <button className="text-blue-600 hover:text-blue-900" title="Modifier">
                                                            <Edit className="h-5 w-5" />
                                                        </button>
                                                        </Link>
                                                        <button className="text-red-600 hover:text-red-900" title="Supprimer">
                                                            <Trash className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <Pagination />
                            </div>
                        </div>
                    </section>
                </div>
            </SidebarInset>

            {/* Modal pour afficher les disponibilités */}
            {isModalOpen && selectedDoctor && (
                <Modal onClose={() => setIsModalOpen(false)} title={`Disponibilités de ${selectedDoctor}`}>
                    <ul className="p-4 space-y-2">
                        {doctorSlots.length > 0 ? (
                            doctorSlots.map((slot, index) => (
                                <li key={index} className="text-gray-700 dark:text-gray-300">
                                   {slot.day} - 🕒 {slot.time}
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Aucune disponibilité</p>
                        )}
                    </ul>
                </Modal>
            )}
        </SidebarProvider>
    );
}
