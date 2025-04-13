"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  Calendar,
  Download,
  FileText,
  FlaskConical,
  ImageIcon,
  Layers,
  Pill,
  Search,
  Share2,
  Stethoscope,
  File,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileImage,
  FileTextIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatientMedicalRecords } from "@/app/dashboard/patient/actions";
import Link from "next/link";

// Types
type RecordType =
  | "all"
  | "consultation"
  | "laboratory"
  | "imaging"
  | "prescription"
  | "vaccination"
  | "surgery"
  | "allergy"
  | "dental"
  | "ophthalmology";

type RecordStatus = "all" | "completed" | "active" | "pending";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  isActive: boolean;
};

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  uploadedAt: string;
};

type MedicalRecord = {
  id: string;
  title: string;
  date: string;
  doctor: string;
  specialty: string;
  facility: string;
  summary: string;
  recommendations?: string;
  notes?: string;
  followUpNeeded: boolean;
  followUpDate?: string;
  status: string;
  type: string;
  tags: string[];
  medications: Medication[];
  documents: Document[];
  vaccine?: {
    name: string;
    lot: string;
    expiration: string;
  };
};

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType>("all");
  const [selectedStatus, setSelectedStatus] = useState<RecordStatus>("all");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch medical records on component mount
  useEffect(() => {
    const fetchMedicalRecords = async () => {
      setIsLoading(true);
      try {
        const records = await getPatientMedicalRecords();
        setMedicalRecords(
          records.map((record) => ({
            ...record,
            recommendations: record.recommendations ?? undefined,
            notes: record.notes ?? undefined,
          }))
        );
      } catch (error) {
        console.error("Error fetching medical records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  // Get all unique tags from medical records
  const allTags = Array.from(
    new Set(medicalRecords.flatMap((record) => record.tags))
  );

  // Filter records based on search, type, status, and tags
  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType = selectedType === "all" || record.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => record.tags.includes(tag));

    return matchesSearch && matchesType && matchesStatus && matchesTags;
  });

  // Sort records by date (newest first)
  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Open record detail dialog
  const openRecordDetail = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  // Helper functions for UI
  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4 text-white" />;
      case "laboratory":
        return <FlaskConical className="h-4 w-4 text-white" />;
      case "imaging":
        return <ImageIcon className="h-4 w-4 text-white" />;
      case "prescription":
        return <Pill className="h-4 w-4 text-white" />;
      case "vaccination":
        return <Activity className="h-4 w-4 text-white" />;
      case "surgery":
        return <Activity className="h-4 w-4 text-white" />;
      case "allergy":
        return <Activity className="h-4 w-4 text-white" />;
      case "dental":
        return <Activity className="h-4 w-4 text-white" />;
      case "ophthalmology":
        return <Activity className="h-4 w-4 text-white" />;
      default:
        return <FileText className="h-4 w-4 text-white" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-500 text-white";
      case "laboratory":
        return "bg-purple-500 text-white";
      case "imaging":
        return "bg-amber-500 text-white";
      case "prescription":
        return "bg-emerald-500 text-white";
      case "vaccination":
        return "bg-teal-500 text-white";
      case "surgery":
        return "bg-red-500 text-white";
      case "allergy":
        return "bg-orange-500 text-white";
      case "dental":
        return "bg-cyan-500 text-white";
      case "ophthalmology":
        return "bg-indigo-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 hover:bg-green-100 text-green-800 border-green-200";
      case "active":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "";
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-4 w-4 text-blue-500" />;
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />;
      case "document":
        return <FileTextIcon className="h-4 w-4 text-blue-500" />;
      case "spreadsheet":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case "imaging":
        return <ImageIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Count records by type
  const countRecordsByType = (type: string) => {
    return medicalRecords.filter((r) => r.type === type).length;
  };

  // Count records by status
  const countRecordsByStatus = (status: string) => {
    return medicalRecords.filter((r) => r.status === status).length;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mon Dossier Médical
          </h2>
          <p className="text-muted-foreground">
            Consultez et gérez l&apos;ensemble de vos documents médicaux
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Exporter tout en PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" /> Partager avec un médecin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type de document
                </label>
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    setSelectedType(value as RecordType)
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="consultation">Consultations</SelectItem>
                    <SelectItem value="laboratory">Analyses</SelectItem>
                    <SelectItem value="imaging">Imagerie</SelectItem>
                    <SelectItem value="prescription">Ordonnances</SelectItem>
                    <SelectItem value="vaccination">Vaccinations</SelectItem>
                    <SelectItem value="surgery">Chirurgies</SelectItem>
                    <SelectItem value="allergy">Allergies</SelectItem>
                    <SelectItem value="dental">Dentaire</SelectItem>
                    <SelectItem value="ophthalmology">Ophtalmologie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Statut
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as RecordStatus)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="active">En cours</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-primary/10 text-primary" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedStatus("all");
                    setSelectedTags([]);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total des documents</span>
                <span className="font-medium">{medicalRecords.length}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par type</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />
                      Consultations
                    </span>
                    <span>{countRecordsByType("consultation")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <FlaskConical className="mr-2 h-4 w-4 text-purple-500" />
                      Analyses
                    </span>
                    <span>{countRecordsByType("laboratory")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <ImageIcon className="mr-2 h-4 w-4 text-amber-500" />
                      Imagerie
                    </span>
                    <span>{countRecordsByType("imaging")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Pill className="mr-2 h-4 w-4 text-emerald-500" />
                      Ordonnances
                    </span>
                    <span>{countRecordsByType("prescription")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Activity className="mr-2 h-4 w-4 text-teal-500" />
                      Autres
                    </span>
                    <span>
                      {
                        medicalRecords.filter(
                          (r) =>
                            ![
                              "consultation",
                              "laboratory",
                              "imaging",
                              "prescription",
                            ].includes(r.type)
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par statut</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                      Terminé
                    </span>
                    <span>{countRecordsByStatus("completed")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      En cours
                    </span>
                    <span>{countRecordsByStatus("active")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                      En attente
                    </span>
                    <span>{countRecordsByStatus("pending")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Documents médicaux</CardTitle>
                <CardDescription>
                  {filteredRecords.length} document
                  {filteredRecords.length !== 1 ? "s" : ""} trouvé
                  {filteredRecords.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8"
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Aucun document trouvé
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Essayez de modifier vos filtres ou d&apos;ajouter de
                    nouveaux documents.
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedRecords.map((record) => (
                    <Card
                      key={record.id}
                      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                      onClick={() => openRecordDetail(record)}
                    >
                      <div className={`p-2 ${getRecordTypeColor(record.type)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getRecordTypeIcon(record.type)}
                            <span className="ml-2 text-xs font-medium capitalize">
                              {record.type}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeVariant(record.status)}
                          >
                            {record.status === "completed"
                              ? "Terminé"
                              : record.status === "active"
                                ? "En cours"
                                : "En attente"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">
                          {record.title}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(parseISO(record.date), "d MMMM yyyy", {
                            locale: fr,
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Stethoscope className="mr-1 h-3 w-3" />
                          <span>
                            {record.doctor} - {record.specialty}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm">
                          {record.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {record.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {record.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{record.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {record.documents.length} document
                          {record.documents.length !== 1 ? "s" : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer"
                      onClick={() => openRecordDetail(record)}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${getRecordTypeColor(
                          record.type
                        )}`}
                      >
                        {getRecordTypeIcon(record.type)}
                      </div>
                      <div className="ml-4 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{record.title}</p>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeVariant(record.status)}
                          >
                            {record.status === "completed"
                              ? "Terminé"
                              : record.status === "active"
                                ? "En cours"
                                : "En attente"}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>
                            {format(parseISO(record.date), "d MMMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                          <span className="mx-1">•</span>
                          <Stethoscope className="mr-1 h-3 w-3" />
                          <span>{record.doctor}</span>
                          <span className="mx-1">•</span>
                          <FileText className="mr-1 h-3 w-3" />
                          <span>
                            {record.documents.length} document
                            {record.documents.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${getRecordTypeColor(
                        selectedRecord.type
                      )}`}
                    >
                      {getRecordTypeIcon(selectedRecord.type)}
                    </div>
                    <div className="ml-3">
                      <DialogTitle>{selectedRecord.title}</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          parseISO(selectedRecord.date),
                          "d MMMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeVariant(selectedRecord.status)}
                  >
                    {selectedRecord.status === "completed"
                      ? "Terminé"
                      : selectedRecord.status === "active"
                        ? "En cours"
                        : "En attente"}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Résumé</h4>
                    <p className="text-sm">{selectedRecord.summary}</p>
                  </div>

                  {selectedRecord.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        Recommandations
                      </h4>
                      <p className="text-sm">
                        {selectedRecord.recommendations}
                      </p>
                    </div>
                  )}

                  {selectedRecord.medications &&
                    selectedRecord.medications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Médicaments prescrits
                        </h4>
                        <div className="space-y-2">
                          {selectedRecord.medications.map((med, index) => (
                            <div
                              key={index}
                              className="flex items-center rounded-md border p-2"
                            >
                              <Pill className="h-4 w-4 text-emerald-500 mr-2" />
                              <div>
                                <p className="text-sm font-medium">
                                  {med.name} - {med.dosage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {med.frequency} • Durée: {med.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedRecord.vaccine && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Vaccin</h4>
                      <div className="rounded-md border p-3">
                        <p className="text-sm font-medium">
                          {selectedRecord.vaccine.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lot: {selectedRecord.vaccine.lot} • Expiration:{" "}
                          {selectedRecord.vaccine.expiration}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Documents associés
                    </h4>
                    <div className="space-y-2">
                      {selectedRecord.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center">
                            {getDocumentTypeIcon(doc.type)}
                            <span className="ml-2 text-sm">{doc.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              {doc.size}
                            </span>
                            <Link
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-3">Informations</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedRecord.doctor}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedRecord.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="text-sm">
                            {format(
                              parseISO(selectedRecord.date),
                              "EEEE d MMMM yyyy",
                              { locale: fr }
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(selectedRecord.date), "HH:mm", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm">{selectedRecord.facility}</p>
                          <p className="text-xs text-muted-foreground">
                            Établissement
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedRecord.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" /> Télécharger tout
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" /> Partager
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-8 w-full rounded-t-lg rounded-b-none" />
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-3 w-full mt-2" />
                      <Skeleton className="h-3 w-full mt-1" />
                      <div className="mt-3 flex gap-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-10 rounded-full" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
