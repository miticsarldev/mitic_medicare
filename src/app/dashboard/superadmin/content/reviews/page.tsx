"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/hooks/use-toast";

// Sample data for reviews
const reviews = [
  {
    id: "1",
    title: "Excellente expérience avec Dr. Martin",
    content:
      "J'ai consulté le Dr. Martin pour un problème cardiaque. Son professionnalisme et sa gentillesse m'ont beaucoup aidé. Le diagnostic était précis et le traitement efficace. Je recommande vivement ce médecin.",
    rating: 5,
    author: {
      id: "u1",
      name: "Jean Dupont",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "doctor",
      id: "d1",
      name: "Dr. Sophie Martin",
      specialty: "Cardiologie",
    },
    status: "approved",
    featured: true,
    createdAt: "2024-02-15T10:30:00",
    updatedAt: "2024-02-16T14:20:00",
    likes: 24,
    dislikes: 2,
    reports: 0,
  },
  {
    id: "2",
    title: "Service rapide et efficace",
    content:
      "J'ai été très satisfait de la rapidité avec laquelle j'ai pu obtenir un rendez-vous à l'hôpital Saint-Louis. Le personnel était attentionné et l'établissement très propre. Les résultats de mes examens ont été disponibles en ligne dès le lendemain.",
    rating: 4,
    author: {
      id: "u2",
      name: "Marie Lefevre",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "hospital",
      id: "h1",
      name: "Hôpital Saint-Louis",
      department: "Radiologie",
    },
    status: "approved",
    featured: false,
    createdAt: "2024-01-28T09:15:00",
    updatedAt: "2024-01-28T09:15:00",
    likes: 12,
    dislikes: 1,
    reports: 0,
  },
  {
    id: "3",
    title: "Attente trop longue",
    content:
      "Malgré la compétence du médecin, j'ai dû attendre plus de 2 heures après l'heure de mon rendez-vous. C'est inacceptable quand on a pris la peine de réserver un créneau précis. Le secrétariat devrait mieux gérer le planning.",
    rating: 2,
    author: {
      id: "u3",
      name: "Thomas Bernard",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "doctor",
      id: "d2",
      name: "Dr. Thomas Dubois",
      specialty: "Dermatologie",
    },
    status: "pending",
    featured: false,
    createdAt: "2024-03-05T16:45:00",
    updatedAt: "2024-03-05T16:45:00",
    likes: 0,
    dislikes: 0,
    reports: 0,
  },
  {
    id: "4",
    title: "Application intuitive et pratique",
    content:
      "Cette application est vraiment bien conçue. J'apprécie particulièrement la facilité avec laquelle on peut prendre rendez-vous et consulter son dossier médical. Les rappels par notification sont également très utiles.",
    rating: 5,
    author: {
      id: "u4",
      name: "Sophie Martin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "platform",
      id: "p1",
      name: "Application mobile",
      version: "2.3.0",
    },
    status: "approved",
    featured: true,
    createdAt: "2024-02-02T11:20:00",
    updatedAt: "2024-02-10T13:30:00",
    likes: 45,
    dislikes: 3,
    reports: 0,
  },
  {
    id: "5",
    title: "Consultation décevante",
    content:
      "Le médecin n'a pas pris le temps d'écouter mes symptômes et m'a prescrit un traitement standard sans approfondir le diagnostic. Je ne recommande pas ce praticien qui semble plus préoccupé par le nombre de patients que par la qualité des soins.",
    rating: 1,
    author: {
      id: "u5",
      name: "Pierre Durand",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "doctor",
      id: "d3",
      name: "Dr. Jean Dupont",
      specialty: "Médecine générale",
    },
    status: "rejected",
    featured: false,
    createdAt: "2024-01-15T14:00:00",
    updatedAt: "2024-01-16T09:30:00",
    likes: 0,
    dislikes: 0,
    reports: 3,
  },
  {
    id: "6",
    title: "Excellente clinique, personnel attentionné",
    content:
      "J'ai été opéré à la Clinique des Champs-Élysées et je suis très satisfait de mon expérience. Les chambres sont confortables, le personnel infirmier est aux petits soins et les chirurgiens sont très compétents. Ma convalescence s'est parfaitement déroulée.",
    rating: 5,
    author: {
      id: "u6",
      name: "Isabelle Petit",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "hospital",
      id: "h2",
      name: "Clinique des Champs-Élysées",
      department: "Chirurgie",
    },
    status: "approved",
    featured: false,
    createdAt: "2024-02-20T09:30:00",
    updatedAt: "2024-02-20T09:30:00",
    likes: 18,
    dislikes: 0,
    reports: 0,
  },
  {
    id: "7",
    title: "Problèmes techniques récurrents",
    content:
      "L'application plante régulièrement lorsque j'essaie de télécharger mes documents médicaux. J'ai signalé le problème plusieurs fois mais il persiste. C'est dommage car le concept est bon, mais l'exécution laisse à désirer.",
    rating: 2,
    author: {
      id: "u7",
      name: "Lucas Moreau",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    target: {
      type: "platform",
      id: "p1",
      name: "Application mobile",
      version: "2.3.0",
    },
    status: "pending",
    featured: false,
    createdAt: "2024-03-01T15:45:00",
    updatedAt: "2024-03-01T15:45:00",
    likes: 5,
    dislikes: 1,
    reports: 0,
  },
];

// Sample data for review targets
const reviewTargets = [
  { type: "doctor", label: "Médecins" },
  { type: "hospital", label: "Établissements" },
  { type: "platform", label: "Plateforme" },
];

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTargetType, setSelectedTargetType] = useState<string | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<
    (typeof reviews)[0] | null
  >(null);
  const [sortBy, setSortBy] = useState<"date" | "rating" | "likes">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // Form state for edit
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formAdminResponse, setFormAdminResponse] = useState("");

  // Pagination
  const itemsPerPage = 5;

  // Filter reviews based on search, target type, status, rating, and featured
  const filteredReviews = reviews.filter((review) => {
    // Filter by tab
    if (activeTab === "pending" && review.status !== "pending") return false;
    if (activeTab === "approved" && review.status !== "approved") return false;
    if (activeTab === "rejected" && review.status !== "rejected") return false;
    if (activeTab === "featured" && !review.featured) return false;
    if (activeTab === "reported" && review.reports === 0) return false;

    const matchesSearch =
      searchQuery === "" ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.target.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTargetType =
      !selectedTargetType || review.target.type === selectedTargetType;

    const matchesStatus = !selectedStatus || review.status === selectedStatus;

    const matchesRating = !selectedRating || review.rating === selectedRating;

    const matchesFeatured = !showFeaturedOnly || review.featured;

    return (
      matchesSearch &&
      matchesTargetType &&
      matchesStatus &&
      matchesRating &&
      matchesFeatured
    );
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortBy === "rating") {
      return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
    } else {
      return sortOrder === "asc" ? a.likes - b.likes : b.likes - a.likes;
    }
  });

  // Paginate reviews
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);

  // Toggle sort order
  const toggleSort = (field: "date" | "rating" | "likes") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormStatus("");
    setFormFeatured(false);
    setFormAdminResponse("");
  };

  // Open edit dialog
  const openEditDialog = (review: (typeof reviews)[0]) => {
    setSelectedReview(review);
    setFormTitle(review.title);
    setFormContent(review.content);
    setFormStatus(review.status);
    setFormFeatured(review.featured);
    setFormAdminResponse("");
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (review: (typeof reviews)[0]) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (review: (typeof reviews)[0]) => {
    setSelectedReview(review);
    setIsDeleteDialogOpen(true);
  };

  // Handle update review
  const handleUpdateReview = () => {
    // In a real app, this would send data to the backend
    console.log("Updating review:", {
      id: selectedReview?.id,
      title: formTitle,
      content: formContent,
      status: formStatus,
      featured: formFeatured,
      adminResponse: formAdminResponse,
    });

    toast({
      title: "Avis mis à jour",
      description: "L'avis a été mis à jour avec succès.",
    });

    setIsEditDialogOpen(false);
    resetForm();
  };

  // Handle delete review
  const handleDeleteReview = () => {
    // In a real app, this would send a delete request to the backend
    console.log("Deleting review:", selectedReview?.id);

    toast({
      title: "Avis supprimé",
      description: "L'avis a été supprimé avec succès.",
      variant: "destructive",
    });

    setIsDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  // Handle feature toggle
  const handleFeatureToggle = (review: (typeof reviews)[0]) => {
    console.log(
      `${review.featured ? "Removing" : "Adding"} feature status for review:`,
      review.id
    );

    toast({
      title: review.featured
        ? "Avis retiré des mises en avant"
        : "Avis mis en avant",
      description: review.featured
        ? "L'avis a été retiré des mises en avant avec succès."
        : "L'avis a été mis en avant avec succès.",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approuvé</Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-amber-500 border-amber-500 hover:bg-amber-50"
          >
            En attente
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Get target type badge
  const getTargetTypeBadge = (type: string) => {
    switch (type) {
      case "doctor":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            Médecin
          </Badge>
        );
      case "hospital":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            Établissement
          </Badge>
        );
      case "platform":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            Plateforme
          </Badge>
        );
      default:
        return <Badge variant="outline">Autre</Badge>;
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Avis & Témoignages
            </h2>
            <p className="text-muted-foreground">
              Gérez les avis des utilisateurs sur les médecins, établissements
              et la plateforme
            </p>
          </div>
          
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Titre, contenu, auteur..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-type">Type de cible</Label>
                  <Select
                    value={selectedTargetType || ""}
                    onValueChange={(value) =>
                      setSelectedTargetType(value || null)
                    }
                  >
                    <SelectTrigger id="target-type">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {reviewTargets.map((target) => (
                        <SelectItem key={target.type} value={target.type}>
                          {target.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={selectedStatus || ""}
                    onValueChange={(value) => setSelectedStatus(value || null)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Note</Label>
                  <Select
                    value={selectedRating?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedRating(value ? Number.parseInt(value) : null)
                    }
                  >
                    <SelectTrigger id="rating">
                      <SelectValue placeholder="Toutes les notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les notes</SelectItem>
                      <SelectItem value="5">5 étoiles</SelectItem>
                      <SelectItem value="4">4 étoiles</SelectItem>
                      <SelectItem value="3">3 étoiles</SelectItem>
                      <SelectItem value="2">2 étoiles</SelectItem>
                      <SelectItem value="1">1 étoile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-only"
                    checked={showFeaturedOnly}
                    onCheckedChange={(checked) =>
                      setShowFeaturedOnly(!!checked)
                    }
                  />
                  <label
                    htmlFor="featured-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Afficher uniquement les avis mis en avant
                  </label>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTargetType(null);
                    setSelectedStatus(null);
                    setSelectedRating(null);
                    setShowFeaturedOnly(false);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total des avis</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium">Par statut</span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                        Approuvés
                      </span>
                      <span>
                        {reviews.filter((r) => r.status === "approved").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                        En attente
                      </span>
                      <span>
                        {reviews.filter((r) => r.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                        Rejetés
                      </span>
                      <span>
                        {reviews.filter((r) => r.status === "rejected").length}
                      </span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium">Par note</span>
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(
                        (r) => r.rating === rating
                      ).length;
                      const percentage = Math.round(
                        (count / reviews.length) * 100
                      );
                      return (
                        <div key={rating} className="flex items-center text-sm">
                          <div className="flex w-20 items-center">
                            <span>{rating}</span>
                            <Star className="ml-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="ml-2 h-2 w-full max-w-[150px] rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="ml-2 w-10 text-right">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium">Autres</span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Mis en avant</span>
                      <span>{reviews.filter((r) => r.featured).length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Signalés</span>
                      <span>{reviews.filter((r) => r.reports > 0).length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="approved">Approuvés</TabsTrigger>
                <TabsTrigger value="rejected">Rejetés</TabsTrigger>
                <TabsTrigger value="featured">Mis en avant</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>Tous les avis</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSort("date")}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSort("rating")}
                        >
                          Note
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSort("likes")}
                        >
                          Likes
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Avis</TableHead>
                          <TableHead>Cible</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedReviews.length > 0 ? (
                          paginatedReviews.map((review) => (
                            <TableRow key={review.id}>
                              <TableCell>
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage
                                      src={review.author.avatar}
                                      alt={review.author.name}
                                    />
                                    <AvatarFallback>
                                      {review.author.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {review.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                      {review.content.substring(0, 80)}...
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                      {renderStarRating(review.rating)}
                                      <span className="text-xs text-muted-foreground">
                                        par {review.author.name}
                                      </span>
                                      {review.featured && (
                                        <Badge
                                          variant="outline"
                                          className="bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                          Mis en avant
                                        </Badge>
                                      )}
                                      {review.reports > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="bg-red-50 text-red-700 border-red-200"
                                        >
                                          {review.reports} signalement
                                          {review.reports > 1 ? "s" : ""}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {review.target.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {getTargetTypeBadge(review.target.type)}
                                    {review.target.specialty && (
                                      <span className="text-xs text-muted-foreground">
                                        {review.target.specialty}
                                      </span>
                                    )}
                                    {review.target.department && (
                                      <span className="text-xs text-muted-foreground">
                                        {review.target.department}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(review.status)}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    {formatDate(review.createdAt)}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ThumbsUp className="h-3 w-3" />{" "}
                                    {review.likes}
                                    <ThumbsDown className="h-3 w-3" />{" "}
                                    {review.dislikes}
                                  </div>
                                </div>
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
                                      onClick={() => openViewDialog(review)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Voir
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(review)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleFeatureToggle(review)
                                      }
                                    >
                                      <Star className="mr-2 h-4 w-4" />
                                      {review.featured
                                        ? "Retirer des mises en avant"
                                        : "Mettre en avant"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openDeleteDialog(review)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <MessageSquare className="h-10 w-10 mb-2" />
                                <p>Aucun avis trouvé</p>
                                <p className="text-sm">
                                  Ajustez vos filtres pour voir plus de
                                  résultats
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4">
                    <div className="text-sm text-muted-foreground">
                      Affichage de {paginatedReviews.length} sur{" "}
                      {filteredReviews.length} avis
                    </div>
                    {totalPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }
                              {...(currentPage === 1 && { disabled: true })}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                isActive={currentPage === i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(totalPages, currentPage + 1)
                                )
                              }
                              {...(currentPage === totalPages && {
                                disabled: true,
                              })}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis en attente de modération</CardTitle>
                    <CardDescription>
                      Ces avis nécessitent une vérification avant d&apos;être
                      publiés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Contenu similaire à l'onglet "all" mais filtré pour les avis en attente */}
                    {filteredReviews.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-2" />
                        <p>Aucun avis en attente</p>
                        <p className="text-sm">Tous les avis ont été modérés</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedReviews.map((review) => (
                          <div
                            key={review.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage
                                    src={review.author.avatar}
                                    alt={review.author.name}
                                  />
                                  <AvatarFallback>
                                    {review.author.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {review.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {review.content}
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    {renderStarRating(review.rating)}
                                    <span className="text-xs text-muted-foreground">
                                      par {review.author.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      • {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(review)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modérer
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {review.target.type === "doctor"
                                    ? "Médecin"
                                    : review.target.type === "hospital"
                                    ? "Établissement"
                                    : "Plateforme"}
                                </Badge>
                                <span className="text-sm">
                                  {review.target.name}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => {
                                    // Approuver l'avis
                                    toast({
                                      title: "Avis approuvé",
                                      description:
                                        "L'avis a été approuvé et publié.",
                                    });
                                  }}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approuver
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    // Rejeter l'avis
                                    toast({
                                      title: "Avis rejeté",
                                      description: "L'avis a été rejeté.",
                                      variant: "destructive",
                                    });
                                  }}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Rejeter
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contenu similaire pour les autres onglets */}
              <TabsContent value="approved" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis approuvés</CardTitle>
                    <CardDescription>
                      Ces avis ont été vérifiés et sont visibles par les
                      utilisateurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Contenu similaire aux autres onglets */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis rejetés</CardTitle>
                    <CardDescription>
                      Ces avis ont été rejetés et ne sont pas visibles par les
                      utilisateurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Contenu similaire aux autres onglets */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="featured" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis mis en avant</CardTitle>
                    <CardDescription>
                      Ces avis sont mis en avant sur la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Contenu similaire aux autres onglets */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialogs */}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;avis</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedReview.author.avatar}
                    alt={selectedReview.author.name}
                  />
                  <AvatarFallback>
                    {selectedReview.author.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{selectedReview.title}</h3>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStarRating(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">
                      par {selectedReview.author.name}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{selectedReview.content}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Cible de l&apos;avis
                  </h4>
                  <div className="flex items-center gap-2">
                    {getTargetTypeBadge(selectedReview.target.type)}
                    <span className="font-medium">
                      {selectedReview.target.name}
                    </span>
                  </div>
                  {selectedReview.target.specialty && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Spécialité: {selectedReview.target.specialty}
                    </p>
                  )}
                  {selectedReview.target.department && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Département: {selectedReview.target.department}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Informations</h4>
                  <p className="text-sm">
                    Créé le: {formatDate(selectedReview.createdAt)}
                  </p>
                  <p className="text-sm">
                    Mis à jour le: {formatDate(selectedReview.updatedAt)}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReview.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReview.dislikes}</span>
                    </div>
                    {selectedReview.reports > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {selectedReview.reports} signalement
                        {selectedReview.reports > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Fermer
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      openEditDialog(selectedReview);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant={selectedReview.featured ? "outline" : "default"}
                    onClick={() => {
                      handleFeatureToggle(selectedReview);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {selectedReview.featured
                      ? "Retirer des mises en avant"
                      : "Mettre en avant"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;avis</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l&apos;avis et définissez son statut
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Titre</Label>
                  <Input
                    id="edit-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Contenu</Label>
                  <Textarea
                    id="edit-content"
                    rows={5}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Statut</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approuvé</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="edit-featured"
                      checked={formFeatured}
                      onCheckedChange={(checked) => setFormFeatured(!!checked)}
                    />
                    <label
                      htmlFor="edit-featured"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mettre en avant cet avis
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-admin-response">
                    Réponse de l&apos;administrateur (optionnel)
                  </Label>
                  <Textarea
                    id="edit-admin-response"
                    rows={3}
                    placeholder="Ajoutez une réponse officielle à cet avis..."
                    value={formAdminResponse}
                    onChange={(e) => setFormAdminResponse(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdateReview}>
                  Enregistrer les modifications
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet avis ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;avis sera définitivement
              supprimé de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
