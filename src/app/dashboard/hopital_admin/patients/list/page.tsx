'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PatientCard } from "./patientCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  reason: string;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialty: string;
  };
}

interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string | null;
  numberOfAppointments: number;
  lastAppointment?: string;
  email: string;
  phone?: string;
  address?: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  numberOfMedicalRecords: number;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  healthStatus: {
    allergies: string | null;
    notes: string | null;
  };
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [minAppointments, setMinAppointments] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileTempFilters, setMobileTempFilters] = useState({
    search: "",
    gender: [] as string[],
    minAppointments: 0,
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/hospital_admin/patients/list");
        const data = await res.json();
        setPatients(data.patients);
      } catch (err) {
        console.error("Erreur lors du chargement des patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const toggleGender = (gender: string) => {
    setGenderFilter((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setGenderFilter([]);
    setMinAppointments(0);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesGender =
        genderFilter.length === 0 || genderFilter.includes(p.gender);
      const matchesAppointments = p.numberOfAppointments >= minAppointments;
      return matchesSearch && matchesGender && matchesAppointments;
    });
  }, [patients, search, genderFilter, minAppointments]);

  const FilterPanel = ({ isInDialog = false }: { isInDialog?: boolean }) => (
    <Card className={isInDialog ? "" : "hidden md:block"}>
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche */}
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Nom du patient..."
              className="pl-8"
              value={isInDialog ? mobileTempFilters.search : search}
              onChange={(e) =>
                isInDialog
                  ? setMobileTempFilters((prev) => ({ ...prev, search: e.target.value }))
                  : setSearch(e.target.value)
              }
            />
          </div>
        </div>
        <Separator />
        {/* Genre */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <div className="space-y-1.5">
            {['MALE', 'FEMALE'].map((gender) => (
              <div key={gender} className="flex items-center gap-2">
                <Checkbox
                  id={`gender-${gender}`}
                  checked={
                    isInDialog
                      ? mobileTempFilters.gender.includes(gender)
                      : genderFilter.includes(gender)
                  }
                  onCheckedChange={() =>
                    isInDialog
                      ? setMobileTempFilters((prev) => ({
                          ...prev,
                          gender: prev.gender.includes(gender)
                            ? prev.gender.filter((g) => g !== gender)
                            : [...prev.gender, gender],
                        }))
                      : toggleGender(gender)
                  }
                />
                <Label htmlFor={`gender-${gender}`}>{gender}</Label>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        {/* Nombre min. RDV */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre min. de rendez-vous</label>
          <Input
            type="number"
            min={0}
            value={isInDialog ? mobileTempFilters.minAppointments : minAppointments}
            onChange={(e) =>
              isInDialog
                ? setMobileTempFilters((prev) => ({
                    ...prev,
                    minAppointments: parseInt(e.target.value) || 0,
                  }))
                : setMinAppointments(parseInt(e.target.value) || 0)
            }
          />
        </div>
        {/* Boutons */}
        {isInDialog ? (
          <Button
            className="w-full"
            onClick={() => {
              setSearch(mobileTempFilters.search);
              setGenderFilter(mobileTempFilters.gender);
              setMinAppointments(mobileTempFilters.minAppointments);
              setShowMobileFilters(false);
            }}
          >
            Appliquer les filtres
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-10">
      {/* Desktop Filters */}
      <aside className="hidden lg:block w-64">
        <FilterPanel />
      </aside>
      {/* Mobile Filters Trigger */}
      <div className="lg:hidden flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter className="h-4 w-4 mr-2" /> Filtres
        </Button>
      </div>
      <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtres</DialogTitle>
          </DialogHeader>
          <FilterPanel isInDialog />
        </DialogContent>
      </Dialog>

      <div className="flex-1 space-y-4">
        {/* Active Badges */}
        {(search || genderFilter.length > 0 || minAppointments > 0) && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="outline" className="flex items-center gap-1">
                Recherche: {search}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSearch("")} />
              </Badge>
            )}
            {genderFilter.map((gender) => (
              <Badge
                key={gender}
                variant="outline"
                className="flex items-center gap-1"
              >
                {gender}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => toggleGender(gender)}
                />
              </Badge>
            ))}
            {minAppointments > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                Min. RDV: {minAppointments}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setMinAppointments(0)}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Patient cards or loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="p-4 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            Aucun patient ne correspond à vos filtres.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
