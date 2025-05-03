'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/hospital_doctor/patient');
        if (!response.ok) {
          throw new Error('Erreur de chargement des rendez-vous');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Erreur réseau", error);
      } finally {
        setIsLoading(false);
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

  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
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
    <div className="p-6 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Liste des Rendez-vous Patients</h1>
          <p className="text-muted-foreground">
            Gérez et consultez les rendez-vous de vos patients
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Input
              type="search"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number.parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="10 par page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 par page</SelectItem>
                <SelectItem value="10">10 par page</SelectItem>
                <SelectItem value="20">20 par page</SelectItem>
                <SelectItem value="50">50 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left">Nom</th>
                  <th className="px-6 py-3 text-left">Téléphone</th>
                  <th className="px-6 py-3 text-left">Statut</th>
                  <th className="px-6 py-3 text-left">Dernier rendez-vous</th>
                  <th className="px-6 py-3 text-left">Motif</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Chargement...
                    </td>
                  </tr>
                ) : paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {appointment.patientPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                          appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(appointment.scheduledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {appointment.reason || 'Non spécifié'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMedicalRecord(appointment.id)}
                        >
                          Voir la fiche
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Aucun rendez-vous trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} à{' '}
            {Math.min(totalItems, currentPage * itemsPerPage)} sur {totalItems} rendez-vous
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="px-2">...</span>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}