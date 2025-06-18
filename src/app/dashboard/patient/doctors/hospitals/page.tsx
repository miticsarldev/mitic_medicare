/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2,
  Heart,
  MapPin,
  Phone,
  Search,
  Star,
  Users,
  Stethoscope,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  addHospitalToFavoritesDoctors,
  getFavoriteHospitalIds,
  getHospitalDoctorSpecializationOptions,
  getHospitals,
  removeHospitalToFavoritesHospitals,
} from "../../actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type HospitalRatingDistribution = {
  star: number; // 1 → 5
  count: number; // combien d’avis
  percentage: number; // % sur total des avis
};

type HospitalReview = {
  id: string;
  author: string;
  date: Date;
  rating: number;
  comment: string;
};

type Hospital = {
  id: string;
  name: string;
  status: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  image: string;
  description: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  doctors: number;
  isFavorite: boolean;
  reviews: HospitalReview[];
  ratingDistribution: HospitalRatingDistribution[];
};

function getPaginationRange(current: number, total: number) {
  const delta = 2;
  const range: (number | "...")[] = [];

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);

  if (left > 2) {
    range.push("...");
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < total - 1) {
    range.push("...");
  }

  if (total > 1) {
    range.push(total);
  }

  return range;
}

// Helper function to render star ratings
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function HospitalsPage() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [favoriteHospitalIds, setFavoriteHospitalIds] = useState<Set<string>>(
    new Set()
  );
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [specialties, setSpecialties] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setHospitals([]);

        const isFavorites = showFavoritesOnly;

        const [favorites, specialtiesData, rawData] = await Promise.all([
          getFavoriteHospitalIds(),
          getHospitalDoctorSpecializationOptions({
            favoritesOnly: isFavorites,
          }),
          getHospitals({
            query: searchQuery,
            specialties: selectedSpecialties,
            minRating: minRating[0],
            sortBy,
            page,
            limit,
            favoritesOnly: isFavorites,
          }),
        ]);

        console.log(rawData);

        // Set des spécialités
        setSpecialties(specialtiesData);

        // Mise en forme des hôpitaux
        const isArray = Array.isArray(rawData);
        const hospitalList = isArray ? [] : rawData.data;
        const count = isArray ? 0 : rawData.total;

        const formatted = hospitalList.map((hospital) => ({
          ...hospital,
          website: hospital.website || "", // Ensure website is always a string
          reviews: hospital.reviews.map((review) => ({
            id: review.id,
            author: review.author || "unknown", // Provide a default author
            date: new Date(review.date), // Map to date
            comment: review.comment, // Map comment to comment
            rating: review.rating,
          })),
        }));

        setHospitals(formatted);
        setTotalCount(count);

        // Met à jour les favoris si on n'est pas en mode favorisOnly
        if (!isFavorites) {
          const favSet = new Set(favorites);
          setFavoriteHospitalIds(favSet);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des hôpitaux :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [
    searchQuery,
    selectedSpecialties,
    minRating,
    sortBy,
    limit,
    page,
    showFavoritesOnly,
  ]);

  useEffect(() => {
    setPage(1);
  }, [showFavoritesOnly]);

  // Open hospital detail dialog
  const openHospitalDetail = (hospital: (typeof hospitals)[0]) => {
    setSelectedHospital(hospital);
    setIsDetailOpen(true);
  };

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

  const makeHospitalFavorite = async (hospital) => {
    try {
      const isFav = favoriteHospitalIds.has(hospital.id);

      if (isFav) {
        await removeHospitalToFavoritesHospitals({ hospitalId: hospital.id });
        favoriteHospitalIds.delete(hospital.id);
      } else {
        await addHospitalToFavoritesDoctors({ hospitalId: hospital.id });
        favoriteHospitalIds.add(hospital.id);
      }

      // Met à jour localement l'état des favoris
      setFavoriteHospitalIds(new Set(favoriteHospitalIds));

      // Mise à jour de l’hôpital sélectionné si présent
      setSelectedHospital((prev) =>
        prev ? { ...prev, isFavorite: !isFav } : prev
      );

      // Mise à jour de la liste des hôpitaux
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === hospital.id ? { ...h, isFavorite: !isFav } : h
        )
      );

      toast({
        title: !isFav ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${hospital.name} a bien été ${!isFav ? "ajouté à" : "retiré de"} vos hôpitaux favoris.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris hôpitaux.",
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialties([]);
    setMinRating([4]);
  };

  return (
    <div className="space-y-2 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Recherher un Hôpital
          </h2>
          <p className="text-muted-foreground">
            Trouvez des hôpitaux, cliniques et centres médicaux près de chez
            vous
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Meilleure note</SelectItem>
              <SelectItem value="name">Ordre alphabétique</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-none rounded-l-md"
              onClick={() => setViewMode("grid")}
            >
              Grille
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-none rounded-r-md"
              onClick={() => setViewMode("list")}
            >
              Liste
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Badge
          variant={showFavoritesOnly ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10"
          onClick={() => setShowFavoritesOnly((prev) => !prev)}
        >
          <Heart
            className={`mr-1 h-4 w-4 ${
              showFavoritesOnly
                ? "text-red-500 fill-red-500"
                : "text-muted-foreground"
            }`}
          />
          {showFavoritesOnly ? "Mes favoris" : "Tous les médecins"}
        </Badge>
        <Switch
          id="favoritesOnly"
          checked={showFavoritesOnly}
          onCheckedChange={setShowFavoritesOnly}
        />
        <Label htmlFor="favoritesOnly" className="text-sm">
          Afficher uniquement mes favoris
        </Label>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Nom, adresse, spécialité..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Spécialités</label>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-1.5">
                    {specialties.map((specialty) => (
                      <div
                        key={specialty.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={selectedSpecialties.includes(
                            specialty.value
                          )}
                          onCheckedChange={() =>
                            toggleSpecialty(specialty.value)
                          }
                        />
                        <label
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {specialty.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Établissements médicaux</CardTitle>
                <CardDescription>
                  {totalCount} établissement
                  {totalCount !== 1 ? "s" : ""} trouvé
                  {totalCount !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex items-center gap-2 mt-2">
                          <Skeleton className="h-3 w-1/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-5 w-10 rounded-full" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : hospitals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Aucun établissement trouvé
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Essayez de modifier vos critères de recherche.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hospitals.map((hospital) => (
                    <Card
                      key={hospital.id}
                      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                      onClick={() => openHospitalDetail(hospital)}
                    >
                      <div className="relative h-40 w-full">
                        <img
                          src={hospital.image || "/placeholder.svg"}
                          alt={hospital.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    makeHospitalFavorite(hospital);
                                  }}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      hospital?.isFavorite
                                        ? "fill-red-500 text-red-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {hospital?.isFavorite
                                  ? "Retirer des favoris"
                                  : "Ajouter aux favoris"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">
                          {hospital.name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Badge variant="outline" className="font-normal">
                            {hospital.status}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span className="truncate">{hospital.address}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <StarRating rating={hospital.rating} />
                          <span className="text-xs text-muted-foreground">
                            {hospital.reviewCount} avis
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {hospital.specialties.slice(0, 3).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hospital.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="flex items-center rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer"
                      onClick={() => openHospitalDetail(hospital)}
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={hospital.image || "/placeholder.svg"}
                          alt={hospital.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {hospital.name}
                            </p>
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className="mr-2 font-normal text-xs"
                              >
                                {hospital.status}
                              </Badge>
                              <StarRating rating={hospital.rating} />
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({hospital.reviewCount})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      makeHospitalFavorite(hospital);
                                    }}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        hospital?.isFavorite
                                          ? "fill-red-500 text-red-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {hospital?.isFavorite
                                    ? "Retirer des favoris"
                                    : "Ajouter aux favoris"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{hospital.address}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hospital.specialties.slice(0, 4).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hospital.specialties.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totalCount > limit && (
                <Pagination className="mt-6 justify-center">
                  <PaginationContent className="flex-wrap gap-2 sm:gap-0">
                    {/* Previous Button */}
                    <PaginationItem className="cursor-pointer">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded-md border text-sm ${
                          page === 1 ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        Précédent
                      </button>
                    </PaginationItem>

                    {/* Pagination numbers (hidden on small screens) */}
                    <div className="hidden sm:flex">
                      {getPaginationRange(
                        page,
                        Math.ceil(totalCount / limit)
                      ).map((p, i) => (
                        <PaginationItem className="cursor-pointer" key={i}>
                          {p === "..." ? (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          ) : (
                            <PaginationLink
                              isActive={page === p}
                              onClick={() => setPage(Number(p))}
                            >
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                    </div>

                    {/* Current page (only visible on small screens) */}
                    <div className="block sm:hidden text-sm px-3 py-1 border rounded-md">
                      Page {page} / {Math.ceil(totalCount / limit)}
                    </div>

                    {/* Next Button */}
                    <PaginationItem className="cursor-pointer">
                      <button
                        onClick={() =>
                          setPage((prev) =>
                            prev < Math.ceil(totalCount / limit)
                              ? prev + 1
                              : prev
                          )
                        }
                        disabled={page >= Math.ceil(totalCount / limit)}
                        className={`px-3 py-1 rounded-md border text-sm ${
                          page >= Math.ceil(totalCount / limit)
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        Suivant
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hospital Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl mx-h-[90vh] p-0">
          <ScrollArea className="h-[90vh] p-6">
            {selectedHospital && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{selectedHospital.name}</DialogTitle>
                    <Badge variant="outline">{selectedHospital.status}</Badge>
                  </div>
                  <DialogDescription>
                    <div className="flex items-center mt-2">
                      <StarRating rating={selectedHospital.rating} />
                      <span className="ml-2 text-sm">
                        {selectedHospital.reviewCount} avis
                      </span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
                      <img
                        src={selectedHospital.image || "/placeholder.svg"}
                        alt={selectedHospital.name}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => makeHospitalFavorite(selectedHospital)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            selectedHospital?.isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>

                    <Tabs defaultValue="info" className="mt-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info">Informations</TabsTrigger>
                        <TabsTrigger value="specialties">
                          Spécialités
                        </TabsTrigger>
                        <TabsTrigger value="reviews">Avis</TabsTrigger>
                      </TabsList>
                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">À propos</h4>
                          <p className="text-sm">
                            {selectedHospital.description}
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Coordonnées
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                                <span className="text-sm">
                                  {selectedHospital.address}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                                <span className="text-sm">
                                  {selectedHospital.phone}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                                <a
                                  href={selectedHospital.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  Site web
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="specialties" className="mt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {selectedHospital.specialties.map((specialty) => (
                            <div
                              key={specialty}
                              className="flex items-center rounded-lg border p-3"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Stethoscope className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">
                                  {specialty}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="reviews" className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Avis des patients</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedHospital.reviewCount} avis au total
                            </p>
                          </div>
                          <StarRating rating={selectedHospital.rating} />
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            {selectedHospital.ratingDistribution.map((item) => (
                              <div
                                key={item.star}
                                className="flex items-center"
                              >
                                <span className="w-16 text-sm">
                                  {item.star} étoile{item.star > 1 && "s"}
                                </span>
                                <Progress
                                  value={item.percentage}
                                  className="h-2 flex-1 mx-2"
                                />
                                <span className="w-8 text-sm text-right">
                                  {item.percentage}%
                                </span>
                              </div>
                            ))}
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            {selectedHospital.reviews.map((review) => (
                              <div key={review.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        {review.author.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-2">
                                      <p className="text-sm font-medium">
                                        {review.author}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(
                                          new Date(review.date),
                                          "d MMMM yyyy",
                                          { locale: fr }
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-muted text-muted"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm">{review.comment}</p>
                                <Separator />
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium mb-3">
                        Chiffres clés
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-sm">Médecins</span>
                          </div>
                          <span className="font-medium">
                            {selectedHospital.doctors}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing component definition for Globe and Bed
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
