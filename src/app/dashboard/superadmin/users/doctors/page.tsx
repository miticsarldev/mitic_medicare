'use client';
import { useState } from "react";
import { Doctor } from "@/types";
import { doctorsData } from "@/data/doctors-data";
import { DoctorList } from "@/components/doctors-list";
import { DoctorCard } from "@/components/doctors-card";
import { DoctorForm } from "@/components/doctors-form";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(doctorsData);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setIsFormOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleDeleteDoctor = (id: number) => {
    setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
  };

  const handleViewDoctor = (doctor: Doctor) => {
    console.log("Voir les détails du médecin :", doctor);
  };

  const handleSubmitDoctor = (doctor: Doctor) => {
    if (doctors.some((d) => d.id === doctor.id)) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? doctor : d))
      );
    } else {
      setDoctors((prev) => [...prev, doctor]);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Médecins</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 ${
              viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
            } rounded-lg`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 ${
              viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-200"
            } rounded-lg`}
          >
            Cartes
          </button>
          <button
            onClick={handleAddDoctor}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Ajouter un Médecin
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <DoctorForm
              doctor={selectedDoctor}
              onSubmit={handleSubmitDoctor}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <DoctorList
          doctors={doctors}
          onEdit={handleEditDoctor}
          onDelete={handleDeleteDoctor}
          onView={handleViewDoctor} 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onEdit={handleEditDoctor}
              onDelete={handleDeleteDoctor}
              onView={handleViewDoctor} 
            />
          ))}
        </div>
      )}
    </div>
  );
}