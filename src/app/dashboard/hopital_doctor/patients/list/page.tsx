/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  UserRound,
  Search,
  FileText,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Activity,
  Eye,
  CalendarDays,
  Loader2,
} from "lucide-react";
// charts removed for vital signs -> no recharts imports needed
import { BloodType } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ------------------- Types -------------------

type PatientLite = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  phone?: string | null;
  email?: string | null;
  bloodType?: BloodType | null;
  lastActivity?: string | null; // ISO
  counts: {
    appointments: number;
    medicalHistories: number;
    medicalRecords: number;
    vitalSigns: number;
  };
};

type ListResponse = {
  range: { from?: string; to?: string };
  items: PatientLite[];
  total: number;
  page: number;
  pageSize: number;
};

type PatientDetail = {
  patient: {
    id: string;
    bloodType?: BloodType | null;
    allergies?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    emergencyRelation?: string | null;
    insuranceProvider?: string | null;
    insuranceNumber?: string | null;
    medicalNotes?: string | null;
    user: {
      id: string;
      name: string;
      phone?: string | null;
      email?: string | null;
      dateOfBirth?: string | null;
      profile?: {
        avatarUrl?: string | null;
      };
    };
  };
  medicalHistories: {
    id: string;
    title: string;
    condition: string;
    status: string;
    diagnosedDate?: string | null;
    details?: string | null;
    createdAt: string;
  }[];
  medicalRecords: {
    id: string;
    createdAt: string;
    diagnosis: string;
    treatment?: string | null;
    followUpNeeded: boolean;
    followUpDate?: string | null;
    doctorName: string;
  }[];
  vitalSigns: {
    id: string;
    recordedAt: string;
    temperature?: string | null;
    heartRate?: number | null;
    bloodPressure?: string | null;
    oxygenSaturation?: number | null;
    weight?: string | null;
    height?: string | null;
  }[];
  appointments: {
    id: string;
    scheduledAt: string;
    status: string;
    type?: string | null;
    doctorName: string;
  }[];
};

// ------------------- Presets -------------------

const presets = {
  "7j": { from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) },
  "1m": { from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) },
  "3m": { from: startOfDay(subDays(new Date(), 89)), to: endOfDay(new Date()) },
  "6m": {
    from: startOfDay(subDays(new Date(), 179)),
    to: endOfDay(new Date()),
  },
  an: { from: startOfDay(subDays(new Date(), 364)), to: endOfDay(new Date()) },
  moisCourant: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  anneeCourante: { from: startOfYear(new Date()), to: endOfYear(new Date()) },
} as const;

function toParams(o: Record<string, any>) {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.append(k, String(v));
  });
  return p.toString();
}

export default function PatientsListPage() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState<{ from?: Date; to?: Date }>(
    presets.moisCourant
  );
  const [selectedPreset, setSelectedPreset] = useState<
    keyof typeof presets | "custom"
  >("moisCourant");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ListResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Drawer & détail
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modales CRUD
  const [mhOpen, setMhOpen] = useState(false);
  const [mhEditing, setMhEditing] = useState<null | {
    id?: string;
    title: string;
    condition: string;
    status: string;
    diagnosedDate?: string;
    details?: string;
  }>(null);

  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [vitalsForm, setVitalsForm] = useState<{
    temperature?: string;
    heartRate?: number;
    bpSys?: number;
    bpDia?: number;
    spo2?: number;
    weight?: string;
    height?: string;
  }>({});

  const [apptOpen, setApptOpen] = useState(false);
  const [apptForm, setApptForm] = useState<{
    date?: string;
    time?: string;
    type?: string;
    notes?: string;
  }>({});

  // UI state: expanded medical record and submit loaders
  const [openRecordId, setOpenRecordId] = useState<string | null>(null);
  const [mhSaving, setMhSaving] = useState(false);
  const [vitalsSaving, setVitalsSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const qs = toParams({
        q,
        from: range.from?.toISOString(),
        to: range.to?.toISOString(),
        page,
        pageSize,
      });
      const res = await fetch(`/api/hospital_doctor/patients?${qs}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Chargement impossible");
      const json: ListResponse = await res.json();
      setData(json);
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [q, range, page, pageSize]);

  const fetchDetail = useCallback(
    async (id: string) => {
      setLoadingDetail(true);
      setDetail(null);
      setOpen(true);
      try {
        const qs = toParams({
          from: range.from?.toISOString(),
          to: range.to?.toISOString(),
        });
        const res = await fetch(`/api/hospital_doctor/patients/${id}?${qs}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Chargement des détails impossible");
        const json: PatientDetail = await res.json();
        setDetail(json);
      } catch (e: any) {
        toast.error(e?.message ?? "Erreur inconnue");
        setOpen(false);
      } finally {
        setLoadingDetail(false);
      }
    },
    [range]
  );

  useEffect(() => {
    setPage(1);
  }, [q, range]);
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const selectPreset = (key: keyof typeof presets | "custom") => {
    setSelectedPreset(key);
    if (key !== "custom") {
      setRange(presets[key]);
    }
  };
  const onCustomFrom = (val: string) => {
    setSelectedPreset("custom");
    setRange((r) => ({ ...r, from: startOfDay(new Date(val)) }));
  };
  const onCustomTo = (val: string) => {
    setSelectedPreset("custom");
    setRange((r) => ({ ...r, to: endOfDay(new Date(val)) }));
  };

  // ----- Actions CRUD -----
  function openCreateHistory() {
    setMhEditing({ title: "", condition: "", status: "ACTIVE" });
    setMhOpen(true);
  }

  function openEditHistory(h: any) {
    setMhEditing({
      id: h.id,
      title: h.title,
      condition: h.condition,
      status: h.status,
      diagnosedDate: h.diagnosedDate ?? undefined,
      details: h.details ?? undefined,
    });
    setMhOpen(true);
  }

  async function deleteHistory(id: string) {
    try {
      const res = await fetch(
        `/api/hospital_doctor/patients/medical_histories/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Suppression impossible");
      toast.success("Antécédent supprimé");
      if (detail) fetchDetail(detail.patient.id);
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur inconnue");
    }
  }

  function renderBloodType(bloodType: BloodType) {
    switch (bloodType) {
      case "A_POSITIVE":
        return "A+";
      case "A_NEGATIVE":
        return "A-";
      case "B_POSITIVE":
        return "B+";
      case "B_NEGATIVE":
        return "B-";
      case "AB_POSITIVE":
        return "AB+";
      case "AB_NEGATIVE":
        return "AB-";
      case "O_POSITIVE":
        return "O+";
      case "O_NEGATIVE":
        return "O-";
      default:
        return "Inconnu";
    }
  }

  function openAddVitals() {
    setVitalsForm({});
    setVitalsOpen(true);
  }

  // Appointment creation UI state
  const [availableDate, setAvailableDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<
    { label: string; iso: string }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Fetch available dates for the doctor
  const fetchAvailableDates = useCallback(async () => {
    try {
      setLoadingDates(true);
      const res = await fetch(
        "/api/hospital_doctor/patients/appointments/available-dates"
      );
      const json = await res.json();
      setAvailableDates(json.availableDates ?? []);
    } catch (e) {
      console.error("Failed to fetch available dates", e);
    } finally {
      setLoadingDates(false);
    }
  }, []);

  // Load available dates when appointment dialog opens
  useEffect(() => {
    if (apptOpen) {
      fetchAvailableDates();
    }
  }, [apptOpen, fetchAvailableDates]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="size-6" />
            Patients
          </h1>
          <p className="text-muted-foreground">
            Gestion des patients et de leurs dossiers médicaux
          </p>
        </div>

        {/* Mobile filter toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="size-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Filters - Desktop */}
      <Card className="hidden lg:block">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Date Range Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Période</label>
              <div className="flex gap-2">
                <Select
                  value={selectedPreset}
                  onValueChange={(val) =>
                    selectPreset(val as keyof typeof presets | "custom")
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7j">7 derniers jours</SelectItem>
                    <SelectItem value="1m">1 mois</SelectItem>
                    <SelectItem value="3m">3 mois</SelectItem>
                    <SelectItem value="6m">6 mois</SelectItem>
                    <SelectItem value="an">1 an</SelectItem>
                    <SelectItem value="moisCourant">Mois en cours</SelectItem>
                    <SelectItem value="anneeCourante">
                      Année en cours
                    </SelectItem>
                    <SelectItem value="custom">Personnalisée</SelectItem>
                  </SelectContent>
                </Select>

                {selectedPreset === "custom" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={range.from ? format(range.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => onCustomFrom(e.target.value)}
                      className="w-[140px]"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="date"
                      value={range.to ? format(range.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => onCustomTo(e.target.value)}
                      className="w-[140px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, téléphone, email..."
                  className="pl-10"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters - Mobile */}
      {showFilters && (
        <Card className="lg:hidden">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Période</label>
              <Select
                value={selectedPreset}
                onValueChange={(val) =>
                  selectPreset(val as keyof typeof presets | "custom")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7j">7 derniers jours</SelectItem>
                  <SelectItem value="1m">1 mois</SelectItem>
                  <SelectItem value="3m">3 mois</SelectItem>
                  <SelectItem value="6m">6 mois</SelectItem>
                  <SelectItem value="an">1 an</SelectItem>
                  <SelectItem value="moisCourant">Mois en cours</SelectItem>
                  <SelectItem value="anneeCourante">Année en cours</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>

              {selectedPreset === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="date"
                    value={range.from ? format(range.from, "yyyy-MM-dd") : ""}
                    onChange={(e) => onCustomFrom(e.target.value)}
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="date"
                    value={range.to ? format(range.to, "yyyy-MM-dd") : ""}
                    onChange={(e) => onCustomTo(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, téléphone, email..."
                  className="pl-10"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patients List */}
      <Card className="p-4">
        <CardHeader className="p-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Liste des patients
              </CardTitle>
              <CardDescription>
                {range.from && range.to ? (
                  <>
                    Période : {format(range.from, "PPP", { locale: fr })} →{" "}
                    {format(range.to, "PPP", { locale: fr })}
                  </>
                ) : (
                  "Tous les patients"
                )}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {data?.total ? `${data.total} patient(s) trouvé(s)` : ""}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-8 w-[80px]" />
                </div>
              ))}
            </div>
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="text-center py-12">
              <UserRound className="mx-auto size-16 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun patient trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                Aucun patient ne correspond aux critères de recherche.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setRange(presets.moisCourant);
                  setSelectedPreset("moisCourant");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Patient
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Groupe sanguin
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Dernière activité
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Statistiques
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.items.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {/* <UserRound className="size-5 text-primary" /> */}
                              <Avatar>
                                <AvatarImage
                                  src={
                                    p.avatarUrl ||
                                    "/placeholder.svg?height=160&width=160"
                                  }
                                  alt={p.name}
                                  className="object-contain"
                                />
                                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                                  {getInitials(p.name)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="space-y-1">
                                {p.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="size-3 text-muted-foreground" />
                                    {p.phone}
                                  </div>
                                )}
                                {p.email && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="size-3 text-muted-foreground" />
                                    <span className="truncate max-w-[200px]">
                                      {p.email}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {p.bloodType ? (
                            <Badge variant="outline">
                              {renderBloodType(p.bloodType)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {p.lastActivity ? (
                            <div className="text-sm">
                              {format(new Date(p.lastActivity), "dd/MM/yyyy", {
                                locale: fr,
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {p.counts.appointments} RDV
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {p.counts.medicalHistories} Antéc.
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {p.counts.medicalRecords} Dossiers
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {p.counts.vitalSigns} Signes
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchDetail(p.id)}
                              className="gap-2"
                              disabled={loadingDetail}
                            >
                              <Eye className="size-4" />
                              {loadingDetail
                                ? "Chargement..."
                                : "Voir le profil"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {data!.items.map((p) => (
                  <Card key={p.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserRound className="size-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {p.id.slice(0, 8)}…
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {p.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="size-3 text-muted-foreground" />
                          {p.phone}
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="size-3 text-muted-foreground" />
                          <span className="truncate">{p.email}</span>
                        </div>
                      )}
                      {p.bloodType && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Groupe sanguin:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {renderBloodType(p.bloodType)}
                          </Badge>
                        </div>
                      )}
                      {p.lastActivity && (
                        <div className="text-xs text-muted-foreground">
                          Dernière activité:{" "}
                          {format(new Date(p.lastActivity), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {p.counts.appointments} RDV
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {p.counts.medicalHistories} Antéc.
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {p.counts.medicalRecords} Dossiers
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {p.counts.vitalSigns} Signes
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchDetail(p.id)}
                      className="w-full gap-2"
                      disabled={loadingDetail}
                    >
                      <Eye className="size-4" />
                      {loadingDetail
                        ? "Chargement..."
                        : "Voir le profil complet"}
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {data!.total} patient(s) au total
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <div className="text-sm px-3">
                    Page {data!.page} sur {Math.ceil(data!.total / pageSize)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={data!.items.length < pageSize}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Drawer de détails */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {loadingDetail ? (
            <div className="py-16 space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : !detail ? (
            <div className="py-16 text-center">
              <UserRound className="mx-auto size-16 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">
                Erreur de chargement
              </h3>
              <p className="text-muted-foreground">
                Impossible de charger les détails du patient.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header avec avatar */}
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Avatar>
                        <AvatarImage
                          src={
                            detail.patient.user.profile?.avatarUrl ||
                            "/placeholder.svg?height=160&width=160"
                          }
                          alt={detail.patient.user.name}
                          className="object-contain"
                        />
                        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                          {getInitials(detail.patient.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <SheetTitle className="text-2xl">
                        {detail.patient.user.name}
                      </SheetTitle>
                      <SheetDescription className="mt-1">
                        {detail.patient.user.email ||
                        detail.patient.user.phone ? (
                          <div className="flex flex-wrap gap-4 text-sm">
                            {detail.patient.user.phone && (
                              <span className="inline-flex items-center gap-2">
                                <Phone className="size-4" />
                                {detail.patient.user.phone}
                              </span>
                            )}
                            {detail.patient.user.email && (
                              <span className="inline-flex items-center gap-2">
                                <Mail className="size-4" />
                                {detail.patient.user.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Aucune information de contact
                          </span>
                        )}
                      </SheetDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setApptForm({});
                      setAvailableDate("");
                      setAvailableSlots([]);
                      setSelectedDate(undefined);
                      setIsCreatingAppointment(false);
                      setApptOpen(true);
                    }}
                  >
                    <CalendarDays className="size-4" />
                    Nouveau RDV
                  </Button>
                </div>
              </SheetHeader>

              {/* Informations médicales */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="size-5" />
                    Informations médicales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Groupe sanguin
                      </label>
                      <div className="mt-1">
                        {detail.patient.bloodType ? (
                          <Badge variant="outline" className="text-sm">
                            {renderBloodType(detail.patient.bloodType)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            Non renseigné
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Allergies
                      </label>
                      <div className="mt-1 font-medium">
                        {detail.patient.allergies ?? "Aucune allergie connue"}
                      </div>
                    </div>
                    {detail.patient.emergencyContact && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Contact d&apos;urgence
                        </label>
                        <div className="mt-1 font-medium">
                          {detail.patient.emergencyContact}
                          {detail.patient.emergencyPhone && (
                            <span className="text-muted-foreground ml-2">
                              ({detail.patient.emergencyPhone})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="histories" className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="histories" className="gap-2">
                    <ClipboardList className="size-4" />
                    Antécédents médicaux
                  </TabsTrigger>
                  <TabsTrigger value="records" className="gap-2">
                    <FileText className="size-4" />
                    Dossiers médicaux
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="histories" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Antécédents médicaux
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Historique des conditions médicales du patient
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => openCreateHistory()}
                    >
                      <Plus className="size-4" />
                      Ajouter un antécédent
                    </Button>
                  </div>

                  {detail.medicalHistories.length === 0 ? (
                    <Card className="p-8 text-center">
                      <ClipboardList className="mx-auto size-12 mb-4 text-muted-foreground/50" />
                      <h4 className="font-semibold mb-2">
                        Aucun antécédent médical
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Aucun antécédent médical n&apos;a été enregistré pour ce
                        patient.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCreateHistory()}
                        className="gap-2"
                      >
                        <Plus className="size-4" />
                        Ajouter le premier antécédent
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {detail.medicalHistories.map((h) => (
                        <Card key={h.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{h.title}</h4>
                                <Badge
                                  variant={
                                    h.status === "ACTIVE"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {h.status === "ACTIVE"
                                    ? "Actif"
                                    : h.status === "RESOLVED"
                                      ? "Résolu"
                                      : "Chronique"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {h.condition}
                              </p>
                              {h.diagnosedDate && (
                                <p className="text-xs text-muted-foreground">
                                  Diagnostiqué le{" "}
                                  {format(new Date(h.diagnosedDate), "PPP", {
                                    locale: fr,
                                  })}
                                </p>
                              )}
                              {h.details && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                  <p className="text-sm">{h.details}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditHistory(h)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteHistory(h.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="records" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Dossiers médicaux</h3>
                    <p className="text-sm text-muted-foreground">
                      Consultations et traitements enregistrés
                    </p>
                  </div>

                  {detail.medicalRecords.length === 0 ? (
                    <Card className="p-8 text-center">
                      <FileText className="mx-auto size-12 mb-4 text-muted-foreground/50" />
                      <h4 className="font-semibold mb-2">
                        Aucun dossier médical
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Aucun dossier médical n&apos;a été créé pour ce patient.
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {detail.medicalRecords.map((r) => (
                        <Card key={r.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">
                                    Consultation du{" "}
                                    {format(new Date(r.createdAt), "PPP", {
                                      locale: fr,
                                    })}
                                  </h4>
                                  {r.followUpNeeded && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Suivi requis
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Médecin: {r.doctorName}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setOpenRecordId((prev) =>
                                    prev === r.id ? null : r.id
                                  )
                                }
                              >
                                <Eye className="size-4 mr-2" />
                                {openRecordId === r.id ? "Fermer" : "Ouvrir"}
                              </Button>
                            </div>
                            {openRecordId === r.id && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">
                                    Diagnostic
                                  </label>
                                  <p className="text-sm">{r.diagnosis}</p>
                                </div>

                                {r.treatment && (
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Traitement
                                    </label>
                                    <p className="text-sm">{r.treatment}</p>
                                  </div>
                                )}

                                {r.followUpNeeded && r.followUpDate && (
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Prochain suivi
                                    </label>
                                    <p className="text-sm">
                                      {format(new Date(r.followUpDate), "PPP", {
                                        locale: fr,
                                      })}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Separator />

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="size-5" />
                        Signes vitaux
                      </CardTitle>
                      <CardDescription>
                        Mesures récentes du patient
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => openAddVitals()}
                    >
                      <Plus className="size-4" />
                      Ajouter des mesures
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {detail.vitalSigns.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="mx-auto size-12 mb-4 text-muted-foreground/50" />
                      <h4 className="font-semibold mb-2">
                        Aucune donnée de signes vitaux
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Aucune mesure de signes vitaux n&apos;a été enregistrée.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddVitals()}
                        className="gap-2"
                      >
                        <Plus className="size-4" />
                        Ajouter la première mesure
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detail.vitalSigns
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.recordedAt).getTime() -
                            new Date(a.recordedAt).getTime()
                        )
                        .map((v) => (
                          <div
                            key={v.id}
                            className="p-3 rounded-lg border flex flex-wrap items-center gap-3 justify-between"
                          >
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(v.recordedAt), "PPP p", {
                                locale: fr,
                              })}
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {typeof v.heartRate === "number" && (
                                <Badge variant="secondary">
                                  Pouls: {v.heartRate} bpm
                                </Badge>
                              )}
                              {typeof v.oxygenSaturation === "number" && (
                                <Badge variant="secondary">
                                  SpO2: {v.oxygenSaturation}%
                                </Badge>
                              )}
                              {v.bloodPressure && (
                                <Badge variant="secondary">
                                  TA: {v.bloodPressure}
                                </Badge>
                              )}
                              {v.temperature && (
                                <Badge variant="secondary">
                                  Temp: {v.temperature}°C
                                </Badge>
                              )}
                              {v.weight && (
                                <Badge variant="secondary">
                                  Poids: {v.weight} kg
                                </Badge>
                              )}
                              {v.height && (
                                <Badge variant="secondary">
                                  Taille: {v.height} cm
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(
                                      `/api/hospital_doctor/patients/vital_signs/${v.id}`,
                                      { method: "DELETE" }
                                    );
                                    if (!res.ok)
                                      throw new Error("Suppression impossible");
                                    toast.success("Mesure supprimée");
                                    if (detail) fetchDetail(detail.patient.id);
                                  } catch (e: any) {
                                    toast.error(
                                      e?.message ?? "Erreur inconnue"
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Appointments intentionally removed per requirements */}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* --- Modale Antécédent (create/edit) --- */}
      <Dialog open={mhOpen} onOpenChange={setMhOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mhEditing?.id ? "Modifier un antécédent" : "Nouvel antécédent"}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de l&apos;antécédent médical.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Titre"
              value={mhEditing?.title ?? ""}
              onChange={(e) =>
                setMhEditing((s) => (s ? { ...s, title: e.target.value } : s))
              }
            />
            <Input
              placeholder="Condition"
              value={mhEditing?.condition ?? ""}
              onChange={(e) =>
                setMhEditing((s) =>
                  s ? { ...s, condition: e.target.value } : s
                )
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={mhEditing?.status ?? "ACTIVE"}
                onValueChange={(v) =>
                  setMhEditing((s) => (s ? { ...s, status: v } : s))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="CHRONIC">CHRONIC</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={mhEditing?.diagnosedDate ?? ""}
                onChange={(e) =>
                  setMhEditing((s) =>
                    s ? { ...s, diagnosedDate: e.target.value } : s
                  )
                }
              />
            </div>
            <Textarea
              placeholder="Détails (optionnel)"
              value={mhEditing?.details ?? ""}
              onChange={(e) =>
                setMhEditing((s) => (s ? { ...s, details: e.target.value } : s))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMhOpen(false)}
              disabled={mhSaving}
            >
              Annuler
            </Button>
            <Button
              disabled={mhSaving}
              onClick={async () => {
                if (!detail || !mhEditing) return;
                try {
                  setMhSaving(true);
                  const payload: any = {
                    patientId: detail.patient.id,
                    title: mhEditing.title,
                    condition: mhEditing.condition,
                    status: mhEditing.status,
                    diagnosedDate: mhEditing.diagnosedDate
                      ? new Date(mhEditing.diagnosedDate).toISOString()
                      : null,
                    details: mhEditing.details ?? null,
                  };
                  const url = mhEditing.id
                    ? `/api/hospital_doctor/patients/medical_histories/${mhEditing.id}`
                    : `/api/hospital_doctor/patients/medical_histories`;
                  const method = mhEditing.id ? "PUT" : "POST";
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok)
                    throw new Error("Échec de l&apos;enregistrement");
                  toast.success("Antécédent enregistré");
                  setMhOpen(false);
                  fetchDetail(detail.patient.id);
                } catch (e: any) {
                  toast.error(e?.message ?? "Erreur inconnue");
                } finally {
                  setMhSaving(false);
                }
              }}
            >
              {mhSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Modale Signes vitaux --- */}
      <Dialog open={vitalsOpen} onOpenChange={setVitalsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter des signes vitaux</DialogTitle>
            <DialogDescription>
              Renseignez les mesures du patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Température (°C)"
              value={vitalsForm.temperature ?? ""}
              onChange={(e) =>
                setVitalsForm((s) => ({ ...s, temperature: e.target.value }))
              }
            />
            <Input
              placeholder="Pouls (bpm)"
              type="number"
              value={vitalsForm.heartRate ?? ("" as any)}
              onChange={(e) =>
                setVitalsForm((s) => ({
                  ...s,
                  heartRate: Number(e.target.value),
                }))
              }
            />
            <Input
              placeholder="TA systolique"
              type="number"
              value={vitalsForm.bpSys ?? ("" as any)}
              onChange={(e) =>
                setVitalsForm((s) => ({ ...s, bpSys: Number(e.target.value) }))
              }
            />
            <Input
              placeholder="TA diastolique"
              type="number"
              value={vitalsForm.bpDia ?? ("" as any)}
              onChange={(e) =>
                setVitalsForm((s) => ({ ...s, bpDia: Number(e.target.value) }))
              }
            />
            <Input
              placeholder="SpO2 (%)"
              type="number"
              value={vitalsForm.spo2 ?? ("" as any)}
              onChange={(e) =>
                setVitalsForm((s) => ({ ...s, spo2: Number(e.target.value) }))
              }
            />
            <Input
              placeholder="Poids (kg)"
              value={vitalsForm.weight ?? ""}
              onChange={(e) =>
                setVitalsForm((s) => ({ ...s, weight: e.target.value }))
              }
            />
            <Input
              placeholder="Taille (cm)"
              value={vitalsForm.height ?? ""}
              onChange={(e) =>
                setVitalsForm((s) => ({ ...s, height: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVitalsOpen(false)}
              disabled={vitalsSaving}
            >
              Annuler
            </Button>
            <Button
              disabled={vitalsSaving}
              onClick={async () => {
                if (!detail) return;
                try {
                  setVitalsSaving(true);
                  const payload: any = {
                    patientId: detail.patient.id,
                    temperature: vitalsForm.temperature
                      ? Number(vitalsForm.temperature)
                      : null,
                    heartRate: vitalsForm.heartRate ?? null,
                    bloodPressureSystolic: vitalsForm.bpSys ?? null,
                    bloodPressureDiastolic: vitalsForm.bpDia ?? null,
                    oxygenSaturation: vitalsForm.spo2 ?? null,
                    weight: vitalsForm.weight
                      ? Number(vitalsForm.weight)
                      : null,
                    height: vitalsForm.height
                      ? Number(vitalsForm.height)
                      : null,
                  };
                  const res = await fetch(
                    `/api/hospital_doctor/patients/vital_signs`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }
                  );
                  if (!res.ok)
                    throw new Error("Échec de l&apos;enregistrement");
                  toast.success("Signes vitaux enregistrés");
                  setVitalsOpen(false);
                  fetchDetail(detail.patient.id);
                } catch (e: any) {
                  toast.error(e?.message ?? "Erreur inconnue");
                } finally {
                  setVitalsSaving(false);
                }
              }}
            >
              {vitalsSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Modale RDV --- */}
      <Dialog open={apptOpen} onOpenChange={setApptOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
            <DialogDescription>
              Programmez un rendez-vous pour ce patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">
                Sélectionner une date
              </label>
              {loadingDates ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={async (date) => {
                    setSelectedDate(date);
                    if (date) {
                      const dateStr = format(date, "yyyy-MM-dd");
                      setAvailableDate(dateStr);
                      setAvailableSlots([]);
                      try {
                        setLoadingSlots(true);
                        const res = await fetch(
                          `/api/hospital_doctor/patients/appointments/available?date=${dateStr}`,
                          { cache: "no-store" }
                        );
                        const json = await res.json();
                        setAvailableSlots(json.slots ?? []);
                      } finally {
                        setLoadingSlots(false);
                      }
                    }
                  }}
                  disabled={(date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return !availableDates.includes(dateStr);
                  }}
                  locale={fr}
                  className="rounded-md border"
                />
              )}
            </div>

            {availableDate && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Créneau horaire
                </label>
                <Select
                  value={(apptForm as any).slotIso ?? ""}
                  onValueChange={(v) =>
                    setApptForm((s) => ({ ...s, slotIso: v as any }))
                  }
                  disabled={
                    !availableDate ||
                    loadingSlots ||
                    availableSlots.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingSlots
                          ? "Chargement..."
                          : availableSlots.length
                            ? "Sélectionner un créneau"
                            : "Aucun créneau disponible"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((s) => (
                      <SelectItem key={s.iso} value={s.iso}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Type de RDV supprimé (non utilisé) */}
            <Textarea
              placeholder="Notes (optionnel)"
              value={apptForm.notes ?? ""}
              onChange={(e) =>
                setApptForm((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApptOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                if (!detail || !availableDate || !(apptForm as any).slotIso) {
                  toast.error("Date et créneau requis");
                  return;
                }
                try {
                  setIsCreatingAppointment(true);
                  const scheduledAt = new Date(
                    (apptForm as any).slotIso as string
                  );
                  const res = await fetch(
                    `/api/hospital_doctor/patients/appointments`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        patientId: detail.patient.id,
                        scheduledAt: scheduledAt.toISOString(),
                        type: apptForm.type || null,
                        notes: apptForm.notes || null,
                      }),
                    }
                  );
                  if (!res.ok) throw new Error("Création impossible");
                  toast.success("Rendez-vous créé");
                  setApptOpen(false);
                  fetchDetail(detail.patient.id);
                  fetchList();
                } catch (e: any) {
                  toast.error(e?.message ?? "Erreur inconnue");
                } finally {
                  setIsCreatingAppointment(false);
                }
              }}
              disabled={isCreatingAppointment}
            >
              {isCreatingAppointment ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
