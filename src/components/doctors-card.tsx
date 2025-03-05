import { Doctor } from "@/components/doctors-types";

interface DoctorCardProps {
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: number) => void;
}

export function DoctorCard({ doctor, onEdit, onDelete }: DoctorCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-xl font-bold dark:text-white">{doctor.name}</h3>
      {/* <p className="text-sm text-gray-500 dark:text-gray-400">
        {doctor.departement}
      </p> */}
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
            className="text-blue-600 hover:text-blue-900"
            onClick={() => onEdit(doctor)}
          >
            Modifier
          </button>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => onDelete(doctor.id)}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}