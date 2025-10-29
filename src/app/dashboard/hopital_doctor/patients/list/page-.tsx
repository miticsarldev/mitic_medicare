'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PatientAppointment = {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  bloodType: string;
  scheduledAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reason: string;
};

export default function PatientsList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const getBloodTypeInfo = (bloodType: string) => {
  const bloodTypeMap: Record<string, { display: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
    'A_POSITIVE': { display: 'A+', variant: 'destructive' },
    'A_NEGATIVE': { display: 'A-', variant: 'outline' },
    'B_POSITIVE': { display: 'B+', variant: 'destructive' },
    'B_NEGATIVE': { display: 'B-', variant: 'outline' },
    'AB_POSITIVE': { display: 'AB+', variant: 'destructive' },
    'AB_NEGATIVE': { display: 'AB-', variant: 'outline' },
    'O_POSITIVE': { display: 'O+', variant: 'destructive' },
    'O_NEGATIVE': { display: 'O-', variant: 'outline' }
  };
  
  return bloodTypeMap[bloodType] || { display: bloodType, variant: 'secondary' };
};

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/hospital_doctor/patient');
        if (!response.ok) {
          throw new Error('Erreur de chargement des patients');
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
    (appointment.patientPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewMedicalRecord = (appointmentId: string) => {
    router.push(`/dashboard/hopital_doctor/patients/medical-records/${appointmentId}`);
  };


  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Liste des Patients</h1>
          <p className="text-muted-foreground">
            Gérez la liste de vos patients
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
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Téléphone</th>
                  <th className="px-6 py-3 text-left">Groupe sanguin</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
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
                        {appointment.patientEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.patientPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getBloodTypeInfo(appointment.bloodType).variant}>
                          {getBloodTypeInfo(appointment.bloodType).display}
                        </Badge>
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
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Aucun patient trouvé
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
            {Math.min(totalItems, currentPage * itemsPerPage)} sur {totalItems} patients
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