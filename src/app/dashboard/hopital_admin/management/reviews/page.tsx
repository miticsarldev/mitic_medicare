'use client'
import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Loader2,
    Star,
    Search,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    ShieldX,
    ShieldQuestion
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ReviewStatus, ReviewTargetType } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types
interface Author {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}

interface DoctorInfo {
    id: string;
    name: string;
    specialization: string | null;
}

interface HospitalInfo {
    id: string;
    name: string;
}

interface Review {
    id: string;
    title: string;
    content: string;
    rating: number;
    author: Author | null;
    targetType: ReviewTargetType;
    doctor: DoctorInfo | null;
    hospital: HospitalInfo | null;
    status: ReviewStatus;
    isAnonymous: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface ApiResponse {
    reviews: Review[];
    pagination: Pagination;
}

const STATUS_OPTIONS = [
    { value: "ALL", label: "Tous les statuts" },
    { value: "PENDING", label: "En attente" },
    { value: "APPROVED", label: "Approuvé" },
    { value: "REJECTED", label: "Rejeté" },
];

const TARGET_OPTIONS = [
    { value: "ALL", label: "Toutes les cibles" },
    { value: "DOCTOR", label: "Médecins" },
    { value: "HOSPITAL", label: "Hôpital" },
];

const STATUS_COLORS = {
    PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/50",
    APPROVED: "bg-green-500/10 text-green-600 border-green-500/50",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/50",
};

const STATUS_ICONS = {
    PENDING: <ShieldQuestion className="w-4 h-4" />,
    APPROVED: <ShieldCheck className="w-4 h-4" />,
    REJECTED: <ShieldX className="w-4 h-4" />,
};

const STATUT_TITLES = {
    PENDING: "En attente",
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
};

const PAGE_SIZE = 6;

export default function AdminReviewPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("ALL");
    const [targetFilter, setTargetFilter] = useState<ReviewTargetType | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        pageSize: PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    });
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                targetType: targetFilter !== "ALL" ? targetFilter : undefined,
                page: pagination.currentPage,
                pageSize: PAGE_SIZE,
                search: searchQuery || undefined,
            };

            const { data } = await axios.get<ApiResponse>("/api/hospital_admin/reviews", { params });

            setReviews(data.reviews);
            setPagination(data.pagination);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
            setError("Erreur lors du chargement des avis. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, targetFilter, pagination.currentPage, searchQuery]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "PPpp", { locale: fr });
    };

    const getTargetName = (review: Review) => {
        if (review.targetType === "DOCTOR" && review.doctor) {
            return review.doctor.name;
        }
        if (review.targetType === "HOSPITAL" && review.hospital) {
            return review.hospital.name;
        }
        return "Inconnu";
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestion des avis</h1>
                        <p className="text-sm text-muted-foreground">
                            Consultez et modérez les avis des patients
                        </p>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="flex flex-col md:flex-row gap-4">

                    <Select
                        value={statusFilter}
                        onValueChange={(value: ReviewStatus | "ALL") => {
                            setStatusFilter(value);
                            setPagination(prev => ({ ...prev, currentPage: 1 }));
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={targetFilter}
                        onValueChange={(value: ReviewTargetType | "ALL") => {
                            setTargetFilter(value);
                            setPagination(prev => ({ ...prev, currentPage: 1 }));
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Cible" />
                        </SelectTrigger>
                        <SelectContent>
                            {TARGET_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* État de chargement et erreur */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Liste des avis */}
                {!loading && !error && (
                    <>
                        {reviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <Search className="w-8 h-8 text-muted-foreground" />
                                <p className="text-muted-foreground">Aucun avis trouvé</p>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setStatusFilter("ALL");
                                        setTargetFilter("ALL");
                                        setSearchQuery("");
                                    }}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reviews.map((review) => (
                                    <Card
                                        key={review.id}
                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <CardTitle className="text-lg line-clamp-2">
                                                    {review.title}
                                                </CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "flex items-center gap-1 py-1",
                                                        STATUS_COLORS[review.status]
                                                    )}
                                                >
                                                    {STATUS_ICONS[review.status]}
                                                    <span className="capitalize">
                                                        {STATUT_TITLES[review.status]}
                                                    </span>
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {review.isAnonymous ? "Anonyme" : review.author?.name || "Inconnu"} • {formatDate(review.createdAt)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn("w-4 h-4", {
                                                            "fill-yellow-500": i < review.rating,
                                                            "fill-none stroke-yellow-500/50": i >= review.rating,
                                                        })}
                                                    />
                                                ))}
                                                <span className="text-sm text-muted-foreground ml-1">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                            <p className="text-sm line-clamp-3 text-muted-foreground">
                                                {review.content}
                                            </p>
                                            <div className="text-xs text-muted-foreground">
                                                Sur: {getTargetName(review)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                <div className="text-sm text-muted-foreground">
                                    {pagination.totalItems} avis • Page {pagination.currentPage} sur {pagination.totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasPreviousPage}
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasNextPage}
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    >
                                        Suivant
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Modal de détails */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedReview && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>{selectedReview.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn("w-4 h-4", {
                                                        "fill-yellow-500": i < selectedReview.rating,
                                                        "fill-none stroke-yellow-500/50": i >= selectedReview.rating,
                                                    })}
                                                />
                                            ))}
                                            <span className="text-muted-foreground ml-1">
                                                {selectedReview.rating}/5
                                            </span>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "flex items-center gap-1 py-1",
                                                STATUS_COLORS[selectedReview.status]
                                            )}
                                        >
                                            {STATUS_ICONS[selectedReview.status]}
                                            <span className="capitalize">
                                                {STATUT_TITLES[selectedReview.status]}
                                            </span>
                                        </Badge>
                                        <div className="text-muted-foreground">
                                            {selectedReview.isAnonymous ? "Anonyme" : selectedReview.author?.name || "Inconnu"}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {formatDate(selectedReview.createdAt)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-medium">Cible</h3>
                                            <p className="text-sm">
                                                {getTargetName(selectedReview)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-medium">Type</h3>
                                            <p className="text-sm capitalize">
                                                {selectedReview.targetType.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Contenu</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {selectedReview.content}
                                        </p>
                                    </div>

                                    {!selectedReview.isAnonymous && selectedReview.author && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Auteur</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">Nom</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedReview.author.name}
                                                    </p>
                                                </div>
                                                {selectedReview.author.email && (
                                                    <div>
                                                        <p className="text-sm font-medium">Email</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedReview.author.email}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedReview.author.phone && (
                                                    <div>
                                                        <p className="text-sm font-medium">Téléphone</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedReview.author.phone}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    {/* Les boutons d'action ont été supprimés comme demandé */}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}