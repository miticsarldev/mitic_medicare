import { Doctor } from "@/types";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"; 

interface DoctorCardProps {
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: number) => void;
  onView: (doctor: Doctor) => void; 
}

export function DoctorCard({ doctor, onEdit, onDelete, onView }: DoctorCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-xl font-bold dark:text-white">{doctor.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {doctor.specialty}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.email}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.phone}</p>
      <div className="flex items-center justify-between mt-4">
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            doctor.status === "Actif"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {doctor.status}
        </span>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-600 hover:text-gray-900 border-2 border-blue-500 rounded-lg"
            onClick={() => onView(doctor)} 
            title="Voir les détails"
          >
            <FaEye size={10} />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-900 border-2 border-yellow-500 rounded-lg"
            onClick={() => onEdit(doctor)}
            title="Modifier"
          >
            <FaEdit size={10} />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-900 border-2 border-red-500 rounded-lg"
            onClick={() => onDelete(doctor.id)}
            title="Supprimer"
          >
            <FaTrash size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}