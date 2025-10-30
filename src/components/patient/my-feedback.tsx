"use client";

import { Skeleton } from "@/components/ui/skeleton";

import type React from "react";

import { useState, useEffect } from "react";
import { Star, Filter, Search, User, Hospital } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteReview, getUserReviews } from "@/app/dashboard/patient/actions";

// Types
type Review = {
  id: string;
  type: "doctor" | "hospital";
  title?: string;
  name: string;
  specialty: string;
  rating: number;
  date: string;
  comment: string;
  image: string;
  status: string;
};

export default function MyFeedbackPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const reviews = await getUserReviews();
        setMyReviews(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos avis. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [toast]);

  const filteredReviews = myReviews.filter((review) => {
    // Filter by tab
    if (selectedTab !== "all" && review.type !== selectedTab) {
      return false;
    }

    // Filter by search
    if (
      searchQuery &&
      !review.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleDeleteReview = (id: string) => {
    setSelectedReviewId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReviewId) return;

    try {
      await deleteReview(selectedReviewId);

      // Update local state
      setMyReviews(
        myReviews.filter((review) => review.id !== selectedReviewId)
      );

      toast({
        title: "Avis supprimé",
        description: "Votre avis a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre avis. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReviewId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Mes Avis</h1>
        <Link href="/dashboard/patient/reviews/give-feedback">
          <Button>Donner un nouvel avis</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un avis..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedTab("all")}>
              Tous les avis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTab("doctor")}>
              Médecins uniquement
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTab("hospital")}>
              Établissements uniquement
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="doctor">
            <User className="mr-2 h-4 w-4" />
            Médecins
          </TabsTrigger>
          <TabsTrigger value="hospital">
            <Hospital className="mr-2 h-4 w-4" />
            Établissements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={handleDeleteReview}
                renderStars={renderStars}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun avis trouvé</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="doctor" className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={handleDeleteReview}
                renderStars={renderStars}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun avis trouvé pour des médecins
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hospital" className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={handleDeleteReview}
                renderStars={renderStars}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun avis trouvé pour des établissements
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet avis ? Cette action ne peut
              pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ReviewCardProps {
  review: {
    id: string;
    type: string;
    title?: string;
    name: string;
    specialty: string;
    rating: number;
    date: string;
    comment: string;
    image: string;
    status: string;
  };
  onDelete: (id: string) => void;
  renderStars: (rating: number) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReviewCard({ review, onDelete, renderStars }: ReviewCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-sm">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={review.image || "/placeholder.svg"}
              alt={review.name}
            />
            <AvatarFallback>{review.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {review.title || review.name}
            </CardTitle>
            <CardDescription>{review.specialty}</CardDescription>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={review.type === "doctor" ? "default" : "secondary"}>
            {review.type === "doctor" ? "Médecin" : "Établissement"}
          </Badge>
          {review.status === "PENDING" && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-800 border-amber-200"
            >
              En attente de modération
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2 mb-2">
          {renderStars(review.rating)}
          <span className="text-sm text-muted-foreground">{review.date}</span>
        </div>
        <p className="text-sm">{review.comment}</p>
      </CardContent>
      {/* <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(review.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </CardFooter> */}
    </Card>
  );
}

// Loading component for internal use
function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full md:w-3/4" />
        <Skeleton className="h-10 w-full md:w-1/4" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
