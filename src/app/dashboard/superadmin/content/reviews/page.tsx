"use client";

import { useState, useEffect } from "react";
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
  Loader2,
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

// Define Review type
interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  author?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  targetType: "DOCTOR" | "HOSPITAL" | "PLATFORM";
  doctor?: {
    id: string;
    user?: { name: string };
  };
  hospital?: {
    id: string;
    name: string;
  };
  status: "APPROVED" | "PENDING" | "REJECTED";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  reports: number;
}

interface ApiResponse {
  reviews: Review[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Component to render reviews for a specific tab
function ReviewList({
  reviews,
  openEditDialog,
  openViewDialog,
  openDeleteDialog,
  handleApproveReview,
  handleRejectReview,
  renderStarRating,
  formatDate,
  tab,
}: {
  reviews: Review[];
  openEditDialog: (review: Review) => void;
  openViewDialog: (review: Review) => void;
  openDeleteDialog: (review: Review) => void;
  handleApproveReview: (reviewId: string) => void;
  handleRejectReview: (reviewId: string) => void;
  renderStarRating: (rating: number) => JSX.Element;
  formatDate: (dateString: string) => string;
  tab: string;
}) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mb-2" />
          <p>Aucun avis trouvé</p>
          <p className="text-sm">Ajustez vos filtres pour voir plus de résultats</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={review.author?.name ?? "Anonyme"} />
                  <AvatarFallback>{review.author?.name?.substring(0, 2) ?? "AN"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{review.content}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {renderStarRating(review.rating)}
                    <span className="text-xs text-muted-foreground">par {review.author?.name ?? "Anonyme"}</span>
                    <span className="text-xs text-muted-foreground">• {formatDate(review.createdAt)}</span>
                    {review.isFeatured && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Mis en avant
                      </Badge>
                    )}
                    {review.reports > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {review.reports} signalement{review.reports > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {tab === "pending" ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApproveReview(review.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectReview(review.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeter
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(review)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {tab === "approved" ? "Modifier" : tab === "rejected" ? "Revoir" : "Modifier"}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openViewDialog(review)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(review)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openEditDialog({ ...review, isFeatured: !review.isFeatured })}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {review.isFeatured ? "Retirer des mises en avant" : "Mettre en avant"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openDeleteDialog(review)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {review.targetType.toLowerCase() === "doctor"
                    ? "Médecin"
                    : review.targetType.toLowerCase() === "hospital"
                    ? "Établissement"
                    : "Plateforme"}
                </Badge>
                <span className="text-sm">{review.doctor?.user?.name ?? review.hospital?.name ?? "Application mobile"}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {review.likes}
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-4 w-4" />
                  {review.dislikes}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTargetType, setSelectedTargetType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating" | "likes">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for edit
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);

  const itemsPerPage = 5;

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy,
          sortOrder,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedTargetType && selectedTargetType !== "all" && { targetType: selectedTargetType.toUpperCase() }),
          ...(selectedStatus && selectedStatus !== "all" && { status: selectedStatus.toUpperCase() }),
          ...(selectedRating && { rating: selectedRating.toString() }),
          ...(showFeaturedOnly && { isFeatured: "true" }),
          ...(activeTab !== "all" && activeTab !== "reported" && { status: activeTab.toUpperCase() }),
          ...(activeTab === "featured" && { isFeatured: "true" }),
        });

        const response = await fetch(`/api/superadmin/reviews?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data: ApiResponse = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
      } catch {
        setError("Erreur lors du chargement des avis.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les avis.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    searchQuery,
    selectedTargetType,
    selectedStatus,
    selectedRating,
    showFeaturedOnly,
    activeTab,
  ]);

  // Toggle sort order
  const toggleSort = (field: "createdAt" | "rating" | "likes") => {
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
  };

  // Open edit dialog
  const openEditDialog = (review: Review) => {
    setSelectedReview(review);
    setFormTitle(review.title);
    setFormContent(review.content);
    setFormStatus(review.status);
    setFormFeatured(review.isFeatured);
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (review: Review) => {
    setSelectedReview(review);
    setIsDeleteDialogOpen(true);
  };

  // Handle approve review
  const handleApproveReview = async (reviewId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/superadmin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status: "APPROVED" }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve review");
      }
      const updatedReview = await response.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );
      toast({
        title: "Avis approuvé",
        description: "L'avis a été approuvé et publié.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'avis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject review
  const handleRejectReview = async (reviewId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/superadmin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status: "REJECTED" }),
      });
      if (!response.ok) {
        throw new Error("Failed to reject review");
      }
      const updatedReview = await response.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );
      toast({
        title: "Avis rejeté",
        description: "L'avis a été rejeté.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'avis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update review
  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/superadmin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          status: formStatus,
          title: formTitle,
          content: formContent,
          isFeatured: formFeatured,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update review");
      }
      const updatedReview = await response.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );
      toast({
        title: "Avis mis à jour",
        description: "L'avis a été mis à jour avec succès.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'avis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditDialogOpen(false);
      resetForm();
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/superadmin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: selectedReview.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete review");
      }
      setReviews((prev) => prev.filter((r) => r.id !== selectedReview.id));
      toast({
        title: "Avis supprimé",
        description: "L'avis a été supprimé avec succès.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedReview(null);
    }
  };

  // Handle feature toggle
  const handleFeatureToggle = async (review: Review) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/superadmin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          status: review.status,
          isFeatured: !review.isFeatured,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle feature status");
      }
      const updatedReview = await response.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );
      toast({
        title: review.isFeatured ? "Avis retiré des mises en avant" : "Avis mis en avant",
        description: review.isFeatured
          ? "L'avis a été retiré des mises en avant avec succès."
          : "L'avis a été mis en avant avec succès.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de mise en avant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500 hover:bg-green-600">Approuvé</Badge>;
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="text-amber-500 border-amber-500 hover:bg-amber-50"
          >
            En attente
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Get target type badge
  const getTargetTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
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
      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center py-4">{error}</div>
      )}
      {!isLoading && !error && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Avis & Témoignages</h2>
              <p className="text-muted-foreground">
                Gérez les avis des utilisateurs sur les médecins, établissements et la plateforme
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
                      onValueChange={(value) => setSelectedTargetType(value || null)}
                    >
                      <SelectTrigger id="target-type">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="DOCTOR">Médecins</SelectItem>
                        <SelectItem value="HOSPITAL">Établissements</SelectItem>
                        <SelectItem value="PLATFORM">Plateforme</SelectItem>
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
                        <SelectItem value="APPROVED">Approuvé</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="REJECTED">Rejeté</SelectItem>
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
                      onCheckedChange={(checked) => setShowFeaturedOnly(!!checked)}
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
                        <span>{reviews.filter((r) => r.status === "APPROVED").length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                          En attente
                        </span>
                        <span>{reviews.filter((r) => r.status === "PENDING").length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                          Rejetés
                        </span>
                        <span>{reviews.filter((r) => r.status === "REJECTED").length}</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Par note</span>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter((r) => r.rating === rating).length;
                        const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
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
                            <span className="ml-2 w-10 text-right">{percentage}%</span>
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
                        <span>{reviews.filter((r) => r.isFeatured).length}</span>
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
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
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
                            onClick={() => toggleSort("createdAt")}
                            aria-label={`Trier par date (${sortOrder === "asc" ? "ascendant" : "descendant"})`}
                          >
                            Date
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSort("rating")}
                            aria-label={`Trier par note (${sortOrder === "asc" ? "ascendant" : "descendant"})`}
                          >
                            Note
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSort("likes")}
                            aria-label={`Trier par likes (${sortOrder === "asc" ? "ascendant" : "descendant"})`}
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
                          {reviews.length > 0 ? (
                            reviews.map((review) => (
                              <TableRow key={review.id}>
                                <TableCell>
                                  <div className="flex items-start gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={review.author?.name ?? "Anonyme"} />
                                      <AvatarFallback>{review.author?.name?.substring(0, 2) ?? "AN"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{review.title}</div>
                                      <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                        {review.content.substring(0, 80)}...
                                      </div>
                                      <div className="mt-1 flex items-center gap-2">
                                        {renderStarRating(review.rating)}
                                        <span className="text-xs text-muted-foreground">par {review.author?.name ?? "Anonyme"}</span>
                                        {review.isFeatured && (
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
                                            {review.reports} signalement{review.reports > 1 ? "s" : ""}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {review.doctor?.user?.name ?? review.hospital?.name ?? "Application mobile"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {getTargetTypeBadge(review.targetType)}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(review.status)}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm">{formatDate(review.createdAt)}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <ThumbsUp className="h-3 w-3" /> {review.likes}
                                      <ThumbsDown className="h-3 w-3" /> {review.dislikes}
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
                                      <DropdownMenuItem onClick={() => openViewDialog(review)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Voir
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openEditDialog(review)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleFeatureToggle(review)}
                                      >
                                        <Star className="mr-2 h-4 w-4" />
                                        {review.isFeatured ? "Retirer des mises en avant" : "Mettre en avant"}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => openDeleteDialog(review)} className="text-red-600">
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
                                  <p className="text-sm">Ajustez vos filtres pour voir plus de résultats</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {reviews.length} sur {totalPages * itemsPerPage} avis
                      </div>
                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                {...(currentPage === totalPages && { disabled: true })}
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
                        Ces avis nécessitent une vérification avant d&apos;être publiés
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReviewList
                        reviews={reviews}
                        openEditDialog={openEditDialog}
                        openViewDialog={openViewDialog}
                        openDeleteDialog={openDeleteDialog}
                        handleApproveReview={handleApproveReview}
                        handleRejectReview={handleRejectReview}
                        renderStarRating={renderStarRating}
                        formatDate={formatDate}
                        tab="pending"
                      />
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {reviews.length} sur {totalPages * itemsPerPage} avis
                      </div>
                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                {...(currentPage === totalPages && { disabled: true })}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="approved" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avis approuvés</CardTitle>
                      <CardDescription>
                        Ces avis ont été vérifiés et sont visibles par les utilisateurs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReviewList
                        reviews={reviews}
                        openEditDialog={openEditDialog}
                        openViewDialog={openViewDialog}
                        openDeleteDialog={openDeleteDialog}
                        handleApproveReview={handleApproveReview}
                        handleRejectReview={handleRejectReview}
                        renderStarRating={renderStarRating}
                        formatDate={formatDate}
                        tab="approved"
                      />
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {reviews.length} sur {totalPages * itemsPerPage} avis
                      </div>
                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                {...(currentPage === totalPages && { disabled: true })}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="rejected" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avis rejetés</CardTitle>
                      <CardDescription>
                        Ces avis ont été rejetés et ne sont pas visibles par les utilisateurs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReviewList
                        reviews={reviews}
                        openEditDialog={openEditDialog}
                        openViewDialog={openViewDialog}
                        openDeleteDialog={openDeleteDialog}
                        handleApproveReview={handleApproveReview}
                        handleRejectReview={handleRejectReview}
                        renderStarRating={renderStarRating}
                        formatDate={formatDate}
                        tab="rejected"
                      />
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {reviews.length} sur {totalPages * itemsPerPage} avis
                      </div>
                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                {...(currentPage === totalPages && { disabled: true })}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </CardFooter>
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
                      <ReviewList
                        reviews={reviews}
                        openEditDialog={openEditDialog}
                        openViewDialog={openViewDialog}
                        openDeleteDialog={openDeleteDialog}
                        handleApproveReview={handleApproveReview}
                        handleRejectReview={handleRejectReview}
                        renderStarRating={renderStarRating}
                        formatDate={formatDate}
                        tab="featured"
                      />
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {reviews.length} sur {totalPages * itemsPerPage} avis
                      </div>
                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                {...(currentPage === totalPages && { disabled: true })}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

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
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={selectedReview.author?.name ?? "Anonyme"} />
                  <AvatarFallback>{selectedReview.author?.name?.substring(0, 2) ?? "AN"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{selectedReview.title}</h3>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStarRating(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">par {selectedReview.author?.name ?? "Anonyme"}</span>
                  </div>
                  <p className="mt-2 text-sm">{selectedReview.content}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Cible de l&apos;avis</h4>
                  <div className="flex items-center gap-2">
                    {getTargetTypeBadge(selectedReview.targetType)}
                    <span className="font-medium">
                      {selectedReview.doctor?.user?.name ?? selectedReview.hospital?.name ?? "Application mobile"}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Informations</h4>
                  <p className="text-sm">Créé le: {formatDate(selectedReview.createdAt)}</p>
                  <p className="text-sm">Mis à jour le: {formatDate(selectedReview.updatedAt)}</p>
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
                        {selectedReview.reports} signalement{selectedReview.reports > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
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
                    variant={selectedReview.isFeatured ? "outline" : "default"}
                    onClick={() => {
                      handleFeatureToggle(selectedReview);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {selectedReview.isFeatured ? "Retirer des mises en avant" : "Mettre en avant"}
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
            <DialogDescription>Modifiez les détails de l&apos;avis et définissez son statut</DialogDescription>
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
                        <SelectItem value="APPROVED">Approuvé</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="REJECTED">Rejeté</SelectItem>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateReview} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet avis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;avis sera définitivement supprimé de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}