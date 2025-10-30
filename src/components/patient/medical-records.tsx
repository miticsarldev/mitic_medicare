"use client";

import { useState, useMemo } from "react";
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
  Stethoscope,
  File,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileImage,
  FileTextIcon,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  CalendarClock,
  Filter,
  X,
  MapPin,
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  GetPatientMedicalRecordsResult,
  PatientMedicalRecord,
} from "@/app/dashboard/patient/types";

type MedicalRecordsClientProps = {
  initialData: GetPatientMedicalRecordsResult;
};

export function MedicalRecordsClient({
  initialData,
}: MedicalRecordsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRecord, setSelectedRecord] =
    useState<PatientMedicalRecord | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [medicalRecords] = useState<PatientMedicalRecord[]>(
    initialData.success ? initialData.records : []
  );
  //   const [isLoading, setIsLoading] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Get all unique tags from medical records
  const allTags = useMemo(() => {
    return Array.from(new Set(medicalRecords.flatMap((record) => record.tags)));
  }, [medicalRecords]);

  // Filter records based on search, type, status, and tags
  const filteredRecords = useMemo(() => {
    return medicalRecords.filter((record) => {
      const matchesSearch =
        searchQuery === "" ||
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesType =
        selectedType === "all" || record.type === selectedType;
      const matchesStatus =
        selectedStatus === "all" || record.status === selectedStatus;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => record.tags.includes(tag));

      return matchesSearch && matchesType && matchesStatus && matchesTags;
    });
  }, [medicalRecords, searchQuery, selectedType, selectedStatus, selectedTags]);

  // Sort records by date (newest first)
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredRecords]);

  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Open record detail dialog
  const openRecordDetail = (record: PatientMedicalRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
    setActiveTab("overview");
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedTags([]);
  };

  // Helper functions for UI
  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4" />;
      case "laboratory":
        return <FlaskConical className="h-4 w-4" />;
      case "imaging":
        return <ImageIcon className="h-4 w-4" />;
      case "prescription":
        return <Pill className="h-4 w-4" />;
      case "vaccination":
        return <Activity className="h-4 w-4" />;
      case "surgery":
        return <Activity className="h-4 w-4" />;
      case "allergy":
        return <AlertCircle className="h-4 w-4" />;
      case "dental":
        return <Activity className="h-4 w-4" />;
      case "ophthalmology":
        return <Activity className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
        return "bg-green-100 hover:bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900";
      case "active":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900";
      case "pending":
        return "bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900";
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

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function translateStatus(status: string) {
    switch (status) {
      case "completed":
        return "Terminé";
      case "active":
        return "En cours";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  }

  function translateType(type: string) {
    switch (type) {
      case "consultation":
        return "Consultation";
      case "laboratory":
        return "Analyses";
      case "imaging":
        return "Imagerie";
      case "prescription":
        return "Ordonnance";
      case "vaccination":
        return "Vaccination";
      case "surgery":
        return "Chirurgie";
      case "allergy":
        return "Allergie";
      case "dental":
        return "Dentaire";
      case "ophthalmology":
        return "Ophtalmologie";
      default:
        return capitalizeFirstLetter(type);
    }
  }

  // Count records by type
  const countRecordsByType = (type: string) => {
    return medicalRecords.filter((r) => r.type === type).length;
  };

  // Count records by status
  const countRecordsByStatus = (status: string) => {
    return medicalRecords.filter((r) => r.status === status).length;
  };

  // Get upcoming follow-ups
  const upcomingFollowUps = useMemo(() => {
    const today = new Date();
    return medicalRecords.filter(
      (record) =>
        record.followUpNeeded &&
        record.followUpDate &&
        new Date(record.followUpDate) >= today
    );
  }, [medicalRecords]);

  return (
    <div className="space-y-6">
      {/* Mobile filter button (visible on small screens) */}
      <div className="flex md:hidden mb-4">
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {(selectedType !== "all" ||
                selectedStatus !== "all" ||
                selectedTags.length > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {selectedType !== "all" &&
                  selectedStatus !== "all" &&
                  selectedTags.length > 0
                    ? "3+"
                    : selectedType !== "all" && selectedStatus !== "all"
                      ? "2"
                      : selectedType !== "all" ||
                          selectedStatus !== "all" ||
                          selectedTags.length > 0
                        ? "1"
                        : ""}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <MobileFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                resetFilters={resetFilters}
                allTags={allTags}
                medicalRecords={medicalRecords}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar with filters - hidden on mobile */}
        <div className="hidden md:block md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
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
                  onValueChange={(value) => setSelectedType(value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Array.from(new Set(medicalRecords.map((r) => r.type))).map(
                      (type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-2 w-2 rounded-full ${getRecordTypeColor(type)}`}
                            />
                            {translateType(type)}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Statut
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Array.from(
                      new Set(medicalRecords.map((r) => r.status))
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {translateStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X
                          className="ml-1 h-3 w-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTag(tag);
                          }}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total des documents</span>
                <span className="font-medium">{medicalRecords.length}</span>
              </div>
              <Separator />
              <div className="space-y-3">
                <span className="text-sm font-medium">Par type</span>
                <div className="space-y-2">
                  {Array.from(new Set(medicalRecords.map((r) => r.type)))
                    .sort(
                      (a, b) => countRecordsByType(b) - countRecordsByType(a)
                    )
                    .slice(0, 5)
                    .map((type) => (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <span
                              className={`mr-2 h-2 w-2 rounded-full ${getRecordTypeColor(type).replace("text-white", "")}`}
                            />
                            {translateType(type)}
                          </span>
                          <span>{countRecordsByType(type)}</span>
                        </div>
                        <Progress
                          value={
                            (countRecordsByType(type) / medicalRecords.length) *
                            100
                          }
                          className="h-1"
                        />
                      </div>
                    ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <span className="text-sm font-medium">Par statut</span>
                <div className="space-y-2">
                  {Array.from(new Set(medicalRecords.map((r) => r.status))).map(
                    (status) => (
                      <div
                        key={status}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center">
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              status === "completed"
                                ? "bg-green-500"
                                : status === "active"
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {translateStatus(status)}
                        </span>
                        <span>{countRecordsByStatus(status)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {upcomingFollowUps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Suivis à venir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingFollowUps.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-2 rounded-md border hover:bg-accent cursor-pointer"
                    onClick={() => openRecordDetail(record)}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${getRecordTypeColor(record.type)}`}
                    >
                      {getRecordTypeIcon(record.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {record.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.followUpDate &&
                          format(parseISO(record.followUpDate), "d MMMM yyyy", {
                            locale: fr,
                          })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Documents médicaux</CardTitle>
                <CardDescription>
                  {filteredRecords.length} document
                  {filteredRecords.length !== 1 ? "s" : ""} trouvé
                  {filteredRecords.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8"
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vue grille</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className="h-8 w-8"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vue liste</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedRecords.map((record) => (
                    <Card
                      key={record.id}
                      className="overflow-hidden transition-all hover:shadow-md cursor-pointer border-t-4"
                      style={{
                        borderTopColor: getRecordTypeColor(record.type).split(
                          " "
                        )[0],
                      }}
                      onClick={() => openRecordDetail(record)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeVariant(record.status)}
                          >
                            {translateStatus(record.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(record.date), "d MMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <CardTitle className="text-base line-clamp-1">
                          {record.title}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <div className="flex items-center gap-1">
                            <span
                              className={`h-2 w-2 rounded-full ${getRecordTypeColor(record.type).split(" ")[0]}`}
                            />
                            {translateType(record.type)}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Stethoscope className="mr-1 h-3 w-3" />
                          <span className="truncate">
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
                        {record.followUpNeeded && record.followUpDate && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <CalendarClock className="h-3 w-3" />
                            <span>
                              {format(parseISO(record.followUpDate), "d MMM", {
                                locale: fr,
                              })}
                            </span>
                          </Badge>
                        )}
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
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${getRecordTypeColor(record.type)}`}
                      >
                        {getRecordTypeIcon(record.type)}
                      </div>
                      <div className="ml-4 flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {record.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeVariant(record.status)}
                          >
                            {translateStatus(record.status)}
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
                          <span className="truncate">{record.doctor}</span>
                          {record.followUpNeeded && record.followUpDate && (
                            <>
                              <span className="mx-1">•</span>
                              <CalendarClock className="mr-1 h-3 w-3" />
                              <span>
                                Suivi le{" "}
                                {format(
                                  parseISO(record.followUpDate),
                                  "d MMM yyyy",
                                  {
                                    locale: fr,
                                  }
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex items-center">
                        <span className="text-xs text-muted-foreground mr-2">
                          {record.documents.length} doc
                          {record.documents.length !== 1 ? "s" : ""}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
        <DialogContent className="w-[calc(100%-1rem)] max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    selectedRecord
                      ? getRecordTypeColor(selectedRecord.type)
                      : ""
                  }`}
                >
                  {selectedRecord && getRecordTypeIcon(selectedRecord.type)}
                </div>
                <div className="ml-3">
                  <DialogTitle className="text-xl">
                    {selectedRecord?.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord &&
                      format(
                        parseISO(selectedRecord.date),
                        "d MMMM yyyy à HH:mm",
                        { locale: fr }
                      )}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedRecord && (
            <ScrollArea className="h-[calc(90vh-8rem)] sm:h-[calc(90vh-10rem)]">
              <div className="p-4 sm:p-6 pt-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger
                      value="overview"
                      className="text-xs sm:text-sm"
                    >
                      Aperçu
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="text-xs sm:text-sm"
                    >
                      Documents
                      <Badge
                        variant="secondary"
                        className="ml-1 sm:ml-2 text-xs"
                      >
                        {selectedRecord.documents.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="medications"
                      className="text-xs sm:text-sm"
                    >
                      Médicaments
                      <Badge
                        variant="secondary"
                        className="ml-1 sm:ml-2 text-xs"
                      >
                        {selectedRecord.medications.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="pt-4">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="md:col-span-2 space-y-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Résumé</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{selectedRecord.summary}</p>
                          </CardContent>
                        </Card>

                        {selectedRecord.recommendations && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Recommandations
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p>{selectedRecord.recommendations}</p>
                            </CardContent>
                          </Card>
                        )}

                        {selectedRecord.notes && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p>{selectedRecord.notes}</p>
                            </CardContent>
                          </Card>
                        )}

                        {selectedRecord.followUpNeeded && (
                          <Card className="border-blue-200 dark:border-blue-800">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <CalendarClock className="h-4 w-4 text-blue-500" />
                                Suivi médical
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p>
                                Un suivi médical est recommandé
                                {selectedRecord.followUpDate && (
                                  <>
                                    {" "}
                                    le{" "}
                                    <strong>
                                      {format(
                                        parseISO(selectedRecord.followUpDate),
                                        "d MMMM yyyy",
                                        {
                                          locale: fr,
                                        }
                                      )}
                                    </strong>
                                  </>
                                )}
                                .
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                size="sm"
                              >
                                Prendre rendez-vous
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Informations
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src="/placeholder.svg?height=40&width=40"
                                  alt={selectedRecord.doctor}
                                />
                                <AvatarFallback>
                                  {selectedRecord.doctor.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {selectedRecord.doctor}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {selectedRecord.specialty}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm">
                                    {format(
                                      parseISO(selectedRecord.date),
                                      "EEEE d MMMM yyyy",
                                      {
                                        locale: fr,
                                      }
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(
                                      parseISO(selectedRecord.date),
                                      "HH:mm",
                                      {
                                        locale: fr,
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm">
                                    {selectedRecord.facility}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Établissement
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm">
                                    {translateType(selectedRecord.type)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Type de document
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <p className="text-sm font-medium mb-2">Tags</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedRecord.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {selectedRecord.medications.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Pill className="h-4 w-4 text-emerald-500" />
                                Médicaments
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {selectedRecord.medications
                                  .slice(0, 3)
                                  .map((med, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center rounded-md border p-2"
                                    >
                                      <div>
                                        <p className="text-sm font-medium">
                                          {med.name} - {med.dosage}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {med.frequency} • Durée:{" "}
                                          {med.duration}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                {selectedRecord.medications.length > 3 && (
                                  <Button
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => setActiveTab("medications")}
                                  >
                                    Voir tous les médicaments (
                                    {selectedRecord.medications.length})
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {selectedRecord.documents.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                Documents
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {selectedRecord.documents
                                  .slice(0, 3)
                                  .map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center justify-between rounded-md border p-2"
                                    >
                                      <div className="flex items-center min-w-0">
                                        {getDocumentTypeIcon(doc.type)}
                                        <span className="ml-2 text-sm truncate">
                                          {doc.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(doc.url, "_blank");
                                          }}
                                          title="Ouvrir"
                                        >
                                          <ArrowUpRight className="h-3 w-3" />
                                        </Button>
                                        <Link
                                          href={doc.url}
                                          download={doc.name}
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                                          title="Télécharger"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                {selectedRecord.documents.length > 3 && (
                                  <Button
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => setActiveTab("documents")}
                                  >
                                    Voir tous les documents (
                                    {selectedRecord.documents.length})
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Documents associés</CardTitle>
                        <CardDescription>
                          {selectedRecord.documents.length} document
                          {selectedRecord.documents.length !== 1
                            ? "s"
                            : ""}{" "}
                          disponible
                          {selectedRecord.documents.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedRecord.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center min-w-0">
                                {getDocumentTypeIcon(doc.type)}
                                <div className="ml-3 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {doc.name}
                                  </p>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <span>{doc.size}</span>
                                    <span className="mx-1">•</span>
                                    <span>
                                      {format(
                                        parseISO(doc.uploadedAt),
                                        "d MMM yyyy",
                                        {
                                          locale: fr,
                                        }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(doc.url, "_blank");
                                  }}
                                  title="Ouvrir dans un nouvel onglet"
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement("a");
                                    link.href = doc.url;
                                    link.download = doc.name;
                                    link.click();
                                  }}
                                  title="Télécharger"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="medications" className="pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Médicaments prescrits</CardTitle>
                        <CardDescription>
                          {selectedRecord.medications.length} médicament
                          {selectedRecord.medications.length !== 1
                            ? "s"
                            : ""}{" "}
                          prescrit
                          {selectedRecord.medications.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedRecord.medications.map((med, index) => (
                            <div key={index} className="rounded-md border p-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-base font-medium">
                                  {med.name}
                                </h4>
                                <Badge
                                  variant={
                                    med.isActive ? "default" : "secondary"
                                  }
                                >
                                  {med.isActive ? "Actif" : "Terminé"}
                                </Badge>
                              </div>
                              <div className="mt-2 grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Dosage
                                  </p>
                                  <p className="text-sm">{med.dosage}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Fréquence
                                  </p>
                                  <p className="text-sm">{med.frequency}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Durée
                                  </p>
                                  <p className="text-sm">{med.duration}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="p-4 sm:p-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="w-full sm:w-auto"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mobile filters component
function MobileFilters({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  selectedTags,
  toggleTag,
  resetFilters,
  allTags,
  medicalRecords,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  resetFilters: () => void;
  allTags: string[];
  medicalRecords: PatientMedicalRecord[];
}) {
  function translateType(type: string) {
    switch (type) {
      case "consultation":
        return "Consultation";
      case "laboratory":
        return "Analyses";
      case "imaging":
        return "Imagerie";
      case "prescription":
        return "Ordonnance";
      case "vaccination":
        return "Vaccination";
      case "surgery":
        return "Chirurgie";
      case "allergy":
        return "Allergie";
      case "dental":
        return "Dentaire";
      case "ophthalmology":
        return "Ophtalmologie";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  function translateStatus(status: string) {
    switch (status) {
      case "completed":
        return "Terminé";
      case "active":
        return "En cours";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="mobile-search" className="text-sm font-medium">
          Recherche
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="mobile-search"
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="mobile-type" className="text-sm font-medium">
          Type de document
        </label>
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value)}
        >
          <SelectTrigger id="mobile-type">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Array.from(new Set(medicalRecords.map((r) => r.type))).map(
              (type) => (
                <SelectItem key={type} value={type}>
                  {translateType(type)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="mobile-status" className="text-sm font-medium">
          Statut
        </label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value)}
        >
          <SelectTrigger id="mobile-status">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Array.from(new Set(medicalRecords.map((r) => r.status))).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {translateStatus(status)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <X
                  className="ml-1 h-3 w-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                />
              )}
            </Badge>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
}
