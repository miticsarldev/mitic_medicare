"use client";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PatientCard } from "./patientCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

//history
interface MedicalHistory {
  id: string;
  title: string;
  condition: string;
  diagnosedDate: string;
  status: string;
  details: string;
  doctor?: {
    id: string;
    specialty: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
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
  city: string | undefined;
  state: string | undefined;
  zipCode: string | undefined;
  numberOfMedicalRecords: number;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  healthStatus: {
    allergies: string | null;
    notes: string | null;
  };
  medicalHistories: MedicalHistory[];
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const GENDER_OPTIONS = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
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
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchPatients = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const { signal } = controller;

      try {
        const url = new URL(
          "/api/hospital_admin/patients/list",
          window.location.origin
        );
        url.searchParams.set("page", page.toString());
        url.searchParams.set("pageSize", ITEMS_PER_PAGE.toString());
        if (search) url.searchParams.set("name", search);
        if (genderFilter.length > 0)
          url.searchParams.set("gender", genderFilter.join(","));
        if (minAppointments > 0)
          url.searchParams.set("minAppointments", String(minAppointments));

        const res = await fetch(url.toString(), { signal });
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();

        setPatients(data.patients);
        if (data.pagination) setPagination(data.pagination);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Error loading patients", err);
          setError("Impossible de charger les patients");
          toast({
            title: "Erreur",
            description: "Échec du chargement des patients",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    },
    [search, genderFilter, minAppointments]
  );

  // Gestion du debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(1); // Reset à la première page quand la recherche change
    }, 500); // Délai de 500ms

    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  // Pour les autres filtres (genre et appointments), on déclenche immédiatement
  useEffect(() => {
    fetchPatients(1);
  }, [genderFilter, minAppointments, fetchPatients]);

  const toggleGender = useCallback((gender: string) => {
    setGenderFilter((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setGenderFilter([]);
    setMinAppointments(0);
  }, []);
  // inside PatientList() — keep the rest of your state as-is

  const FilterPanel = React.memo(function FilterPanelComponent({
    isMobile = false,
    autoFocus = false,
    onApply,
  }: {
    isMobile?: boolean;
    autoFocus?: boolean; // 👈 new
    onApply?: () => void;
  }) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    // focus only when requested (desktop first mount or when dialog opens on mobile)
    useEffect(() => {
      if (autoFocus && searchInputRef.current) {
        searchInputRef.current.focus();
        // Optionally move caret to end:
        const el = searchInputRef.current;
        const val = el.value;
        el.value = "";
        el.value = val;
      }
    }, [autoFocus]);

    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                id="search"
                type="search"
                placeholder="Nom du patient..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // shadcn already has good focus rings; keep defaults
              />
            </div>
          </div>

          <Separator />

          {/* Gender */}
          <div className="space-y-2">
            <Label>Genre</Label>
            <div className="space-y-2">
              {GENDER_OPTIONS.map((gender) => (
                <div key={gender.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`gender-${gender.value}`}
                    checked={genderFilter.includes(gender.value)}
                    // onCheckedChange in shadcn returns boolean | "indeterminate"
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setGenderFilter((prev) =>
                        isChecked
                          ? Array.from(new Set([...prev, gender.value]))
                          : prev.filter((g) => g !== gender.value)
                      );
                    }}
                  />
                  <Label htmlFor={`gender-${gender.value}`}>
                    {gender.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Min appointments */}
          <div className="space-y-2">
            <Label htmlFor="minAppointments">Nombre min. de rendez-vous</Label>
            <Input
              id="minAppointments"
              inputMode="numeric"
              type="number"
              min={0}
              value={minAppointments}
              onChange={(e) =>
                setMinAppointments(parseInt(e.target.value || "0", 10))
              }
            />
          </div>

          {isMobile ? (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowMobileFilters(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  onApply?.();
                  setShowMobileFilters(false);
                }}
              >
                Appliquer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={() => fetchPatients(1)}>Mettre à jour</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  });

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.totalPages) return;
      fetchPatients(page);
    },
    [fetchPatients, pagination.totalPages]
  );

  const ActiveFilters = React.memo(function ActiveFiltersComponent() {
    if (!search && genderFilter.length === 0 && minAppointments === 0)
      return null;

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
          const genderLabel =
            GENDER_OPTIONS.find((g) => g.value === gender)?.label || gender;
          return (
            <Badge
              key={gender}
              variant="outline"
              className="flex items-center gap-1"
            >
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

  const LoadingSkeleton = React.memo(function LoadingSkeletonComponent() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    );
  });

  const EmptyState = React.memo(function EmptyStateComponent() {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <p className="text-muted-foreground mb-2">Aucun patient trouvé</p>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Réinitialiser les filtres
        </Button>
      </div>
    );
  });

  const PaginationControls = React.memo(function PaginationControlsComponent({
    currentPage,
    totalPages,
    onPageChange,
  }: PaginationControlsProps) {
    const visiblePages = useMemo(() => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);

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

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Précédent
        </Button>

        {visiblePages.map((page, idx) =>
          page === "..." ? (
            <Button key={idx} variant="ghost" size="sm" disabled>
              ...
            </Button>
          ) : (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
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
        <Button
          variant="outline"
          onClick={() => fetchPatients(pagination.currentPage)}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <aside
        className="hidden lg:block w-72 flex-shrink-0 lg:sticky lg:top-0 self-start
                  max-h-[calc(100vh-7rem)] overflow-auto"
      >
        <FilterPanel autoFocus />
      </aside>

      <div className="flex-1">
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

        <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filtres</DialogTitle>
            </DialogHeader>
            <FilterPanel
              isMobile
              autoFocus={showMobileFilters}
              onApply={() => fetchPatients(1)}
            />
          </DialogContent>
        </Dialog>

        <ActiveFilters />

        {loading ? (
          <LoadingSkeleton />
        ) : patients.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
