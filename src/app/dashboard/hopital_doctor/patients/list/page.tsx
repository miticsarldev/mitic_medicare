'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/pagination';

export default function PatientsList() {
  type Appointment = {
    id: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    age: number;
    bloodType: string;
    hospitalName: string;
    hospitalLocation: string;
    scheduledAt: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    type: string;
    reason: string;
    notes: string;
  };
  
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/hospital_doctor/patient');
        if (!response.ok) {
          throw new Error('Erreur de chargement des rendez-vous');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Erreur réseau", error);
      }
    };
  
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) =>
    (appointment.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (appointment.patientEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (appointment.patientPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (appointment.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewMedicalRecord = (patientId: string) => {
    router.push(`/dashboard/hopital_doctor/patients/medical-records/${patientId}`);
  };

  const formatStatus = (status: string) => {
    switch(status) {
      case 'ACCEPTED': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Liste des Rendez-vous Patients</h1>

      <input
        type="text"
        placeholder="Rechercher un patient..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border rounded-md mb-4 w-full dark:bg-gray-700 dark:text-gray-100"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dernière rendez-vous</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motif</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedAppointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{appointment.patientName}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{appointment.patientEmail}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{appointment.patientPhone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                    'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {formatStatus(appointment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(appointment.scheduledAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{appointment.reason || 'Non spécifié'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleViewMedicalRecord(appointment.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Voir la fiche
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}