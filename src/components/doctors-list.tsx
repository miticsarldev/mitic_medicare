import { Doctor } from "@/types";
import { FaEdit, FaTrash, FaRegEye } from "react-icons/fa"; // Import des icônes

interface DoctorListProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: number) => void;
  onView: (doctor: Doctor) => void; // Nouvelle fonction pour voir les détails
}

export function DoctorList({ doctors, onEdit, onDelete, onView }: DoctorListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">
              Nom
            </th>
            <th scope="col" className="px-4 py-3">
              Département
            </th>
            <th scope="col" className="px-4 py-3">
              Spécialité
            </th>
            <th scope="col" className="px-4 py-3">
              Email
            </th>
            <th scope="col" className="px-4 py-3">
              Téléphone
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
          {doctors.map((doctor) => (
            <tr key={doctor.id} className="border-b dark:border-gray-700">
              <td className="px-4 py-3">{doctor.name}</td>
              <td className="px-4 py-3">{doctor.departement}</td>
              <td className="px-4 py-3">{doctor.specialty}</td>
              <td className="px-4 py-3">{doctor.email}</td>
              <td className="px-4 py-3">{doctor.phone}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    doctor.status === "Actif"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {doctor.status}
                </span>
              </td>
              <td className="px-4 py-3 flex items-center space-x-2">
                <button
                  className="p-2 text-gray-600 hover:text-gray-900 border-2 border-blue-500 rounded-lg"
                  onClick={() => onView(doctor)}
                  title="Voir les détails"
                >
                  <FaRegEye size={10} />
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}