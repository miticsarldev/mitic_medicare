/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  Download,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Star,
  Trash2,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for hospitals
const hospitals = [
  {
    id: "h1",
    name: "Hôpital Saint-Louis",
    type: "Hôpital Universitaire",
    address: "1 Avenue Claude Vellefaux, 75010 Paris",
    location: { lat: 48.8748, lng: 2.3684 },
    phone: "01 42 49 49 49",
    website: "https://hopital-saintlouis.aphp.fr",
    email: "contact@hopital-saintlouis.aphp.fr",
    rating: 4.2,
    reviewCount: 328,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Cardiologie",
      "Dermatologie",
      "Oncologie",
      "Neurologie",
      "Pédiatrie",
    ],
    services: [
      "Urgences 24/7",
      "Imagerie médicale",
      "Laboratoire d'analyses",
      "Consultations externes",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 245,
    beds: 650,
    founded: 1607,
    lastUpdated: "2024-02-15T10:30:00",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: "2025-02-15T00:00:00",
  },
  {
    id: "h2",
    name: "Hôpital Necker-Enfants Malades",
    type: "Hôpital Pédiatrique",
    address: "149 Rue de Sèvres, 75015 Paris",
    location: { lat: 48.8472, lng: 2.3144 },
    phone: "01 44 49 40 00",
    website: "https://hopital-necker.aphp.fr",
    email: "contact@hopital-necker.aphp.fr",
    rating: 4.5,
    reviewCount: 412,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Pédiatrie",
      "Chirurgie pédiatrique",
      "Néphrologie",
      "Cardiologie pédiatrique",
    ],
    services: [
      "Urgences pédiatriques",
      "Transplantation",
      "Maladies rares",
      "Imagerie pédiatrique",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 320,
    beds: 500,
    founded: 1778,
    lastUpdated: "2024-02-10T14:45:00",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: "2025-01-10T00:00:00",
  },
  {
    id: "h3",
    name: "Hôpital Pitié-Salpêtrière",
    type: "Centre Hospitalier Universitaire",
    address: "47-83 Boulevard de l'Hôpital, 75013 Paris",
    location: { lat: 48.8399, lng: 2.3662 },
    phone: "01 42 16 00 00",
    website: "https://pitiesalpetriere.aphp.fr",
    email: "contact@pitiesalpetriere.aphp.fr",
    rating: 4.3,
    reviewCount: 567,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Neurologie",
      "Cardiologie",
      "Psychiatrie",
      "Médecine interne",
      "Chirurgie",
    ],
    services: [
      "Urgences 24/7",
      "Neurochirurgie",
      "Transplantation cardiaque",
      "Centre AVC",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 780,
    beds: 1600,
    founded: 1656,
    lastUpdated: "2024-02-05T11:30:00",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-12-05T00:00:00",
  },
  {
    id: "h4",
    name: "Hôpital Européen Georges-Pompidou",
    type: "Hôpital Général",
    address: "20 Rue Leblanc, 75015 Paris",
    location: { lat: 48.8372, lng: 2.2751 },
    phone: "01 56 09 20 00",
    website: "https://hegp.aphp.fr",
    email: "contact@hegp.aphp.fr",
    rating: 4.4,
    reviewCount: 289,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Cardiologie",
      "Cancérologie",
      "Néphrologie",
      "Urologie",
      "Vasculaire",
    ],
    services: [
      "Urgences 24/7",
      "Chirurgie robotique",
      "Transplantation rénale",
      "Radiothérapie",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 420,
    beds: 800,
    founded: 2000,
    lastUpdated: "2024-02-01T13:45:00",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-11-01T00:00:00",
  },
  {
    id: "h5",
    name: "Hôpital Cochin",
    type: "Centre Hospitalier Universitaire",
    address: "27 Rue du Faubourg Saint-Jacques, 75014 Paris",
    location: { lat: 48.8361, lng: 2.3372 },
    phone: "01 58 41 41 41",
    website: "https://hopital-cochin.aphp.fr",
    email: "contact@hopital-cochin.aphp.fr",
    rating: 4.1,
    reviewCount: 342,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Obstétrique",
      "Gynécologie",
      "Endocrinologie",
      "Rhumatologie",
      "Pneumologie",
    ],
    services: [
      "Maternité",
      "Centre du diabète",
      "Procréation médicalement assistée",
      "Médecine interne",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 380,
    beds: 950,
    founded: 1780,
    lastUpdated: "2024-01-28T10:10:00",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-10-28T00:00:00",
  },
  {
    id: "h6",
    name: "Clinique des Champs-Élysées",
    type: "Clinique Privée",
    address: "15 Avenue des Champs-Élysées, 75008 Paris",
    location: { lat: 48.8698, lng: 2.3075 },
    phone: "01 53 93 03 03",
    website: "https://www.cliniquedeschampselysees.com",
    email: "contact@cliniquedeschampselysees.com",
    rating: 4.7,
    reviewCount: 215,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Dermatologie",
      "Chirurgie esthétique",
      "Médecine esthétique",
      "Laser",
    ],
    services: [
      "Consultations spécialisées",
      "Injections",
      "Traitements laser",
      "Chirurgie ambulatoire",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 25,
    beds: 15,
    founded: 1998,
    lastUpdated: "2024-01-25T15:30:00",
    subscriptionPlan: "standard",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-09-25T00:00:00",
  },
  {
    id: "h7",
    name: "Centre Médical Montparnasse",
    type: "Centre Médical",
    address: "22 Rue du Départ, 75014 Paris",
    location: { lat: 48.8422, lng: 2.3229 },
    phone: "01 43 20 90 90",
    website: "https://www.centremedicalmontparnasse.fr",
    email: "contact@centremedicalmontparnasse.fr",
    rating: 4.0,
    reviewCount: 178,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Médecine générale",
      "Ophtalmologie",
      "Dentaire",
      "Radiologie",
      "ORL",
    ],
    services: [
      "Consultations",
      "Analyses médicales",
      "Radiographie",
      "Échographie",
    ],
    status: "active",
    verificationStatus: "pending",
    doctors: 45,
    beds: 0,
    founded: 1985,
    lastUpdated: "2024-01-22T11:45:00",
    subscriptionPlan: "standard",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-08-22T00:00:00",
  },
  {
    id: "h8",
    name: "Clinique Internationale du Parc Monceau",
    type: "Clinique Privée",
    address: "21 Rue de Chazelles, 75017 Paris",
    location: { lat: 48.8794, lng: 2.3065 },
    phone: "01 47 63 01 01",
    website: "https://www.clinique-parc-monceau.com",
    email: "contact@clinique-parc-monceau.com",
    rating: 4.6,
    reviewCount: 203,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Chirurgie orthopédique",
      "Chirurgie digestive",
      "Ophtalmologie",
      "Urologie",
    ],
    services: [
      "Bloc opératoire",
      "Hospitalisation",
      "Consultations",
      "Imagerie médicale",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 60,
    beds: 85,
    founded: 1974,
    lastUpdated: "2024-01-20T14:15:00",
    subscriptionPlan: "standard",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-07-20T00:00:00",
  },
  {
    id: "h9",
    name: "Hôpital Américain de Paris",
    type: "Hôpital Privé",
    address: "63 Boulevard Victor Hugo, 92200 Neuilly-sur-Seine",
    location: { lat: 48.8841, lng: 2.2679 },
    phone: "01 46 41 25 25",
    website: "https://www.american-hospital.org",
    email: "contact@american-hospital.org",
    rating: 4.8,
    reviewCount: 245,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Cardiologie",
      "Oncologie",
      "Chirurgie",
      "Gynécologie",
      "Orthopédie",
    ],
    services: [
      "Urgences 24/7",
      "Chirurgie",
      "Imagerie médicale",
      "Check-up santé",
    ],
    status: "active",
    verificationStatus: "verified",
    doctors: 150,
    beds: 187,
    founded: 1909,
    lastUpdated: "2024-01-18T09:30:00",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-12-18T00:00:00",
  },
  {
    id: "h10",
    name: "Clinique de la Muette",
    type: "Clinique Privée",
    address: "46 Rue Nicolo, 75116 Paris",
    location: { lat: 48.8572, lng: 2.2736 },
    phone: "01 44 30 27 00",
    website: "https://www.cliniquedelamuette.fr",
    email: "contact@cliniquedelamuette.fr",
    rating: 4.3,
    reviewCount: 156,
    image: "/placeholder.svg?height=200&width=400",
    specialties: ["Chirurgie", "Gynécologie", "Urologie", "ORL"],
    services: ["Bloc opératoire", "Hospitalisation", "Consultations"],
    status: "inactive",
    verificationStatus: "rejected",
    doctors: 30,
    beds: 45,
    founded: 1962,
    lastUpdated: "2024-01-15T16:45:00",
    subscriptionPlan: "standard",
    subscriptionStatus: "expired",
    subscriptionExpiry: "2024-01-15T00:00:00",
  },
];

// Sample data for hospital types
const hospitalTypes = [
  "Hôpital Universitaire",
  "Hôpital Général",
  "Clinique Privée",
  "Centre Médical",
  "Hôpital Pédiatrique",
  "Centre Hospitalier Universitaire",
  "Hôpital Privé",
];

// Sample data for subscription plans
// const subscriptionPlans = ["standard", "premium", "enterprise"];

// Helper function to format date
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Actif
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Inactif
        </Badge>
      );
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

// Helper function to get verification status badge
const getVerificationBadge = (status: string) => {
  switch (status) {
    case "verified":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Vérifié
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          En attente
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Rejeté
        </Badge>
      );
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

// Helper function to get subscription status badge
const getSubscriptionBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Actif
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Expiré
        </Badge>
      );
    case "trial":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Essai
        </Badge>
      );
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

export default function HospitalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedVerificationStatus, setSelectedVerificationStatus] =
    useState<string>("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] =
    useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<
    (typeof hospitals)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter hospitals based on search, status, type, verification status, and subscription plan
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      searchQuery === "" ||
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      selectedStatus === "all" || hospital.status === selectedStatus;

    const matchesType =
      selectedType === "all" || hospital.type === selectedType;

    const matchesVerificationStatus =
      selectedVerificationStatus === "all" ||
      hospital.verificationStatus === selectedVerificationStatus;

    const matchesSubscriptionPlan =
      selectedSubscriptionPlan === "all" ||
      hospital.subscriptionPlan === selectedSubscriptionPlan;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesVerificationStatus &&
      matchesSubscriptionPlan
    );
  });

  // Sort hospitals
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortColumn === "type") {
      comparison = a.type.localeCompare(b.type);
    } else if (sortColumn === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortColumn === "verificationStatus") {
      comparison = a.verificationStatus.localeCompare(b.verificationStatus);
    } else if (sortColumn === "doctors") {
      comparison = a.doctors - b.doctors;
    } else if (sortColumn === "beds") {
      comparison = a.beds - b.beds;
    } else if (sortColumn === "rating") {
      comparison = a.rating - b.rating;
    } else if (sortColumn === "lastUpdated") {
      comparison =
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Toggle sort
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Open hospital detail dialog
  const openHospitalDetail = (hospital: (typeof hospitals)[0]) => {
    setSelectedHospital(hospital);
    setIsDetailOpen(true);
  };

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === sortedHospitals.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedHospitals.map((hospital) => hospital.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    // In a real app, this would call an API to perform the action on all selected rows
    console.log(`Performing ${action} on ${selectedRows.length} hospitals`);
    setSelectedRows([]);
  };

  // Calculate statistics
  const totalHospitals = hospitals.length;
  const activeHospitals = hospitals.filter((h) => h.status === "active").length;
  const inactiveHospitals = hospitals.filter(
    (h) => h.status === "inactive"
  ).length;
  const verifiedHospitals = hospitals.filter(
    (h) => h.verificationStatus === "verified"
  ).length;
  //   const pendingVerificationHospitals = hospitals.filter(
  //     (h) => h.verificationStatus === "pending"
  //   ).length;
  //   const rejectedVerificationHospitals = hospitals.filter(
  //     (h) => h.verificationStatus === "rejected"
  //   ).length;
  const premiumSubscriptions = hospitals.filter(
    (h) => h.subscriptionPlan === "premium"
  ).length;
  const standardSubscriptions = hospitals.filter(
    (h) => h.subscriptionPlan === "standard"
  ).length;
  //   const enterpriseSubscriptions = hospitals.filter(
  //     (h) => h.subscriptionPlan === "enterprise"
  //   ).length;
  const totalDoctors = hospitals.reduce(
    (sum, hospital) => sum + hospital.doctors,
    0
  );
  const totalBeds = hospitals.reduce((sum, hospital) => sum + hospital.beds, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestion des établissements
          </h2>
          <p className="text-muted-foreground">
            Gérez les hôpitaux, cliniques et centres médicaux enregistrés sur la
            plateforme
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un établissement
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Liste des établissements</CardTitle>
              <Tabs defaultValue="all" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="all"
                    onClick={() => setSelectedStatus("all")}
                  >
                    Tous ({totalHospitals})
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    onClick={() => setSelectedStatus("active")}
                  >
                    Actifs ({activeHospitals})
                  </TabsTrigger>
                  <TabsTrigger
                    value="inactive"
                    onClick={() => setSelectedStatus("inactive")}
                  >
                    Inactifs ({inactiveHospitals})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pt-4">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {hospitalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedVerificationStatus}
                  onValueChange={setSelectedVerificationStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Vérification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="verified">Vérifiés</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="rejected">Rejetés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedRows.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedRows.length} sélectionné(s)
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("activate")}
                      >
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Activer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("deactivate")}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                        Désactiver
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("export")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox
                        checked={
                          selectedRows.length === sortedHospitals.length &&
                          sortedHospitals.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-[250px]">
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("name")}
                      >
                        <span>Nom</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("type")}
                      >
                        <span>Type</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("verificationStatus")}
                      >
                        <span>Vérification</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("doctors")}
                      >
                        <span>Médecins</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("rating")}
                      >
                        <span>Note</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("status")}
                      >
                        <span>Statut</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHospitals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Aucun établissement trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedHospitals.map((hospital) => (
                      <TableRow
                        key={hospital.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openHospitalDetail(hospital)}
                      >
                        <TableCell
                          className="w-[30px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedRows.includes(hospital.id)}
                            onCheckedChange={() =>
                              toggleRowSelection(hospital.id)
                            }
                            aria-label={`Select ${hospital.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32`}
                                alt={hospital.name}
                              />
                              <AvatarFallback>
                                {hospital.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {hospital.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {hospital.address}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{hospital.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getVerificationBadge(hospital.verificationStatus)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{hospital.doctors}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm">
                              {hospital.rating}
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({hospital.reviewCount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(hospital.status)}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openHospitalDetail(hospital)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {hospital.status === "active" ? (
                                <DropdownMenuItem>
                                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                  Désactiver
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                  Activer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Affichage de {sortedHospitals.length} sur {totalHospitals}{" "}
              établissements
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled>
                Suivant
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Établissements actifs
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {activeHospitals}
                  </span>
                </div>
                <Progress
                  value={(activeHospitals / totalHospitals) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Établissements vérifiés
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {verifiedHospitals}
                  </span>
                </div>
                <Progress
                  value={(verifiedHospitals / totalHospitals) * 100}
                  className="h-2"
                />
              </div>
              <Separator />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Abonnements Premium
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {premiumSubscriptions}
                  </span>
                </div>
                <Progress
                  value={(premiumSubscriptions / totalHospitals) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Abonnements Standard
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {standardSubscriptions}
                  </span>
                </div>
                <Progress
                  value={(standardSubscriptions / totalHospitals) * 100}
                  className="h-2"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total médecins</span>
                  <span className="text-sm font-medium">{totalDoctors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total lits</span>
                  <span className="text-sm font-medium">{totalBeds}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Ajouter un établissement
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Vérifier les établissements en attente
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Voir les rapports détaillés
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hospital Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedHospital && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedHospital.name}</DialogTitle>
                  {getStatusBadge(selectedHospital.status)}
                </div>
                <DialogDescription>
                  {selectedHospital.type} • Dernière mise à jour le{" "}
                  {formatDate(selectedHospital.lastUpdated)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4 md:grid-cols-2">
                <div>
                  <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
                    <img
                      src={selectedHospital.image || "/placeholder.svg"}
                      alt={selectedHospital.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Informations générales
                      </h3>
                      <div className="mt-2 rounded-md border p-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedHospital.address}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedHospital.phone}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={selectedHospital.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {selectedHospital.website}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedHospital.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Statistiques</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Médecins
                            </span>
                            <span className="text-sm">
                              {selectedHospital.doctors}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Lits</span>
                            <span className="text-sm">
                              {selectedHospital.beds}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Note</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 text-sm">
                                {selectedHospital.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Avis</span>
                            <span className="text-sm">
                              {selectedHospital.reviewCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Vérification</h3>
                      <div className="mt-2 rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Statut</span>
                          {getVerificationBadge(
                            selectedHospital.verificationStatus
                          )}
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Gérer la vérification
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Abonnement</h3>
                    <div className="mt-2 rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Plan</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedHospital.subscriptionPlan}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Statut</span>
                        {getSubscriptionBadge(
                          selectedHospital.subscriptionStatus
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Expiration</span>
                        <span className="text-sm">
                          {formatDate(selectedHospital.subscriptionExpiry)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier l&apos;abonnement
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Spécialités</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedHospital.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Services</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedHospital.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">
                      Informations supplémentaires
                    </h3>
                    <div className="mt-2 rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Fondé en</span>
                        <span className="text-sm">
                          {selectedHospital.founded}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier l&apos;établissement
                    </Button>
                    {selectedHospital.status === "active" ? (
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Désactiver l&apos;établissement
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Activer l&apos;établissement
                      </Button>
                    )}
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

// Missing component definition for Globe and Mail
const Globe = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};

const Mail = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
};
