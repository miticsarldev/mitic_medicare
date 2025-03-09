"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Calendar,
  Check,
  Download,
  Eye,
  Filter,
  ExpandIcon as More,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Sample data for doctors
const doctors = [
  {
    id: "d1",
    name: "Dr. Sophie Martin",
    email: "sophie.martin@example.com",
    specialty: "Médecin Généraliste",
    location: "Paris",
    status: "active",
    verified: true,
    patients: 124,
    rating: 4.8,
    joinedAt: "2023-05-15T10:30:00",
    lastActive: "2024-03-08T14:22:00",
    subscription: "Premium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d2",
    name: "Dr. Thomas Dubois",
    email: "thomas.dubois@example.com",
    specialty: "Cardiologue",
    location: "Lyon",
    status: "active",
    verified: true,
    patients: 87,
    rating: 4.9,
    joinedAt: "2023-06-20T09:15:00",
    lastActive: "2024-03-07T16:45:00",
    subscription: "Premium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d3",
    name: "Dr. Émilie Laurent",
    email: "emilie.laurent@example.com",
    specialty: "Dermatologue",
    location: "Paris",
    status: "active",
    verified: true,
    patients: 56,
    rating: 4.7,
    joinedAt: "2023-07-10T11:45:00",
    lastActive: "2024-03-08T10:30:00",
    subscription: "Standard",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d4",
    name: "Dr. Antoine Moreau",
    email: "antoine.moreau@example.com",
    specialty: "Ophtalmologue",
    location: "Marseille",
    status: "inactive",
    verified: false,
    patients: 92,
    rating: 4.5,
    joinedAt: "2023-04-05T14:20:00",
    lastActive: "2024-02-15T09:10:00",
    subscription: "Standard",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d5",
    name: "Dr. Claire Petit",
    email: "claire.petit@example.com",
    specialty: "Gynécologue",
    location: "Bordeaux",
    status: "pending",
    verified: false,
    patients: 0,
    rating: 0,
    joinedAt: "2024-03-01T08:30:00",
    lastActive: "2024-03-01T08:30:00",
    subscription: "Trial",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d6",
    name: "Dr. Jean Dupont",
    email: "jean.dupont@example.com",
    specialty: "Pédiatre",
    location: "Lille",
    status: "active",
    verified: true,
    patients: 143,
    rating: 4.6,
    joinedAt: "2023-03-12T10:00:00",
    lastActive: "2024-03-06T17:15:00",
    subscription: "Premium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d7",
    name: "Dr. Marie Lefevre",
    email: "marie.lefevre@example.com",
    specialty: "Neurologue",
    location: "Toulouse",
    status: "active",
    verified: true,
    patients: 78,
    rating: 4.8,
    joinedAt: "2023-08-18T13:45:00",
    lastActive: "2024-03-07T11:20:00",
    subscription: "Standard",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d8",
    name: "Dr. Pierre Durand",
    email: "pierre.durand@example.com",
    specialty: "Psychiatre",
    location: "Nice",
    status: "active",
    verified: true,
    patients: 65,
    rating: 4.7,
    joinedAt: "2023-09-05T09:30:00",
    lastActive: "2024-03-08T15:40:00",
    subscription: "Premium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d9",
    name: "Dr. Isabelle Moreau",
    email: "isabelle.moreau@example.com",
    specialty: "Endocrinologue",
    location: "Paris",
    status: "active",
    verified: true,
    patients: 102,
    rating: 4.9,
    joinedAt: "2023-02-28T11:15:00",
    lastActive: "2024-03-08T09:05:00",
    subscription: "Premium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "d10",
    name: "Dr. François Lemoine",
    email: "francois.lemoine@example.com",
    specialty: "Rhumatologue",
    location: "Strasbourg",
    status: "inactive",
    verified: true,
    patients: 74,
    rating: 4.4,
    joinedAt: "2023-05-22T10:45:00",
    lastActive: "2024-01-20T14:30:00",
    subscription: "Standard",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

// Sample data for specialties
const specialties = [
  "Médecin Généraliste",
  "Cardiologue",
  "Dermatologue",
  "Ophtalmologue",
  "Gynécologue",
  "Pédiatre",
  "Psychiatre",
  "Neurologue",
  "Gastro-entérologue",
  "ORL",
  "Rhumatologue",
  "Endocrinologue",
  "Pneumologue",
  "Urologue",
  "Chirurgien",
  "Allergologue",
];

// Sample data for locations
const locations = [
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Lille",
  "Toulouse",
  "Nice",
  "Strasbourg",
  "Nantes",
  "Montpellier",
];

// Sample data for subscription plans
const subscriptionPlans = ["Trial", "Standard", "Premium"];

export default function DoctorsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>(
    []
  );
  const [selectedDoctor, setSelectedDoctor] = useState<
    (typeof doctors)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchQuery === "" ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialties =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.includes(doctor.specialty);

    const matchesLocations =
      selectedLocations.length === 0 ||
      selectedLocations.includes(doctor.location);

    const matchesStatuses =
      selectedStatuses.length === 0 || selectedStatuses.includes(doctor.status);

    const matchesSubscriptions =
      selectedSubscriptions.length === 0 ||
      selectedSubscriptions.includes(doctor.subscription);

    return (
      matchesSearch &&
      matchesSpecialties &&
      matchesLocations &&
      matchesStatuses &&
      matchesSubscriptions
    );
  });

  // Sort doctors based on selected column and direction
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (!sortColumn) return 0;

    let valueA, valueB;

    switch (sortColumn) {
      case "name":
        valueA = a.name;
        valueB = b.name;
        break;
      case "specialty":
        valueA = a.specialty;
        valueB = b.specialty;
        break;
      case "location":
        valueA = a.location;
        valueB = b.location;
        break;
      case "patients":
        valueA = a.patients;
        valueB = b.patients;
        break;
      case "rating":
        valueA = a.rating;
        valueB = b.rating;
        break;
      case "joinedAt":
        valueA = new Date(a.joinedAt).getTime();
        valueB = new Date(b.joinedAt).getTime();
        break;
      case "lastActive":
        valueA = new Date(a.lastActive).getTime();
        valueB = new Date(b.lastActive).getTime();
        break;
      case "subscription":
        valueA = a.subscription;
        valueB = b.subscription;
        break;
      default:
        return 0;
    }

    if (valueA < valueB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Toggle specialty selection
  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(
        selectedSpecialties.filter((s) => s !== specialty)
      );
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  // Toggle location selection
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  // Toggle status selection
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // Toggle subscription selection
  const toggleSubscription = (subscription: string) => {
    if (selectedSubscriptions.includes(subscription)) {
      setSelectedSubscriptions(
        selectedSubscriptions.filter((s) => s !== subscription)
      );
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, subscription]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setSelectedStatuses([]);
    setSelectedSubscriptions([]);
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
    if (selectedRows.length === filteredDoctors.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredDoctors.map((doctor) => doctor.id));
    }
  };

  // Open doctor detail
  const openDoctorDetail = (doctor: (typeof doctors)[0]) => {
    setSelectedDoctor(doctor);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des Médecins
          </h2>
          <p className="text-muted-foreground">
            Gérez les comptes médecins, vérifiez les profils et suivez leur
            activité.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button onClick={() => setIsAddDoctorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un médecin
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle>Liste des Médecins</CardTitle>
            <CardDescription>
              {filteredDoctors.length} médecin
              {filteredDoctors.length !== 1 ? "s" : ""} trouvé
              {filteredDoctors.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <More className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={selectedRows.length === 0}>
                  <Check className="mr-2 h-4 w-4" />
                  Vérifier sélection
                </DropdownMenuItem>
                <DropdownMenuItem disabled={selectedRows.length === 0}>
                  <X className="mr-2 h-4 w-4" />
                  Désactiver sélection
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter en CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedRows.length === filteredDoctors.length &&
                        filteredDoctors.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Nom
                      {sortColumn === "name" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort("specialty")}
                  >
                    <div className="flex items-center">
                      Spécialité
                      {sortColumn === "specialty" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort("location")}
                  >
                    <div className="flex items-center">
                      Localisation
                      {sortColumn === "location" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Statut</TableHead>
                  <TableHead
                    className="cursor-pointer hidden lg:table-cell text-right"
                    onClick={() => handleSort("patients")}
                  >
                    <div className="flex items-center justify-end">
                      Patients
                      {sortColumn === "patients" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden lg:table-cell text-right"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center justify-end">
                      Note
                      {sortColumn === "rating" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden xl:table-cell"
                    onClick={() => handleSort("joinedAt")}
                  >
                    <div className="flex items-center">
                      Inscription
                      {sortColumn === "joinedAt" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden xl:table-cell"
                    onClick={() => handleSort("subscription")}
                  >
                    <div className="flex items-center">
                      Abonnement
                      {sortColumn === "subscription" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      Aucun médecin trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDoctors.map((doctor) => (
                    <TableRow
                      key={doctor.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDoctorDetail(doctor)}
                    >
                      <TableCell
                        className="w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.includes(doctor.id)}
                          onCheckedChange={() => toggleRowSelection(doctor.id)}
                          aria-label={`Select ${doctor.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={doctor.avatar} alt={doctor.name} />
                          <AvatarFallback>
                            {doctor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doctor.specialty}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doctor.location}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant={
                            doctor.status === "active"
                              ? "default"
                              : doctor.status === "inactive"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            doctor.status === "active"
                              ? "bg-green-500 hover:bg-green-600"
                              : doctor.status === "inactive"
                              ? "bg-gray-500 hover:bg-gray-600"
                              : "border-amber-500 text-amber-500 hover:bg-amber-50"
                          }
                        >
                          {doctor.status === "active"
                            ? "Actif"
                            : doctor.status === "inactive"
                            ? "Inactif"
                            : "En attente"}
                        </Badge>
                        {doctor.verified && (
                          <Badge
                            variant="outline"
                            className="ml-2 border-blue-500 text-blue-500"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Vérifié
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right">
                        {doctor.patients}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right">
                        {doctor.rating > 0 ? (
                          <div className="flex items-center justify-end">
                            <span className="mr-1">
                              {doctor.rating.toFixed(1)}
                            </span>
                            <svg
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.897-1.147L10 0l2.516 5.963 7.897 1.147-5.693 5.325 1.35 7.857z"
                              />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {format(new Date(doctor.joinedAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge
                          variant="outline"
                          className={
                            doctor.subscription === "Premium"
                              ? "border-purple-500 text-purple-500"
                              : doctor.subscription === "Standard"
                              ? "border-blue-500 text-blue-500"
                              : "border-gray-500 text-gray-500"
                          }
                        >
                          {doctor.subscription}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <More className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openDoctorDetail(doctor)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {doctor.status === "active" ? (
                              <DropdownMenuItem>
                                <X className="mr-2 h-4 w-4" />
                                Désactiver
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Check className="mr-2 h-4 w-4" />
                                Activer
                              </DropdownMenuItem>
                            )}
                            {!doctor.verified && (
                              <DropdownMenuItem>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Vérifier
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
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
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Affichage de <strong>{filteredDoctors.length}</strong> sur{" "}
            <strong>{doctors.length}</strong> médecins
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} sélectionné
              {selectedRows.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled>
                Suivant
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Doctor Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-xl">
          {selectedDoctor && (
            <>
              <SheetHeader>
                <SheetTitle>Détails du Médecin</SheetTitle>
                <SheetDescription>
                  Informations complètes sur le profil du médecin
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedDoctor.avatar}
                      alt={selectedDoctor.name}
                    />
                    <AvatarFallback>
                      {selectedDoctor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedDoctor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoctor.email}
                    </p>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant={
                          selectedDoctor.status === "active"
                            ? "default"
                            : selectedDoctor.status === "inactive"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          selectedDoctor.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : selectedDoctor.status === "inactive"
                            ? "bg-gray-500 hover:bg-gray-600"
                            : "border-amber-500 text-amber-500 hover:bg-amber-50"
                        }
                      >
                        {selectedDoctor.status === "active"
                          ? "Actif"
                          : selectedDoctor.status === "inactive"
                          ? "Inactif"
                          : "En attente"}
                      </Badge>
                      {selectedDoctor.verified && (
                        <Badge
                          variant="outline"
                          className="ml-2 border-blue-500 text-blue-500"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="activity">Activité</TabsTrigger>
                    <TabsTrigger value="settings">Paramètres</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Spécialité
                        </Label>
                        <p className="text-sm font-medium">
                          {selectedDoctor.specialty}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Localisation
                        </Label>
                        <p className="text-sm font-medium">
                          {selectedDoctor.location}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Patients
                        </Label>
                        <p className="text-sm font-medium">
                          {selectedDoctor.patients}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Note
                        </Label>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">
                            {selectedDoctor.rating.toFixed(1)}
                          </span>
                          <svg
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.897-1.147L10 0l2.516 5.963 7.897 1.147-5.693 5.325 1.35 7.857z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Inscription
                        </Label>
                        <p className="text-sm font-medium">
                          {format(
                            new Date(selectedDoctor.joinedAt),
                            "dd/MM/yyyy"
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Dernière activité
                        </Label>
                        <p className="text-sm font-medium">
                          {format(
                            new Date(selectedDoctor.lastActive),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Abonnement
                        </Label>
                        <Badge
                          variant="outline"
                          className={
                            selectedDoctor.subscription === "Premium"
                              ? "border-purple-500 text-purple-500"
                              : selectedDoctor.subscription === "Standard"
                              ? "border-blue-500 text-blue-500"
                              : "border-gray-500 text-gray-500"
                          }
                        >
                          {selectedDoctor.subscription}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-2">
                        Documents de vérification
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-md border p-2 flex items-center">
                          <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-xs">Diplôme médical</span>
                        </div>
                        <div className="rounded-md border p-2 flex items-center">
                          <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-xs">Carte professionnelle</span>
                        </div>
                        <div className="rounded-md border p-2 flex items-center">
                          <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-xs">Pièce d&apos;identité</span>
                        </div>
                        <div className="rounded-md border p-2 flex items-center">
                          <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-xs">
                            Assurance professionnelle
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="activity" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">
                          Activité récente
                        </h4>
                        <Button variant="ghost" size="sm">
                          Voir tout
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Calendar className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-sm">A confirmé un rendez-vous</p>
                            <p className="text-xs text-muted-foreground">
                              Il y a 2 heures
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                            <User className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <p className="text-sm">A mis à jour son profil</p>
                            <p className="text-xs text-muted-foreground">
                              Il y a 1 jour
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                            <FileText className="h-4 w-4 text-amber-700" />
                          </div>
                          <div>
                            <p className="text-sm">A téléchargé un document</p>
                            <p className="text-xs text-muted-foreground">
                              Il y a 3 jours
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Statistiques
                      </h4>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Rendez-vous ce mois</span>
                            <span className="text-xs font-medium">24</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Taux de complétion</span>
                            <span className="text-xs font-medium">92%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-green-500"
                              style={{ width: "92%" }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">
                              Temps de réponse moyen
                            </span>
                            <span className="text-xs font-medium">4h</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-amber-500"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold">
                            Statut du compte
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Gérer l&apos;état du compte
                          </p>
                        </div>
                        <Select defaultValue={selectedDoctor.status}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold">
                            Vérification
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Statut de vérification du profil
                          </p>
                        </div>
                        <Select
                          defaultValue={
                            selectedDoctor.verified ? "verified" : "unverified"
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="verified">Vérifié</SelectItem>
                            <SelectItem value="unverified">
                              Non vérifié
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold">Abonnement</h4>
                          <p className="text-xs text-muted-foreground">
                            Gérer le plan d&apos;abonnement
                          </p>
                        </div>
                        <Select defaultValue={selectedDoctor.subscription}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Trial">Trial</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Actions</h4>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier le profil
                        </Button>
                        <Button variant="outline" size="sm">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Gérer les permissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer le compte
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Fermer</Button>
                </SheetClose>
                <Button>Enregistrer les modifications</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Filter Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>
              Affinez votre recherche de médecins
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Spécialités</h4>
              <div className="grid grid-cols-2 gap-2">
                {specialties.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={selectedSpecialties.includes(specialty)}
                      onCheckedChange={() => toggleSpecialty(specialty)}
                    />
                    <label
                      htmlFor={`specialty-${specialty}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Localisation</h4>
              <div className="grid grid-cols-2 gap-2">
                {locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => toggleLocation(location)}
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Statut</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-active"
                    checked={selectedStatuses.includes("active")}
                    onCheckedChange={() => toggleStatus("active")}
                  />
                  <label
                    htmlFor="status-active"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Actif
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-inactive"
                    checked={selectedStatuses.includes("inactive")}
                    onCheckedChange={() => toggleStatus("inactive")}
                  />
                  <label
                    htmlFor="status-inactive"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Inactif
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-pending"
                    checked={selectedStatuses.includes("pending")}
                    onCheckedChange={() => toggleStatus("pending")}
                  />
                  <label
                    htmlFor="status-pending"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    En attente
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Abonnement</h4>
              <div className="space-y-2">
                {subscriptionPlans.map((plan) => (
                  <div key={plan} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subscription-${plan}`}
                      checked={selectedSubscriptions.includes(plan)}
                      onCheckedChange={() => toggleSubscription(plan)}
                    />
                    <label
                      htmlFor={`subscription-${plan}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {plan}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser
            </Button>
            <SheetClose asChild>
              <Button>Appliquer les filtres</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un médecin</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte médecin sur la plateforme
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" placeholder="Dr. Jean Dupont" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Spécialité</Label>
                <Select>
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Sélectionner une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription">Abonnement</Label>
                <Select defaultValue="Trial">
                  <SelectTrigger id="subscription">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Informations supplémentaires..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="verified" />
              <Label htmlFor="verified" className="text-sm font-normal">
                Marquer comme vérifié
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="send-email" defaultChecked />
              <Label htmlFor="send-email" className="text-sm font-normal">
                Envoyer un email d&apos;invitation
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDoctorOpen(false)}>
              Annuler
            </Button>
            <Button>Créer le compte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
