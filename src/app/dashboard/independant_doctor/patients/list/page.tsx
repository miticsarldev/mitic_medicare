"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Calendar,
  Download,
  MoreHorizontal,
  Search,
  User,
  FileText,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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


export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<
    (typeof patients)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filtrer et trier les patients
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPatients = [...patients]
    .filter((patient) =>
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const comparison = a[sortBy] > b[sortBy] ? 1 : -1;
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

  // Open patient detail dialog
  const openPatientDetail = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient);
    setIsDetailOpen(true);
  };

  // Handle patient deletion
  const handleDeletePatient = () => {
    // In a real app, this would call an API to delete the patient
    console.log(`Deleting patient: ${selectedPatient?.id}`);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Liste des Patients
          </h2>
          <p className="text-muted-foreground">
            Liste des patients que vous avez pris en charge
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        Numéro
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Adresse
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("appointmentsCount")}
                        >
                          Dernier RDV
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
                            {patient.phone}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {patient.address}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(patient.lastLogin),
                              "dd/MM/yyyy HH:mm"
                            )}
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
                                  Voir les détails RDV
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                </div>
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


