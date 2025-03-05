import { useState } from "react";
import { Doctor } from "@/components/doctors-types";

interface DoctorFormProps {
  doctor?: Doctor| null;
  onSubmit: (doctor: Doctor) => void;
  onCancel: () => void;
}

export function DoctorForm({ doctor, onSubmit, onCancel }: DoctorFormProps) {
  const [name, setName] = useState(doctor?.name || "");
  const [departement, setDepartement] = useState(doctor?.departement || "");
  const [specialty, setSpecialty] = useState(doctor?.specialty || "");
  const [email, setEmail] = useState(doctor?.email || "");
  const [phone, setPhone] = useState(doctor?.phone || "");
  const [status, setStatus] = useState<"Actif" | "Inactif">(
    doctor?.status || "Actif"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: doctor?.id || Date.now(),
      name,
      departement,
      specialty,
      email,
      phone,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white">
          Nom
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label htmlFor="departement" className="block text-sm font-medium text-gray-700 dark:text-white">
        Departement
        </label>
        <input
          id="departement"
          type="text"
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-white">
          Spécialité
        </label>
        <input
          id="specialty"
          type="text"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-white">
          Téléphone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-white">
          Statut
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "Actif" | "Inactif")}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {doctor ? "Modifier" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}