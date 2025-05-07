'use client'
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { toast } from "@/hooks/use-toast";

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

const GENDER_OPTIONS = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" }
];

const ITEMS_PER_PAGE = 6;

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [minAppointments, setMinAppointments] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch patients data
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hospital_admin/patients/list");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      setPatients(data.patients);
    } catch (err) {
      console.error("Error loading patients", err);
      setError("Impossible de charger les patients");
      toast({
        title: "Erreur",
        description: "Échec du chargement des patients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Toggle gender filter
  const toggleGender = useCallback((gender: string) => {
    setGenderFilter(prev =>
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearch("");
    setGenderFilter([]);
    setMinAppointments(0);
    setCurrentPage(1);
  }, []);

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase());
      const matchesGender = genderFilter.length === 0 || genderFilter.includes(patient.gender);
      const matchesAppointments = patient.numberOfAppointments >= minAppointments;
      return matchesSearch && matchesGender && matchesAppointments;
    });
  }, [patients, search, genderFilter, minAppointments]);

  // Pagination logic
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter, minAppointments]);

  // Filter panel component
  const FilterPanel = React.memo(({ 
    isMobile = false,
    onApply
  }: {
    isMobile?: boolean;
    onApply?: () => void;
  }) => {
    const [localSearch, setLocalSearch] = useState(search);
    const [localGenderFilter, setLocalGenderFilter] = useState(genderFilter);
    const [localMinAppointments, setLocalMinAppointments] = useState(minAppointments);

    useEffect(() => {
      if (isMobile) {
        setLocalSearch(search);
        setLocalGenderFilter(genderFilter);
        setLocalMinAppointments(minAppointments);
      }
    }, [isMobile, search, genderFilter, minAppointments]);

    const handleToggleGender = (gender: string) => {
      setLocalGenderFilter(prev =>
        prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
      );
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="search"
                placeholder="Nom du patient..."
                className="pl-9"
                value={isMobile ? localSearch : search}
                onChange={(e) => 
                  isMobile 
                    ? setLocalSearch(e.target.value)
                    : setSearch(e.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Genre</Label>
            <div className="space-y-2">
              {GENDER_OPTIONS.map((gender) => (
                <div key={gender.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`gender-${gender.value}`}
                    checked={
                      isMobile 
                        ? localGenderFilter.includes(gender.value)
                        : genderFilter.includes(gender.value)
                    }
                    onCheckedChange={() => 
                      isMobile
                        ? handleToggleGender(gender.value)
                        : toggleGender(gender.value)
                    }
                  />
                  <Label htmlFor={`gender-${gender.value}`}>{gender.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="minAppointments">Nombre min. de rendez-vous</Label>
            <Input
              id="minAppointments"
              type="number"
              min={0}
              value={isMobile ? localMinAppointments : minAppointments}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                isMobile
                  ? setLocalMinAppointments(value)
                  : setMinAppointments(value);
              }}
            />
          </div>

          {isMobile ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setLocalSearch(search);
                  setLocalGenderFilter(genderFilter);
                  setLocalMinAppointments(minAppointments);
                  setShowMobileFilters(false);
                }}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setSearch(localSearch);
                  setGenderFilter(localGenderFilter);
                  setMinAppointments(localMinAppointments);
                  onApply?.();
                }}
              >
                Appliquer
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
          )}
        </CardContent>
      </Card>
    );
  });

  // Active filters display
  const ActiveFilters = React.memo(() => {
    if (!search && genderFilter.length === 0 && minAppointments === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {search && (
          <Badge variant="outline" className="flex items-center gap-1">
            Recherche: {search}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => setSearch("")} 
            />
          </Badge>
        )}
        {genderFilter.map((gender) => {
          const genderLabel = GENDER_OPTIONS.find(g => g.value === gender)?.label || gender;
          return (
            <Badge key={gender} variant="outline" className="flex items-center gap-1">
              {genderLabel}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleGender(gender)} 
              />
            </Badge>
          );
        })}
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
    );
  });

  // Loading skeleton
  const LoadingSkeleton = React.memo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
        <Card key={idx} className="h-[180px]">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ));

  // Empty state
  const EmptyState = React.memo(() => (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
      <p className="text-muted-foreground mb-2">Aucun patient trouvé</p>
      <Button 
        variant="outline" 
        size="sm"
        onClick={resetFilters}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  ));

  // Pagination controls
  const PaginationControls = React.memo(() => {
    if (totalPages <= 1) return null;

    const visiblePages = useMemo(() => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) pages.push(1);
      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");
      if (end < totalPages) pages.push(totalPages);

      return pages;
    }, [currentPage, totalPages]);

    return (
      <div className="flex justify-center mt-6 gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Précédent
        </Button>
        
        {visiblePages.map((page, idx) => (
          page === "..." ? (
            <Button key={idx} variant="ghost" size="sm" disabled>
              ...
            </Button>
          ) : (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page as number)}
            >
              {page}
            </Button>
          )
        ))}

        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Suivant
        </Button>
      </div>
    );
  });

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={fetchPatients}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Desktop Filters */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <FilterPanel />
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Mobile Filters Button */}
        <div className="lg:hidden flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Mobile Filters Dialog */}
        <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filtres</DialogTitle>
            </DialogHeader>
            <FilterPanel 
              isMobile 
              onApply={() => setShowMobileFilters(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Active Filters */}
        <ActiveFilters />

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredPatients.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedPatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
            <PaginationControls />
          </>
        )}
      </div>
    </div>
  );
}