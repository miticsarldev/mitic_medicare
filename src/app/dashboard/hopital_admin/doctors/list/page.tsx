/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, Plus, Star, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { DoctorCard } from "./DoctorCard";
import { DoctorModal } from "./DoctorModal";
import { useGateButton } from "@/hooks/use-gate";
import { getSpecializationLabel } from "@/utils/function";

/********************
 * Types
 *******************/

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  averageRating: number;
  patientsCount: number;
  phone: string;
  email: string;
  address?: string;
  isActive?: boolean;
  department?: {
    id: string;
    name: string;
  };
  education?: string;
  experience?: string;
  consultationFee?: string;
  schedule?: {
    day: string;
    slots: string[];
  }[];
  avatarUrl?: string;
}

type Department = { id: string; name: string; description?: string };

/********************
 * Constants
 *******************/
const ITEMS_PER_PAGE = 6;

/********************
 * Helper UI
 *******************/
function PageHeader({ onOpenAdd }: { onOpenAdd: () => void }) {
  const gate = useGateButton({
    type: "limit",
    key: "doctorsPerHospital",
    delta: 1,
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border p-2 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Gestion des médecins
          </h1>
          <p className="text-sm text-muted-foreground">
            Recherchez, filtrez et gérez les médecins de votre établissement.
          </p>
        </div>
        <Button
          //   onClick={onOpenAdd}
          disabled={gate.disabled}
          title={gate.reason}
          onClick={gate.getOnClick(() => onOpenAdd())}
          className="h-9"
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter un médecin
        </Button>
      </div>
    </div>
  );
}

function StatTiles({
  total,
  active,
  avgRating,
}: {
  total: number;
  active: number;
  avgRating: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm text-muted-foreground">
            Total médecins
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl font-semibold">{total}</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm text-muted-foreground">
            Actifs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl font-semibold">{active}</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm text-muted-foreground">
            Note moyenne
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-2 text-xl font-semibold">
            {avgRating.toFixed(1)} <Star className="h-5 w-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/********************
 * Main Page
 *******************/
export default function DoctorsDirectory() {
  // UI
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  // Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Dept modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [savingDept, setSavingDept] = useState(false);

  // Toggle status loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /*************** Fetch ***************/
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [doctorsRes, departmentsRes] = await Promise.all([
        fetch("/api/hospital_admin/doctors"),
        fetch("/api/hospital_admin/department"),
      ]);
      const doctorsData = await doctorsRes.json();
      const departmentsData = await departmentsRes.json();
      setDoctors(
        (doctorsData?.doctors ?? []).map((d: Doctor) => ({
          ...d,
          department: d.department ?? null,
        }))
      );
      setDepartments(departmentsData?.departments ?? []);
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*************** Derived ***************/
  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((doc) => {
      const matchesSearch =
        !q ||
        `${doc.name} ${doc.specialization} ${doc.department?.name ?? ""}`
          .toLowerCase()
          .includes(q);
      const matchesSpecialty =
        specialtyFilter.length === 0 ||
        specialtyFilter.includes(doc.specialization);
      const matchesRating = doc.averageRating >= minRating;
      return matchesSearch && matchesSpecialty && matchesRating;
    });
  }, [doctors, search, specialtyFilter, minRating]);

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDoctors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDoctors, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE)
  );

  const stats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter((d) => d.isActive).length;
    const avgRating = doctors.length
      ? doctors.reduce((a, b) => a + (b.averageRating || 0), 0) / doctors.length
      : 0;
    return { total, active, avgRating };
  }, [doctors]);

  /*************** Handlers ***************/
  const toggleSpecialty = useCallback((specialty: string) => {
    setSpecialtyFilter((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSpecialtyFilter([]);
    setMinRating(0);
    setCurrentPage(1);
  }, []);

  const onChangeDepartmentRequest = useCallback((doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setSelectedDept(doctor.department?.id ?? null);
    setShowDeptModal(true);
  }, []);

  const saveDepartment = useCallback(async () => {
    if (!currentDoctor) return;
    setSavingDept(true);
    try {
      await fetch("/api/hospital_admin/doctors/updateDepartement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: currentDoctor.id,
          departmentId: selectedDept,
        }),
      });
      await fetchData();
      toast({
        title: "Succès",
        description: `Le département de ${currentDoctor.name} a été mis à jour.`,
      });
      setShowDeptModal(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du département",
        variant: "destructive",
      });
    } finally {
      setSavingDept(false);
    }
  }, [currentDoctor, selectedDept, fetchData]);

  const toggleActive = useCallback(
    async (doctorId: string, nextActive: boolean) => {
      setTogglingId(doctorId);
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId ? { ...d, isActive: nextActive } : d
        )
      );
      try {
        const res = await fetch("/api/hospital_admin/doctors/toggle-active", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId, isActive: nextActive }),
        });
        if (!res.ok)
          throw new Error(
            (await res.json().catch(() => ({})))?.error ||
              "Échec de la mise à jour"
          );
        toast({
          title: "Succès",
          description: `Le médecin a été ${nextActive ? "activé" : "désactivé"}.`,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === doctorId ? { ...d, isActive: !nextActive } : d
          )
        );
        toast({
          title: "Erreur",
          description: e?.message || "Erreur inconnue",
          variant: "destructive",
        });
      } finally {
        setTogglingId(null);
      }
    },
    []
  );

  /*************** UI Blocks ***************/
  const renderFilters = useCallback(
    () => (
      <Card className="sticky top-4 rounded-xl border-border/60">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base font-semibold">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Recherche
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nom, spécialité, département..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Spécialités</Label>
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-2">
                {Array.from(new Set(doctors.map((d) => d.specialization)))
                  .sort()
                  .map((spec) => (
                    <div key={spec} className="flex items-center gap-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={specialtyFilter.includes(spec)}
                        onCheckedChange={() => toggleSpecialty(spec)}
                      />
                      <Label htmlFor={`spec-${spec}`} className="text-sm">
                        {getSpecializationLabel(spec)}
                      </Label>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Note minimale</Label>
            <Select
              value={String(minRating)}
              onValueChange={(v) => setMinRating(Number(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "Toutes" : `${n}+`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </CardContent>
      </Card>
    ),
    [doctors, search, specialtyFilter, minRating, toggleSpecialty, resetFilters]
  );

  const renderSkeletons = useCallback(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    ),
    []
  );

  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;
    const pages: (number | string)[] = [];
    const push = (v: number | string) => pages.push(v);
    const addRange = (s: number, e: number) => {
      for (let i = s; i <= e; i++) push(i);
    };

    if (totalPages <= 7) {
      addRange(1, totalPages);
    } else {
      addRange(1, 2);
      if (currentPage > 4) push("...");
      addRange(
        Math.max(3, currentPage - 1),
        Math.min(totalPages - 2, currentPage + 1)
      );
      if (currentPage < totalPages - 3) push("...");
      addRange(totalPages - 1, totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </Button>
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={idx}
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              className="min-w-9"
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">
              {p}
            </span>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </Button>
      </div>
    );
  }, [currentPage, totalPages]);

  /*************** Render ***************/
  return (
    <div className="space-y-4 p-2 sm:p-4">
      <PageHeader onOpenAdd={() => setOpenAdd(true)} />
      <StatTiles
        total={stats.total}
        active={stats.active}
        avgRating={stats.avgRating}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">{renderFilters()}</aside>

        {/* Main */}
        <section className="space-y-2">
          {/* Toolbar */}
          <Card className="rounded-xl">
            <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un médecin..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden h-9"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Filters */}
          <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filtres</DialogTitle>
              </DialogHeader>
              {renderFilters()}
            </DialogContent>
          </Dialog>

          {/* Content */}
          {isLoading ? (
            renderSkeletons()
          ) : filteredDoctors.length === 0 ? (
            <Card className="rounded-xl border-dashed">
              <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                <p className="font-medium">Aucun médecin trouvé</p>
                <p className="text-sm text-muted-foreground">
                  {search || specialtyFilter.length || minRating
                    ? "Essayez d'ajuster vos filtres."
                    : "Aucun médecin disponible pour l'instant."}
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {paginatedDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onChangeDepartment={() => onChangeDepartmentRequest(doc)}
                  onChangeStatus={toggleActive}
                  toggling={togglingId === doc.id}
                />
              ))}
            </div>
          )}

          {renderPagination()}
        </section>
      </div>

      {/* Department Modal */}
      <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="space-y-1">
            <DialogTitle>Changer de département</DialogTitle>
            <DialogDescription>
              Pour {currentDoctor?.name} - {currentDoctor?.email} -{" "}
              {currentDoctor?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Select
              value={selectedDept ?? "ALL"}
              onValueChange={(v) => setSelectedDept(v !== "ALL" ? v : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Aucun département</SelectItem>
                {departments.map((dep) => (
                  <SelectItem key={dep.id} value={dep.id}>
                    {dep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeptModal(false)}
              disabled={savingDept}
            >
              Annuler
            </Button>
            <Button
              onClick={saveDepartment}
              disabled={
                savingDept ||
                selectedDept === (currentDoctor?.department?.id ?? null)
              }
            >
              {savingDept ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Doctor Modal */}
      <DoctorModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onDoctorCreated={fetchData}
      />
    </div>
  );
}
