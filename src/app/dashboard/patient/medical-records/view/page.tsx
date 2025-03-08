"use client";

import { useState } from "react";
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
  Plus,
  Search,
  Share2,
  Stethoscope,
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

// Sample medical record data
const medicalRecords = [
  {
    id: "rec-001",
    type: "consultation",
    title: "Consultation Cardiologie",
    doctor: "Dr. Sophie Martin",
    specialty: "Cardiologie",
    facility: "Hôpital Saint-Louis",
    date: "2024-12-10T10:30:00",
    summary:
      "Examen cardiaque de routine. Aucune anomalie détectée. Tension artérielle normale à 120/80 mmHg. Fréquence cardiaque au repos à 68 bpm.",
    recommendations:
      "Maintenir une activité physique régulière. Contrôle dans 12 mois.",
    documents: [
      {
        id: "doc-001",
        name: "Rapport de consultation",
        type: "pdf",
        size: "1.2 MB",
        date: "2024-12-10T14:30:00",
      },
      {
        id: "doc-002",
        name: "Électrocardiogramme",
        type: "pdf",
        size: "3.5 MB",
        date: "2024-12-10T11:45:00",
      },
    ],
    tags: ["cardiologie", "routine", "prévention"],
    status: "completed",
  },
  {
    id: "rec-002",
    type: "laboratory",
    title: "Analyse de sang complète",
    doctor: "Dr. Jean Dupont",
    specialty: "Hématologie",
    facility: "Laboratoire Central",
    date: "2024-11-25T09:15:00",
    summary:
      "Bilan sanguin complet. Tous les paramètres sont dans les normes. Légère carence en vitamine D notée.",
    recommendations:
      "Supplémentation en vitamine D recommandée. 1000 UI par jour pendant 3 mois.",
    documents: [
      {
        id: "doc-003",
        name: "Résultats d'analyse",
        type: "pdf",
        size: "0.8 MB",
        date: "2024-11-26T16:20:00",
      },
    ],
    tags: ["analyse", "sang", "vitamine D"],
    status: "completed",
  },
  {
    id: "rec-003",
    type: "imaging",
    title: "Radiographie pulmonaire",
    doctor: "Dr. Marie Lefevre",
    specialty: "Radiologie",
    facility: "Centre d'Imagerie Médicale",
    date: "2024-10-18T14:45:00",
    summary:
      "Radiographie thoracique réalisée suite à une toux persistante. Pas d'anomalie détectée. Champs pulmonaires clairs.",
    recommendations: "Aucune action supplémentaire nécessaire.",
    documents: [
      {
        id: "doc-004",
        name: "Radiographie pulmonaire",
        type: "image",
        size: "5.7 MB",
        date: "2024-10-18T15:30:00",
      },
      {
        id: "doc-005",
        name: "Rapport radiologique",
        type: "pdf",
        size: "0.6 MB",
        date: "2024-10-19T09:10:00",
      },
    ],
    tags: ["radiographie", "poumons", "thorax"],
    status: "completed",
  },
  {
    id: "rec-004",
    type: "prescription",
    title: "Ordonnance médicaments",
    doctor: "Dr. Thomas Dubois",
    specialty: "Médecine générale",
    facility: "Cabinet Médical Central",
    date: "2024-09-05T11:00:00",
    summary:
      "Prescription pour traitement d'hypertension artérielle et cholestérol.",
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "1x par jour",
        duration: "3 mois",
      },
      {
        name: "Atorvastatine",
        dosage: "20mg",
        frequency: "1x par jour",
        duration: "3 mois",
      },
    ],
    recommendations:
      "Suivi de la tension artérielle hebdomadaire. Contrôle sanguin dans 3 mois.",
    documents: [
      {
        id: "doc-006",
        name: "Ordonnance",
        type: "pdf",
        size: "0.3 MB",
        date: "2024-09-05T11:45:00",
      },
    ],
    tags: ["ordonnance", "hypertension", "cholestérol"],
    status: "active",
  },
  {
    id: "rec-005",
    type: "vaccination",
    title: "Vaccination grippe saisonnière",
    doctor: "Dr. Claire Moreau",
    specialty: "Médecine préventive",
    facility: "Centre de vaccination",
    date: "2024-10-01T10:15:00",
    summary:
      "Vaccination contre la grippe saisonnière. Aucune réaction immédiate.",
    vaccine: {
      name: "Vaxigrip Tetra",
      lot: "L34567",
      expiration: "2025-06-30",
    },
    recommendations:
      "Surveillance des effets secondaires pendant 48h. Vaccination annuelle recommandée.",
    documents: [
      {
        id: "doc-007",
        name: "Certificat de vaccination",
        type: "pdf",
        size: "0.2 MB",
        date: "2024-10-01T10:30:00",
      },
    ],
    tags: ["vaccination", "grippe", "prévention"],
    status: "completed",
  },
  {
    id: "rec-006",
    type: "surgery",
    title: "Appendicectomie",
    doctor: "Dr. Philippe Laurent",
    specialty: "Chirurgie digestive",
    facility: "Clinique Chirurgicale",
    date: "2023-05-12T08:00:00",
    summary:
      "Intervention chirurgicale pour appendicite aiguë. Opération réussie sans complications. Durée: 45 minutes.",
    recommendations:
      "Repos pendant 2 semaines. Éviter les efforts physiques pendant 1 mois. Retrait des points de suture prévu le 20/05/2023.",
    documents: [
      {
        id: "doc-008",
        name: "Compte-rendu opératoire",
        type: "pdf",
        size: "1.5 MB",
        date: "2023-05-12T14:20:00",
      },
      {
        id: "doc-009",
        name: "Consignes post-opératoires",
        type: "pdf",
        size: "0.4 MB",
        date: "2023-05-12T16:00:00",
      },
      {
        id: "doc-010",
        name: "Images peropératoires",
        type: "image",
        size: "8.2 MB",
        date: "2023-05-12T09:30:00",
      },
    ],
    tags: ["chirurgie", "appendicite", "hospitalisation"],
    status: "completed",
  },
  {
    id: "rec-007",
    type: "allergy",
    title: "Test allergologique",
    doctor: "Dr. Émilie Blanc",
    specialty: "Allergologie",
    facility: "Centre d'Allergologie",
    date: "2024-08-15T14:00:00",
    summary:
      "Tests cutanés réalisés pour suspicion d'allergie aux acariens et pollens. Réaction positive aux acariens et au pollen de bouleau.",
    recommendations:
      "Éviter l'exposition aux allergènes identifiés. Prescription d'antihistaminiques en cas de symptômes.",
    documents: [
      {
        id: "doc-011",
        name: "Résultats des tests allergologiques",
        type: "pdf",
        size: "0.7 MB",
        date: "2024-08-16T09:15:00",
      },
      {
        id: "doc-012",
        name: "Conseils pour allergies",
        type: "pdf",
        size: "0.5 MB",
        date: "2024-08-16T09:20:00",
      },
    ],
    tags: ["allergie", "acariens", "pollen"],
    status: "completed",
  },
  {
    id: "rec-008",
    type: "dental",
    title: "Examen dentaire",
    doctor: "Dr. Marc Petit",
    specialty: "Dentisterie",
    facility: "Cabinet Dentaire Sourire",
    date: "2024-07-20T15:30:00",
    summary:
      "Examen dentaire de routine. Détartrage effectué. Une carie détectée sur molaire inférieure droite.",
    recommendations:
      "Traitement de la carie recommandé dans les 2 mois. Maintenir une bonne hygiène bucco-dentaire.",
    documents: [
      {
        id: "doc-013",
        name: "Panoramique dentaire",
        type: "image",
        size: "4.3 MB",
        date: "2024-07-20T15:45:00",
      },
      {
        id: "doc-014",
        name: "Plan de traitement",
        type: "pdf",
        size: "0.3 MB",
        date: "2024-07-20T16:15:00",
      },
    ],
    tags: ["dentaire", "carie", "détartrage"],
    status: "pending",
  },
  {
    id: "rec-009",
    type: "ophthalmology",
    title: "Examen ophtalmologique",
    doctor: "Dr. Sophie Legrand",
    specialty: "Ophtalmologie",
    facility: "Centre de la Vision",
    date: "2024-06-05T09:30:00",
    summary:
      "Examen de la vue complet. Légère myopie détectée (-1.25 OD, -1.50 OG). Tension oculaire normale.",
    recommendations:
      "Port de lunettes recommandé pour la conduite et les activités nécessitant une vision de loin.",
    documents: [
      {
        id: "doc-015",
        name: "Ordonnance lunettes",
        type: "pdf",
        size: "0.2 MB",
        date: "2024-06-05T10:15:00",
      },
      {
        id: "doc-016",
        name: "Résultats examen",
        type: "pdf",
        size: "0.5 MB",
        date: "2024-06-05T10:20:00",
      },
    ],
    tags: ["ophtalmologie", "myopie", "lunettes"],
    status: "completed",
  },
  {
    id: "rec-010",
    type: "consultation",
    title: "Consultation Dermatologie",
    doctor: "Dr. Antoine Rousseau",
    specialty: "Dermatologie",
    facility: "Clinique de la Peau",
    date: "2024-05-10T16:00:00",
    summary:
      "Consultation pour examen de grains de beauté. Aucune lésion suspecte détectée. Conseils de protection solaire donnés.",
    recommendations:
      "Appliquer une protection solaire SPF 50+ lors d'exposition au soleil. Surveillance annuelle recommandée.",
    documents: [
      {
        id: "doc-017",
        name: "Rapport dermatologique",
        type: "pdf",
        size: "0.6 MB",
        date: "2024-05-10T17:00:00",
      },
      {
        id: "doc-018",
        name: "Photos dermatologiques",
        type: "image",
        size: "3.8 MB",
        date: "2024-05-10T16:30:00",
      },
    ],
    tags: ["dermatologie", "grains de beauté", "prévention"],
    status: "completed",
  },
];

// Type definitions for better TypeScript support
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
type DocumentType = "pdf" | "image" | "other";

// Helper function to get icon for record type
const getRecordTypeIcon = (type: string) => {
  switch (type) {
    case "consultation":
      return <Stethoscope className="h-5 w-5" />;
    case "laboratory":
      return <FlaskConical className="h-5 w-5" />;
    case "imaging":
      return <ImageIcon className="h-5 w-5" />;
    case "prescription":
      return <Pill className="h-5 w-5" />;
    case "vaccination":
      return <Activity className="h-5 w-5" />;
    case "surgery":
      return <Stethoscope className="h-5 w-5" />;
    case "allergy":
      return <Activity className="h-5 w-5" />;
    case "dental":
      return <Activity className="h-5 w-5" />;
    case "ophthalmology":
      return <Activity className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Helper function to get color for record type
const getRecordTypeColor = (type: string) => {
  switch (type) {
    case "consultation":
      return "text-blue-500 bg-blue-50";
    case "laboratory":
      return "text-purple-500 bg-purple-50";
    case "imaging":
      return "text-amber-500 bg-amber-50";
    case "prescription":
      return "text-emerald-500 bg-emerald-50";
    case "vaccination":
      return "text-teal-500 bg-teal-50";
    case "surgery":
      return "text-red-500 bg-red-50";
    case "allergy":
      return "text-orange-500 bg-orange-50";
    case "dental":
      return "text-cyan-500 bg-cyan-50";
    case "ophthalmology":
      return "text-indigo-500 bg-indigo-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
};

// Helper function to get badge color for record status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "active":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "pending":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

// Helper function to get icon for document type
const getDocumentTypeIcon = (type: DocumentType) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<RecordType>("all");
  const [selectedStatus, setSelectedStatus] = useState<RecordStatus>("all");
  const [selectedRecord, setSelectedRecord] = useState<
    (typeof medicalRecords)[0] | null
  >(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
  const openRecordDetail = (record: (typeof medicalRecords)[0]) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

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
          <Button asChild>
            <a href="/dashboard/patient/medical-records/upload">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un document
            </a>
          </Button>
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
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? "bg-primary/10 text-primary"
                          : ""
                      }`}
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
                    <span>
                      {
                        medicalRecords.filter((r) => r.type === "consultation")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <FlaskConical className="mr-2 h-4 w-4 text-purple-500" />
                      Analyses
                    </span>
                    <span>
                      {
                        medicalRecords.filter((r) => r.type === "laboratory")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <ImageIcon className="mr-2 h-4 w-4 text-amber-500" />
                      Imagerie
                    </span>
                    <span>
                      {
                        medicalRecords.filter((r) => r.type === "imaging")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Pill className="mr-2 h-4 w-4 text-emerald-500" />
                      Ordonnances
                    </span>
                    <span>
                      {
                        medicalRecords.filter((r) => r.type === "prescription")
                          .length
                      }
                    </span>
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
                    <span>
                      {
                        medicalRecords.filter((r) => r.status === "completed")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      En cours
                    </span>
                    <span>
                      {
                        medicalRecords.filter((r) => r.status === "active")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                      En attente
                    </span>
                    <span>
                      {
                        medicalRecords.filter((r) => r.status === "pending")
                          .length
                      }
                    </span>
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

                  {selectedRecord.medications && (
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
                            {getDocumentTypeIcon(doc.type as DocumentType)}
                            <span className="ml-2 text-sm">{doc.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              {doc.size}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
