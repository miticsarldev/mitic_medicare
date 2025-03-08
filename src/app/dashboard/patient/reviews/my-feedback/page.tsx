"use client";

import { useState } from "react";
import {
  Star,
  Edit,
  Trash2,
  Filter,
  Search,
  User,
  Hospital,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { toast } from "@/hooks/use-toast";

export default function MyFeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Sample data
  const myReviews = [
    {
      id: "1",
      type: "doctor",
      name: "Dr. Sophie Martin",
      specialty: "Cardiologie",
      rating: 5,
      date: "15 février 2025",
      comment:
        "Excellente consultation, le Dr. Martin a pris le temps d'expliquer en détail mon traitement et a répondu à toutes mes questions. Je me sens beaucoup plus rassuré après cette visite.",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      type: "hospital",
      name: "Hôpital Saint-Louis",
      specialty: "Paris",
      rating: 4,
      date: "3 janvier 2025",
      comment:
        "Personnel attentionné et installations modernes. Le temps d'attente était un peu long, mais la qualité des soins était excellente.",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      type: "doctor",
      name: "Dr. Thomas Dubois",
      specialty: "Dermatologie",
      rating: 3,
      date: "28 décembre 2024",
      comment:
        "Consultation rapide et efficace. Le médecin était compétent mais un peu pressé. J'aurais aimé plus de temps pour discuter de mes préoccupations.",
      image: "/placeholder.svg?height=40&width=40",
    },
  ];

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

  const confirmDelete = () => {
    // Delete logic would go here
    toast({
      title: "Avis supprimé",
      description: "Votre avis a été supprimé avec succès",
    });
    setDeleteDialogOpen(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              rating >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Mes Avis</h1>
        <Link href="/dashboard/patient/reviews/give-feedback">
          <Button>Donner un nouvel avis</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
    name: string;
    specialty: string;
    rating: number;
    date: string;
    comment: string;
    image: string;
  };
  onDelete: (id: string) => void;
  renderStars: (rating: number) => React.ReactNode;
}

function ReviewCard({ review, onDelete, renderStars }: ReviewCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-sm">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.image} alt={review.name} />
            <AvatarFallback>{review.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{review.name}</CardTitle>
            <CardDescription>{review.specialty}</CardDescription>
          </div>
        </div>
        <Badge variant={review.type === "doctor" ? "default" : "secondary"}>
          {review.type === "doctor" ? "Médecin" : "Établissement"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2 mb-2">
          {renderStars(review.rating)}
          <span className="text-sm text-muted-foreground">{review.date}</span>
        </div>
        <p className="text-sm">{review.comment}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
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
      </CardFooter>
    </Card>
  );
}
