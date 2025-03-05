import { Doctor } from "@/components/doctors-types";

interface DoctorListProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: number) => void;
}

export function DoctorList({ doctors, onEdit, onDelete }: DoctorListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">
              Nom
            </th>
            <th scope="col" className="px-4 py-3">
              Departement
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}