"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  UserCog,
  UserX,
  FileText,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Sample data for patients
const patients = [
  {
    id: "P001",
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    phone: "06 12 34 56 78",
    dateOfBirth: "1982-05-15",
    gender: "Homme",
    address: "15 Rue de la Paix, 75002 Paris",
    registrationDate: "2023-01-10",
    lastLogin: "2024-03-08T14:30:00",
    status: "active",
    subscription: "Premium",
    appointmentsCount: 12,
    medicalRecordsCount: 8,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "CPAM",
    insuranceNumber: "1 82 05 75 042 042 12",
    emergencyContact: "Marie Dubois - 06 98 76 54 32",
    bloodType: "A+",
    allergies: ["Pénicilline", "Arachides"],
    chronicConditions: ["Hypertension"],
  },
  {
    id: "P002",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    phone: "07 23 45 67 89",
    dateOfBirth: "1990-08-22",
    gender: "Femme",
    address: "8 Avenue Montaigne, 75008 Paris",
    registrationDate: "2023-02-15",
    lastLogin: "2024-03-07T09:15:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 5,
    medicalRecordsCount: 3,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "MGEN",
    insuranceNumber: "2 90 08 75 123 456 78",
    emergencyContact: "Pierre Martin - 07 12 34 56 78",
    bloodType: "O+",
    allergies: [],
    chronicConditions: [],
  },
  {
    id: "P003",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "06 34 56 78 90",
    dateOfBirth: "1975-11-30",
    gender: "Homme",
    address: "25 Rue du Faubourg Saint-Honoré, 75008 Paris",
    registrationDate: "2023-03-05",
    lastLogin: "2024-03-01T16:45:00",
    status: "inactive",
    subscription: "Premium",
    appointmentsCount: 8,
    medicalRecordsCount: 6,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Allianz",
    insuranceNumber: "3 75 11 75 789 012 34",
    emergencyContact: "Jeanne Dupont - 06 45 67 89 01",
    bloodType: "B-",
    allergies: ["Sulfamides", "Lactose"],
    chronicConditions: ["Diabète type 2", "Asthme"],
  },
  {
    id: "P004",
    name: "Émilie Petit",
    email: "emilie.petit@example.com",
    phone: "07 45 67 89 01",
    dateOfBirth: "1988-04-12",
    gender: "Femme",
    address: "42 Boulevard Haussmann, 75009 Paris",
    registrationDate: "2023-04-20",
    lastLogin: "2024-03-05T11:20:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 3,
    medicalRecordsCount: 2,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "CPAM",
    insuranceNumber: "1 88 04 75 234 567 89",
    emergencyContact: "Lucas Petit - 07 56 78 90 12",
    bloodType: "A-",
    allergies: ["Aspirine"],
    chronicConditions: [],
  },
  {
    id: "P005",
    name: "Antoine Moreau",
    email: "antoine.moreau@example.com",
    phone: "06 56 78 90 12",
    dateOfBirth: "1965-09-08",
    gender: "Homme",
    address: "17 Rue de Rivoli, 75001 Paris",
    registrationDate: "2023-05-12",
    lastLogin: "2024-02-28T14:10:00",
    status: "active",
    subscription: "Premium",
    appointmentsCount: 15,
    medicalRecordsCount: 12,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Axa",
    insuranceNumber: "4 65 09 75 345 678 90",
    emergencyContact: "Claire Moreau - 06 67 89 01 23",
    bloodType: "AB+",
    allergies: ["Iode", "Fruits de mer"],
    chronicConditions: ["Hypertension", "Arthrose"],
  },
  {
    id: "P006",
    name: "Julie Lambert",
    email: "julie.lambert@example.com",
    phone: "07 67 89 01 23",
    dateOfBirth: "1992-12-03",
    gender: "Femme",
    address: "5 Rue de la Pompe, 75116 Paris",
    registrationDate: "2023-06-08",
    lastLogin: "2024-03-06T17:30:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 4,
    medicalRecordsCount: 2,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "MGEN",
    insuranceNumber: "2 92 12 75 456 789 01",
    emergencyContact: "Thomas Lambert - 07 78 90 12 34",
    bloodType: "O-",
    allergies: [],
    chronicConditions: [],
  },
  {
    id: "P007",
    name: "Pierre Durand",
    email: "pierre.durand@example.com",
    phone: "06 78 90 12 34",
    dateOfBirth: "1970-07-25",
    gender: "Homme",
    address: "30 Avenue des Champs-Élysées, 75008 Paris",
    registrationDate: "2023-07-15",
    lastLogin: "2024-02-20T10:45:00",
    status: "suspended",
    subscription: "Premium",
    appointmentsCount: 10,
    medicalRecordsCount: 7,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Swiss Life",
    insuranceNumber: "5 70 07 75 567 890 12",
    emergencyContact: "Marie Durand - 06 89 01 23 45",
    bloodType: "A+",
    allergies: ["Pénicilline"],
    chronicConditions: ["Hypercholestérolémie"],
  },
  {
    id: "P008",
    name: "Camille Leroy",
    email: "camille.leroy@example.com",
    phone: "07 89 01 23 45",
    dateOfBirth: "1985-02-18",
    gender: "Femme",
    address: "12 Rue du Bac, 75007 Paris",
    registrationDate: "2023-08-22",
    lastLogin: "2024-03-04T13:15:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 6,
    medicalRecordsCount: 4,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "CPAM",
    insuranceNumber: "1 85 02 75 678 901 23",
    emergencyContact: "Nicolas Leroy - 07 90 12 34 56",
    bloodType: "B+",
    allergies: ["Latex"],
    chronicConditions: [],
  },
  {
    id: "P009",
    name: "Lucas Bernard",
    email: "lucas.bernard@example.com",
    phone: "06 90 12 34 56",
    dateOfBirth: "1978-06-10",
    gender: "Homme",
    address: "22 Rue de Vaugirard, 75006 Paris",
    registrationDate: "2023-09-05",
    lastLogin: "2024-03-02T15:50:00",
    status: "active",
    subscription: "Premium",
    appointmentsCount: 9,
    medicalRecordsCount: 5,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Generali",
    insuranceNumber: "6 78 06 75 789 012 34",
    emergencyContact: "Emma Bernard - 06 01 23 45 67",
    bloodType: "O+",
    allergies: [],
    chronicConditions: ["Asthme"],
  },
  {
    id: "P010",
    name: "Emma Rousseau",
    email: "emma.rousseau@example.com",
    phone: "07 01 23 45 67",
    dateOfBirth: "1995-10-05",
    gender: "Femme",
    address: "7 Place de la Madeleine, 75008 Paris",
    registrationDate: "2023-10-18",
    lastLogin: "2024-03-07T12:30:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 2,
    medicalRecordsCount: 1,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "MGEN",
    insuranceNumber: "2 95 10 75 890 123 45",
    emergencyContact: "Louis Rousseau - 07 12 34 56 78",
    bloodType: "AB-",
    allergies: ["Arachides"],
    chronicConditions: [],
  },
  {
    id: "P011",
    name: "Louis Martin",
    email: "louis.martin@example.com",
    phone: "06 12 34 56 79",
    dateOfBirth: "1980-03-20",
    gender: "Homme",
    address: "14 Rue de Sèvres, 75006 Paris",
    registrationDate: "2023-11-10",
    lastLogin: "2024-03-01T09:45:00",
    status: "inactive",
    subscription: "Premium",
    appointmentsCount: 7,
    medicalRecordsCount: 4,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Allianz",
    insuranceNumber: "3 80 03 75 901 234 56",
    emergencyContact: "Sophie Martin - 06 23 45 67 89",
    bloodType: "A+",
    allergies: ["Sulfamides"],
    chronicConditions: ["Hypertension"],
  },
  {
    id: "P012",
    name: "Chloé Dubois",
    email: "chloe.dubois@example.com",
    phone: "07 23 45 67 90",
    dateOfBirth: "1993-08-15",
    gender: "Femme",
    address: "9 Rue de Passy, 75016 Paris",
    registrationDate: "2023-12-05",
    lastLogin: "2024-03-06T14:20:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 3,
    medicalRecordsCount: 2,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "CPAM",
    insuranceNumber: "1 93 08 75 012 345 67",
    emergencyContact: "Thomas Dubois - 07 34 56 78 90",
    bloodType: "O+",
    allergies: [],
    chronicConditions: [],
  },
  {
    id: "P013",
    name: "Hugo Petit",
    email: "hugo.petit@example.com",
    phone: "06 34 56 78 91",
    dateOfBirth: "1972-11-28",
    gender: "Homme",
    address: "18 Boulevard Saint-Germain, 75005 Paris",
    registrationDate: "2024-01-15",
    lastLogin: "2024-03-05T16:10:00",
    status: "active",
    subscription: "Premium",
    appointmentsCount: 5,
    medicalRecordsCount: 3,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Axa",
    insuranceNumber: "4 72 11 75 123 456 78",
    emergencyContact: "Léa Petit - 06 45 67 89 01",
    bloodType: "B+",
    allergies: ["Pénicilline", "Aspirine"],
    chronicConditions: ["Diabète type 2"],
  },
  {
    id: "P014",
    name: "Léa Moreau",
    email: "lea.moreau@example.com",
    phone: "07 45 67 89 02",
    dateOfBirth: "1990-05-12",
    gender: "Femme",
    address: "27 Rue de la Convention, 75015 Paris",
    registrationDate: "2024-02-08",
    lastLogin: "2024-03-07T11:30:00",
    status: "active",
    subscription: "Basic",
    appointmentsCount: 1,
    medicalRecordsCount: 1,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "MGEN",
    insuranceNumber: "2 90 05 75 234 567 89",
    emergencyContact: "Hugo Moreau - 07 56 78 90 12",
    bloodType: "A-",
    allergies: [],
    chronicConditions: [],
  },
  {
    id: "P015",
    name: "Gabriel Leroy",
    email: "gabriel.leroy@example.com",
    phone: "06 56 78 90 13",
    dateOfBirth: "1968-09-30",
    gender: "Homme",
    address: "33 Avenue Victor Hugo, 75116 Paris",
    registrationDate: "2024-02-20",
    lastLogin: "2024-03-04T10:15:00",
    status: "active",
    subscription: "Premium",
    appointmentsCount: 2,
    medicalRecordsCount: 1,
    image: "/placeholder.svg?height=40&width=40",
    insuranceProvider: "Swiss Life",
    insuranceNumber: "5 68 09 75 345 678 90",
    emergencyContact: "Emma Leroy - 06 67 89 01 23",
    bloodType: "AB+",
    allergies: ["Iode"],
    chronicConditions: ["Arthrose"],
  },
];

// Sample data for patient activity
const patientActivity = [
  {
    id: "A001",
    patientId: "P001",
    patientName: "Thomas Dubois",
    action: "Rendez-vous pris",
    details: "Consultation avec Dr. Sophie Martin (Cardiologie)",
    date: "2024-03-08T14:30:00",
  },
  {
    id: "A002",
    patientId: "P002",
    patientName: "Sophie Martin",
    action: "Document ajouté",
    details: "Résultats d'analyse sanguine",
    date: "2024-03-07T09:15:00",
  },
  {
    id: "A003",
    patientId: "P005",
    patientName: "Antoine Moreau",
    action: "Rendez-vous annulé",
    details: "Consultation avec Dr. Jean Dupont (Médecine générale)",
    date: "2024-03-06T17:30:00",
  },
  {
    id: "A004",
    patientId: "P010",
    patientName: "Emma Rousseau",
    action: "Mise à jour du profil",
    details: "Informations de contact modifiées",
    date: "2024-03-07T12:30:00",
  },
  {
    id: "A005",
    patientId: "P006",
    patientName: "Julie Lambert",
    action: "Rendez-vous pris",
    details: "Consultation avec Dr. Thomas Dubois (Dermatologie)",
    date: "2024-03-06T17:30:00",
  },
  {
    id: "A006",
    patientId: "P004",
    patientName: "Émilie Petit",
    action: "Message envoyé",
    details: "Message à Dr. Marie Lefevre (Ophtalmologie)",
    date: "2024-03-05T11:20:00",
  },
  {
    id: "A007",
    patientId: "P013",
    patientName: "Hugo Petit",
    action: "Ordonnance demandée",
    details: "Renouvellement de traitement pour diabète",
    date: "2024-03-05T16:10:00",
  },
  {
    id: "A008",
    patientId: "P008",
    patientName: "Camille Leroy",
    action: "Avis laissé",
    details: "Avis sur Dr. Antoine Moreau (Ophtalmologie)",
    date: "2024-03-04T13:15:00",
  },
  {
    id: "A009",
    patientId: "P015",
    patientName: "Gabriel Leroy",
    action: "Abonnement modifié",
    details: "Passage à l'abonnement Premium",
    date: "2024-03-04T10:15:00",
  },
  {
    id: "A010",
    patientId: "P009",
    patientName: "Lucas Bernard",
    action: "Document ajouté",
    details: "Résultats de radiographie pulmonaire",
    date: "2024-03-02T15:50:00",
  },
];

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] =
    useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<
    (typeof patients)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter patients based on search, status, and subscription
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || patient.status === selectedStatus;
    const matchesSubscription =
      selectedSubscription === "all" ||
      patient.subscription === selectedSubscription;

    return matchesSearch && matchesStatus && matchesSubscription;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let comparison = 0;

    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "registrationDate") {
      comparison =
        new Date(a.registrationDate).getTime() -
        new Date(b.registrationDate).getTime();
    } else if (sortBy === "lastLogin") {
      comparison =
        new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
    } else if (sortBy === "appointmentsCount") {
      comparison = a.appointmentsCount - b.appointmentsCount;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Handle row selection
  const handleRowSelect = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedPatients.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPatients.map((patient) => patient.id));
    }
  };

  // Open patient detail dialog
  const openPatientDetail = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient);
    setIsDetailOpen(true);
  };

  // Open patient edit dialog
  const openPatientEdit = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient);
    setIsEditOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  // Handle patient deletion
  const handleDeletePatient = () => {
    // In a real app, this would call an API to delete the patient
    console.log(`Deleting patient: ${selectedPatient?.id}`);
    setIsDeleteDialogOpen(false);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    // In a real app, this would call an API to perform the action on selected patients
    console.log(`Performing ${action} on patients:`, selectedRows);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>;
      case "inactive":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Inactif
          </Badge>
        );
      case "suspended":
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Get subscription badge
  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Premium":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Premium</Badge>
        );
      case "Basic":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Basic
          </Badge>
        );
      default:
        return <Badge variant="outline">Gratuit</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestion des Patients
          </h2>
          <p className="text-muted-foreground">
            Gérez les comptes patients, consultez leurs informations et suivez
            leur activité
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un patient
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Liste des patients</TabsTrigger>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher un patient..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filtres</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "all"}
                        onCheckedChange={() => setSelectedStatus("all")}
                      >
                        Tous les statuts
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "active"}
                        onCheckedChange={() => setSelectedStatus("active")}
                      >
                        Actif
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "inactive"}
                        onCheckedChange={() => setSelectedStatus("inactive")}
                      >
                        Inactif
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "suspended"}
                        onCheckedChange={() => setSelectedStatus("suspended")}
                      >
                        Suspendu
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>
                        Filtrer par abonnement
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={selectedSubscription === "all"}
                        onCheckedChange={() => setSelectedSubscription("all")}
                      >
                        Tous les abonnements
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedSubscription === "Premium"}
                        onCheckedChange={() =>
                          setSelectedSubscription("Premium")
                        }
                      >
                        Premium
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedSubscription === "Basic"}
                        onCheckedChange={() => setSelectedSubscription("Basic")}
                      >
                        Basic
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                  >
                    <SelectTrigger className="h-9 w-[130px]">
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
                {selectedRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedRows.length} sélectionné(s)
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("export")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Exporter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("email")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer un email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("delete")}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
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
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            paginatedPatients.length > 0 &&
                            selectedRows.length === paginatedPatients.length
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          Patient
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Statut
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Abonnement
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("registrationDate")}
                        >
                          Inscription
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("lastLogin")}
                        >
                          Dernière connexion
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("appointmentsCount")}
                        >
                          RDV
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          Aucun patient trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(patient.id)}
                              onCheckedChange={() =>
                                handleRowSelect(patient.id)
                              }
                              aria-label={`Select ${patient.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {patient.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={patient.image}
                                  alt={patient.name}
                                />
                                <AvatarFallback>
                                  {patient.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {patient.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {patient.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getStatusBadge(patient.status)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getSubscriptionBadge(patient.subscription)}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(patient.registrationDate),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(patient.lastLogin),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {patient.appointmentsCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openPatientDetail(patient)}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openPatientEdit(patient)}
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(patient)}
                                  className="text-destructive"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de{" "}
                  {Math.min(
                    filteredPatients.length,
                    (currentPage - 1) * itemsPerPage + 1
                  )}{" "}
                  à{" "}
                  {Math.min(
                    filteredPatients.length,
                    currentPage * itemsPerPage
                  )}{" "}
                  sur {filteredPatients.length} patients
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pageNumber === currentPage ? "default" : "outline"
                          }
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
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente des patients</CardTitle>
              <CardDescription>
                Suivez les dernières actions effectuées par les patients sur la
                plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {patientActivity.map((activity) => (
                  <div key={activity.id} className="flex">
                    <div className="relative mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6" />
                      {patientActivity.indexOf(activity) <
                        patientActivity.length - 1 && (
                        <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 translate-y-full bg-muted" />
                      )}
                    </div>
                    <div className="flex flex-col pb-8">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {activity.patientName}
                        </span>
                        <Badge variant="outline">{activity.action}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {activity.details}
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {format(
                          new Date(activity.date),
                          "d MMMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir toutes les activités
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total des patients
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground">
                  +12% par rapport au mois dernier
                </p>
                <div className="mt-4 h-[60px]">
                  <div className="h-[60px] w-full rounded-lg bg-muted"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Patients actifs
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {patients.filter((p) => p.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(
                    (patients.filter((p) => p.status === "active").length /
                      patients.length) *
                    100
                  ).toFixed(1)}
                  % du total
                </p>
                <div className="mt-4">
                  <Progress
                    value={
                      (patients.filter((p) => p.status === "active").length /
                        patients.length) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Abonnements Premium
                </CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {patients.filter((p) => p.subscription === "Premium").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(
                    (patients.filter((p) => p.subscription === "Premium")
                      .length /
                      patients.length) *
                    100
                  ).toFixed(1)}
                  % des patients
                </p>
                <div className="mt-4">
                  <Progress
                    value={
                      (patients.filter((p) => p.subscription === "Premium")
                        .length /
                        patients.length) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Nouveaux patients
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    patients.filter((p) => {
                      const registrationDate = new Date(p.registrationDate);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return registrationDate >= thirtyDaysAgo;
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Derniers 30 jours
                </p>
                <div className="mt-4 h-[60px]">
                  <div className="h-[60px] w-full rounded-lg bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des abonnements</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-[300px] w-full rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Graphique de répartition des abonnements
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activité des patients</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-[300px] w-full rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Graphique d&apos;activité des patients
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Répartition géographique</CardTitle>
              <CardDescription>
                Distribution des patients par région
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-[400px] w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Carte de répartition géographique
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Patient Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedPatient && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedPatient.image}
                        alt={selectedPatient.name}
                      />
                      <AvatarFallback>
                        {selectedPatient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedPatient.name}</span>
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedPatient.status)}
                    {getSubscriptionBadge(selectedPatient.subscription)}
                  </div>
                </div>
                <DialogDescription>
                  ID: {selectedPatient.id} • Inscrit le{" "}
                  {format(
                    new Date(selectedPatient.registrationDate),
                    "d MMMM yyyy",
                    { locale: fr }
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Informations personnelles
                    </h3>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Nom
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPatient.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Email
                        </span>
                        <span className="text-sm">{selectedPatient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Téléphone
                        </span>
                        <span className="text-sm">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date de naissance
                        </span>
                        <span className="text-sm">
                          {format(
                            new Date(selectedPatient.dateOfBirth),
                            "dd/MM/yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Genre
                        </span>
                        <span className="text-sm">
                          {selectedPatient.gender}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Adresse
                        </span>
                        <span className="text-sm">
                          {selectedPatient.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Informations médicales
                    </h3>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Groupe sanguin
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPatient.bloodType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Allergies
                        </span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {selectedPatient.allergies.length > 0 ? (
                            selectedPatient.allergies.map((allergy) => (
                              <Badge
                                key={allergy}
                                variant="outline"
                                className="text-xs"
                              >
                                {allergy}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm">
                              Aucune allergie connue
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Maladies chroniques
                        </span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {selectedPatient.chronicConditions.length > 0 ? (
                            selectedPatient.chronicConditions.map(
                              (condition) => (
                                <Badge
                                  key={condition}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {condition}
                                </Badge>
                              )
                            )
                          ) : (
                            <span className="text-sm">
                              Aucune maladie chronique
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Assurance</h3>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Assureur
                        </span>
                        <span className="text-sm">
                          {selectedPatient.insuranceProvider}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Numéro d&apos;assuré
                        </span>
                        <span className="text-sm">
                          {selectedPatient.insuranceNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Activité du compte
                    </h3>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Statut
                        </span>
                        <div>{getStatusBadge(selectedPatient.status)}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Abonnement
                        </span>
                        <div>
                          {getSubscriptionBadge(selectedPatient.subscription)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date d&apos;inscription
                        </span>
                        <span className="text-sm">
                          {format(
                            new Date(selectedPatient.registrationDate),
                            "dd/MM/yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Dernière connexion
                        </span>
                        <span className="text-sm">
                          {format(
                            new Date(selectedPatient.lastLogin),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Statistiques</h3>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Rendez-vous
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPatient.appointmentsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Documents médicaux
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPatient.medicalRecordsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Contact d&apos;urgence
                    </h3>
                    <div className="rounded-lg border p-3">
                      <span className="text-sm">
                        {selectedPatient.emergencyContact}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setIsDetailOpen(false);
                        openPatientEdit(selectedPatient);
                      }}
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Modifier le profil
                    </Button>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Voir les rendez-vous
                    </Button>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Voir les documents médicaux
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Patient Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle>Modifier le patient</DialogTitle>
                <DialogDescription>
                  Modifiez les informations du patient {selectedPatient.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" defaultValue={selectedPatient.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={selectedPatient.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" defaultValue={selectedPatient.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      defaultValue={selectedPatient.dateOfBirth}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre</Label>
                    <Select defaultValue={selectedPatient.gender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Sélectionner un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Homme">Homme</SelectItem>
                        <SelectItem value="Femme">Femme</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      defaultValue={selectedPatient.address}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select defaultValue={selectedPatient.status}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription">Abonnement</Label>
                    <Select defaultValue={selectedPatient.subscription}>
                      <SelectTrigger id="subscription">
                        <SelectValue placeholder="Sélectionner un abonnement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Assureur</Label>
                    <Input
                      id="insuranceProvider"
                      defaultValue={selectedPatient.insuranceProvider}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceNumber">
                      Numéro d&apos;assuré
                    </Label>
                    <Input
                      id="insuranceNumber"
                      defaultValue={selectedPatient.insuranceNumber}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">
                      Contact d&apos;urgence
                    </Label>
                    <Input
                      id="emergencyContact"
                      defaultValue={selectedPatient.emergencyContact}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Select defaultValue={selectedPatient.bloodType}>
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Sélectionner un groupe sanguin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setIsEditOpen(false)}>
                  Enregistrer les modifications
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce patient ? Cette action ne
              peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPatient && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedPatient.image}
                    alt={selectedPatient.name}
                  />
                  <AvatarFallback>
                    {selectedPatient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPatient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.email}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing component definition for Mail, Crown, and UserPlus
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

const Crown = ({ className }: { className?: string }) => {
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
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 4c0 9 4.5 14 9 14s9-5 9-14" />
    </svg>
  );
};

const UserPlus = ({ className }: { className?: string }) => {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
};
