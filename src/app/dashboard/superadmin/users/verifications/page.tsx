"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
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
import { Textarea } from "@/components/ui/textarea";

// Sample data for verification requests
const verificationRequests = [
  {
    id: "vr-001",
    name: "Dr. Sophie Martin",
    email: "sophie.martin@example.com",
    type: "doctor",
    specialty: "Cardiologie",
    submittedAt: "2024-02-15T10:30:00",
    status: "pending",
    documents: [
      {
        id: "doc-001",
        name: "Diplôme de médecine",
        type: "pdf",
        size: "2.4 MB",
        verified: true,
      },
      {
        id: "doc-002",
        name: "Licence d'exercice",
        type: "pdf",
        size: "1.8 MB",
        verified: false,
      },
      {
        id: "doc-003",
        name: "Carte d'identité",
        type: "image",
        size: "3.2 MB",
        verified: true,
      },
    ],
    verificationProgress: 67,
    notes:
      "En attente de vérification de la licence d'exercice auprès de l'Ordre des Médecins.",
    assignedTo: "admin@example.com",
  },
  {
    id: "vr-002",
    name: "Clinique Saint-Joseph",
    email: "contact@clinique-saintjoseph.fr",
    type: "hospital",
    specialty: null,
    submittedAt: "2024-02-10T14:45:00",
    status: "approved",
    documents: [
      {
        id: "doc-004",
        name: "Autorisation d'exploitation",
        type: "pdf",
        size: "4.1 MB",
        verified: true,
      },
      {
        id: "doc-005",
        name: "Certificat de conformité",
        type: "pdf",
        size: "2.7 MB",
        verified: true,
      },
      {
        id: "doc-006",
        name: "Attestation fiscale",
        type: "pdf",
        size: "1.5 MB",
        verified: true,
      },
    ],
    verificationProgress: 100,
    notes: "Tous les documents ont été vérifiés et sont conformes.",
    assignedTo: "verifier@example.com",
  },
  {
    id: "vr-003",
    name: "Dr. Thomas Dubois",
    email: "thomas.dubois@example.com",
    type: "doctor",
    specialty: "Dermatologie",
    submittedAt: "2024-02-08T09:15:00",
    status: "rejected",
    documents: [
      {
        id: "doc-007",
        name: "Diplôme de médecine",
        type: "pdf",
        size: "2.2 MB",
        verified: true,
      },
      {
        id: "doc-008",
        name: "Licence d'exercice",
        type: "pdf",
        size: "1.9 MB",
        verified: false,
      },
      {
        id: "doc-009",
        name: "Carte d'identité",
        type: "image",
        size: "2.8 MB",
        verified: true,
      },
    ],
    verificationProgress: 33,
    notes: "Licence d'exercice expirée. Demande de mise à jour envoyée.",
    assignedTo: "admin@example.com",
  },
  {
    id: "vr-004",
    name: "Centre Médical Montparnasse",
    email: "admin@cm-montparnasse.fr",
    type: "hospital",
    specialty: null,
    submittedAt: "2024-02-05T11:30:00",
    status: "pending",
    documents: [
      {
        id: "doc-010",
        name: "Autorisation d'exploitation",
        type: "pdf",
        size: "3.8 MB",
        verified: true,
      },
      {
        id: "doc-011",
        name: "Certificat de conformité",
        type: "pdf",
        size: "2.5 MB",
        verified: false,
      },
      {
        id: "doc-012",
        name: "Attestation fiscale",
        type: "pdf",
        size: "1.7 MB",
        verified: false,
      },
    ],
    verificationProgress: 33,
    notes:
      "En attente de vérification du certificat de conformité et de l'attestation fiscale.",
    assignedTo: "verifier@example.com",
  },
  {
    id: "vr-005",
    name: "Dr. Marie Lefevre",
    email: "marie.lefevre@example.com",
    type: "doctor",
    specialty: "Pédiatrie",
    submittedAt: "2024-02-03T16:20:00",
    status: "approved",
    documents: [
      {
        id: "doc-013",
        name: "Diplôme de médecine",
        type: "pdf",
        size: "2.3 MB",
        verified: true,
      },
      {
        id: "doc-014",
        name: "Licence d'exercice",
        type: "pdf",
        size: "1.6 MB",
        verified: true,
      },
      {
        id: "doc-015",
        name: "Carte d'identité",
        type: "image",
        size: "3.0 MB",
        verified: true,
      },
    ],
    verificationProgress: 100,
    notes: "Tous les documents ont été vérifiés et sont conformes.",
    assignedTo: "admin@example.com",
  },
  {
    id: "vr-006",
    name: "Hôpital Européen Georges-Pompidou",
    email: "contact@hegp.aphp.fr",
    type: "hospital",
    specialty: null,
    submittedAt: "2024-02-01T13:45:00",
    status: "pending",
    documents: [
      {
        id: "doc-016",
        name: "Autorisation d'exploitation",
        type: "pdf",
        size: "4.5 MB",
        verified: true,
      },
      {
        id: "doc-017",
        name: "Certificat de conformité",
        type: "pdf",
        size: "3.2 MB",
        verified: true,
      },
      {
        id: "doc-018",
        name: "Attestation fiscale",
        type: "pdf",
        size: "2.1 MB",
        verified: false,
      },
    ],
    verificationProgress: 67,
    notes: "En attente de vérification de l'attestation fiscale.",
    assignedTo: "verifier@example.com",
  },
  {
    id: "vr-007",
    name: "Dr. Jean Dupont",
    email: "jean.dupont@example.com",
    type: "doctor",
    specialty: "Ophtalmologie",
    submittedAt: "2024-01-28T10:10:00",
    status: "approved",
    documents: [
      {
        id: "doc-019",
        name: "Diplôme de médecine",
        type: "pdf",
        size: "2.6 MB",
        verified: true,
      },
      {
        id: "doc-020",
        name: "Licence d'exercice",
        type: "pdf",
        size: "1.9 MB",
        verified: true,
      },
      {
        id: "doc-021",
        name: "Carte d'identité",
        type: "image",
        size: "2.7 MB",
        verified: true,
      },
    ],
    verificationProgress: 100,
    notes: "Tous les documents ont été vérifiés et sont conformes.",
    assignedTo: "admin@example.com",
  },
  {
    id: "vr-008",
    name: "Clinique des Champs-Élysées",
    email: "info@clinique-champselysees.com",
    type: "hospital",
    specialty: null,
    submittedAt: "2024-01-25T15:30:00",
    status: "rejected",
    documents: [
      {
        id: "doc-022",
        name: "Autorisation d'exploitation",
        type: "pdf",
        size: "3.9 MB",
        verified: false,
      },
      {
        id: "doc-023",
        name: "Certificat de conformité",
        type: "pdf",
        size: "2.8 MB",
        verified: true,
      },
      {
        id: "doc-024",
        name: "Attestation fiscale",
        type: "pdf",
        size: "1.6 MB",
        verified: true,
      },
    ],
    verificationProgress: 67,
    notes:
      "Autorisation d'exploitation non valide. Demande de mise à jour envoyée.",
    assignedTo: "verifier@example.com",
  },
  {
    id: "vr-009",
    name: "Dr. Claire Petit",
    email: "claire.petit@example.com",
    type: "doctor",
    specialty: "Gynécologie",
    submittedAt: "2024-01-22T11:45:00",
    status: "pending",
    documents: [
      {
        id: "doc-025",
        name: "Diplôme de médecine",
        type: "pdf",
        size: "2.4 MB",
        verified: true,
      },
      {
        id: "doc-026",
        name: "Licence d'exercice",
        type: "pdf",
        size: "1.7 MB",
        verified: false,
      },
      {
        id: "doc-027",
        name: "Carte d'identité",
        type: "image",
        size: "2.9 MB",
        verified: true,
      },
    ],
    verificationProgress: 67,
    notes: "En attente de vérification de la licence d'exercice.",
    assignedTo: "admin@example.com",
  },
  {
    id: "vr-010",
    name: "Hôpital Cochin",
    email: "contact@cochin.aphp.fr",
    type: "hospital",
    specialty: null,
    submittedAt: "2024-01-20T14:15:00",
    status: "approved",
    documents: [
      {
        id: "doc-028",
        name: "Autorisation d'exploitation",
        type: "pdf",
        size: "4.2 MB",
        verified: true,
      },
      {
        id: "doc-029",
        name: "Certificat de conformité",
        type: "pdf",
        size: "3.1 MB",
        verified: true,
      },
      {
        id: "doc-030",
        name: "Attestation fiscale",
        type: "pdf",
        size: "1.8 MB",
        verified: true,
      },
    ],
    verificationProgress: 100,
    notes: "Tous les documents ont été vérifiés et sont conformes.",
    assignedTo: "verifier@example.com",
  },
];

// Helper function to format date
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: fr });
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          En attente
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Approuvé
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

// Helper function to get type badge
const getTypeBadge = (type: string) => {
  switch (type) {
    case "doctor":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Médecin
        </Badge>
      );
    case "hospital":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Établissement
        </Badge>
      );
    default:
      return <Badge variant="outline">Autre</Badge>;
  }
};

// Helper function to get document icon
const getDocumentIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "image":
      return <Eye className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

export default function VerificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<
    (typeof verificationRequests)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("submittedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter requests based on search, status, and type
  const filteredRequests = verificationRequests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.specialty &&
        request.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || request.status === selectedStatus;

    const matchesType = selectedType === "all" || request.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === "submittedAt") {
      comparison =
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    } else if (sortColumn === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortColumn === "type") {
      comparison = a.type.localeCompare(b.type);
    } else if (sortColumn === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortColumn === "progress") {
      comparison = a.verificationProgress - b.verificationProgress;
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

  // Open request detail dialog
  const openRequestDetail = (request: (typeof verificationRequests)[0]) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (request: (typeof verificationRequests)[0]) => {
    setSelectedRequest(request);
    setRejectReason("");
    setIsRejectDialogOpen(true);
  };

  // Handle approve request
  const handleApproveRequest = (id: string) => {
    // In a real app, this would call an API to update the request status
    console.log(`Approving request ${id}`);
    setIsDetailOpen(false);
  };

  // Handle reject request
  const handleRejectRequest = () => {
    // In a real app, this would call an API to update the request status
    if (selectedRequest) {
      console.log(
        `Rejecting request ${selectedRequest.id} with reason: ${rejectReason}`
      );
    }
    setIsRejectDialogOpen(false);
    setIsDetailOpen(false);
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
    if (selectedRows.length === sortedRequests.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedRequests.map((request) => request.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    // In a real app, this would call an API to perform the action on all selected rows
    console.log(`Performing ${action} on ${selectedRows.length} requests`);
    setSelectedRows([]);
  };

  // Calculate statistics
  const totalRequests = verificationRequests.length;
  const pendingRequests = verificationRequests.filter(
    (r) => r.status === "pending"
  ).length;
  const approvedRequests = verificationRequests.filter(
    (r) => r.status === "approved"
  ).length;
  const rejectedRequests = verificationRequests.filter(
    (r) => r.status === "rejected"
  ).length;
  const doctorRequests = verificationRequests.filter(
    (r) => r.type === "doctor"
  ).length;
  const hospitalRequests = verificationRequests.filter(
    (r) => r.type === "hospital"
  ).length;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Demandes de vérification
          </h2>
          <p className="text-muted-foreground">
            Gérez et traitez les demandes de vérification des médecins et
            établissements
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button>
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Demandes en attente de traitement</CardTitle>
              <Tabs defaultValue="all" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="all"
                    onClick={() => setSelectedStatus("all")}
                  >
                    Toutes ({totalRequests})
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    onClick={() => setSelectedStatus("pending")}
                  >
                    En attente ({pendingRequests})
                  </TabsTrigger>
                  <TabsTrigger
                    value="processed"
                    onClick={() => {
                      if (
                        selectedStatus === "approved" ||
                        selectedStatus === "rejected"
                      ) {
                        setSelectedStatus("all");
                      } else {
                        setSelectedStatus("approved");
                      }
                    }}
                  >
                    Traitées ({approvedRequests + rejectedRequests})
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
                    <SelectItem value="doctor">Médecins</SelectItem>
                    <SelectItem value="hospital">Établissements</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
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
                        onClick={() => handleBulkAction("approve")}
                      >
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Approuver
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("reject")}
                      >
                        <X className="mr-2 h-4 w-4 text-red-500" />
                        Rejeter
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
                          selectedRows.length === sortedRequests.length &&
                          sortedRequests.length > 0
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
                        onClick={() => toggleSort("submittedAt")}
                      >
                        <span>Date de soumission</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => toggleSort("progress")}
                      >
                        <span>Progression</span>
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
                  {sortedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucune demande trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openRequestDetail(request)}
                      >
                        <TableCell
                          className="w-[30px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedRows.includes(request.id)}
                            onCheckedChange={() =>
                              toggleRowSelection(request.id)
                            }
                            aria-label={`Select ${request.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32`}
                                alt={request.name}
                              />
                              <AvatarFallback>
                                {request.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {request.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeBadge(request.type)}
                            {request.specialty && (
                              <span className="text-xs text-muted-foreground">
                                {request.specialty}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">
                              {formatDate(request.submittedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={request.verificationProgress}
                              className="h-2 w-[60px]"
                            />
                            <span className="text-xs text-muted-foreground">
                              {request.verificationProgress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
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
                                onClick={() => openRequestDetail(request)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              {request.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleApproveRequest(request.id)
                                    }
                                  >
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openRejectDialog(request)}
                                  >
                                    <X className="mr-2 h-4 w-4 text-red-500" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Exporter
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
          <CardFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Affichage de {sortedRequests.length} sur {totalRequests} demandes
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
                    Demandes en attente
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {pendingRequests}
                  </span>
                </div>
                <Progress
                  value={(pendingRequests / totalRequests) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Demandes approuvées
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {approvedRequests}
                  </span>
                </div>
                <Progress
                  value={(approvedRequests / totalRequests) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Demandes rejetées</span>
                  <span className="text-sm text-muted-foreground">
                    {rejectedRequests}
                  </span>
                </div>
                <Progress
                  value={(rejectedRequests / totalRequests) * 100}
                  className="h-2"
                />
              </div>
              <Separator />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Médecins</span>
                  <span className="text-sm text-muted-foreground">
                    {doctorRequests}
                  </span>
                </div>
                <Progress
                  value={(doctorRequests / totalRequests) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Établissements</span>
                  <span className="text-sm text-muted-foreground">
                    {hospitalRequests}
                  </span>
                </div>
                <Progress
                  value={(hospitalRequests / totalRequests) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                Approuver les demandes en attente
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />
                Vérifier les documents expirés
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Configurer les règles de vérification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>
                    Détails de la demande de vérification
                  </DialogTitle>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <DialogDescription>
                  Demande soumise le {formatDate(selectedRequest.submittedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">Informations</h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40`}
                          alt={selectedRequest.name}
                        />
                        <AvatarFallback>
                          {selectedRequest.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {selectedRequest.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedRequest.email}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Type</span>
                        <span>{getTypeBadge(selectedRequest.type)}</span>
                      </div>
                      {selectedRequest.specialty && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Spécialité
                          </span>
                          <span className="text-sm">
                            {selectedRequest.specialty}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Date de soumission
                        </span>
                        <span className="text-sm">
                          {formatDate(selectedRequest.submittedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Assigné à</span>
                        <span className="text-sm">
                          {selectedRequest.assignedTo}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Progression de la vérification
                      </h4>
                      <div className="space-y-2">
                        <Progress
                          value={selectedRequest.verificationProgress}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes</h4>
                      <div className="rounded-md border p-3">
                        <p className="text-sm">{selectedRequest.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Documents</h3>
                  <div className="mt-3 space-y-3">
                    {selectedRequest.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center space-x-3">
                          {getDocumentIcon(doc.type)}
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.verified ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              <Check className="mr-1 h-3 w-3" /> Vérifié
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              <Clock className="mr-1 h-3 w-3" /> En attente
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium">
                      Historique des actions
                    </h3>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                          <User className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Demande soumise</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedRequest.submittedAt)}
                          </p>
                        </div>
                      </div>
                      {selectedRequest.status !== "pending" && (
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full ${
                              selectedRequest.status === "approved"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {selectedRequest.status === "approved" ? (
                              <Check className="h-4 w-4 text-green-700" />
                            ) : (
                              <X className="h-4 w-4 text-red-700" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Demande{" "}
                              {selectedRequest.status === "approved"
                                ? "approuvée"
                                : "rejetée"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(new Date().toISOString())}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex items-center justify-between">
                {selectedRequest.status === "pending" ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailOpen(false)}
                    >
                      Fermer
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(selectedRequest)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeter
                    </Button>
                    <Button
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Fermer
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de cette demande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du rejet</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                Cette raison sera communiquée au demandeur.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={!rejectReason.trim()}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
