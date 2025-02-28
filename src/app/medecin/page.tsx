"use client";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Edit, Trash } from "lucide-react";
import { doctorData } from "@/data/appointment-data"; 
import Header from "@/components/dashboard-header";
import SearchBar from "@/components/search-filtre-section";
import Pagination from "@/components/pagination-dashboard";  
import { Switch } from "@/components/ui/switch";

export default function Page() { 
    const [doctors, setDoctors] = useState(doctorData);

    const handleChange = (id: number) => {
        setDoctors((prev) =>
            prev.map((med) =>
                med.id === id ? { ...med, status: !med.status } : med
            )
        );
    };

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
                <SearchBar />

                {/* Tableau des Rendez-vous */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Nom Complet
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Specialité
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Email
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Numéro
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Adresse
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Statut
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((medecin) => (
                        <tr
                          key={medecin.id}
                          className="border-b dark:border-gray-700"
                        >
                          <td className="px-4 py-3">{medecin.lastName} {medecin.firstName}</td>
                          <td className="px-4 py-3">{medecin.speciality}</td>
                          <td className="px-4 py-3">{medecin.email}</td>
                          <td className="px-4 py-3">{medecin.phone}</td>
                          <td className="px-4 py-3">{medecin.address}</td> 
                          <td className="px-4 py-3"> 
                            <div className="flex items-center cursor-pointer">
                            <Switch
                                checked={medecin.status}
                                onCheckedChange={() => handleChange(medecin.id)}
                                className="dark:bg-gray-700 dark:text-gray-300"
                            />
                            </div>
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
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
    </SidebarProvider>
  );
}