"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Award,
  Calendar,
  Check,
  Heart,
  MapPin,
  Phone,
  Search,
  Star,
  ThumbsUp,
  User,
  Users,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { UserGenre } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import {
  addDoctorToFavoritesDoctors,
  bookAppointment,
  getFavoriteDoctorIds,
  getFavoritesDoctors,
  getFavoritesSpecializationOptions,
  getSpecializationOptions,
  removeDoctorToFavoritesDoctors,
  searchDoctors,
  submitDoctorReview,
} from "../../actions";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  gender: "MALE" | "FEMALE";
  hospital: string;
  address: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  consultationFee: number;
  isFavorite: boolean;
  videoConsultation?: boolean;
  homeVisit?: boolean;
  isIndependant: boolean;
  availability: {
    nextAvailable: string | null;
    slots: {
      date: string; // format: "YYYY-MM-DD"
      times: string[]; // format: "HH:mm"
    }[];
  };
  reviews: {
    id: string;
    author: string;
    date: string;
    rating: number;
    comment: string;
  }[];
  // Optional extras
  phone?: string;
  services?: string[];
  education?:
    | {
        degree: string;
        institution: string;
        year: number;
      }[]
    | string[];
  acceptsInsurance?: boolean;
  insuranceNetworks?: string[];
  distance?: number;
  bio?: string;
}

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

// Helper function to get star rating display
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function DoctorSearchPage() {
  const { toast } = useToast();
  const router = useRouter();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [sortBy, setSortBy] = useState("rating");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [favoriteDoctorIds, setFavoriteDoctorIds] = useState<Set<string>>(
    new Set()
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDoctorDetailOpen, setIsDoctorDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [specialties, setSpecialties] = useState<
    { label: string; value: string }[]
  >([]);

  // Fetch doctors on component mount and when filters change
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setDoctors([]);

        if (showFavoritesOnly) {
          const [specialtiesData, rawData] = await Promise.all([
            getFavoritesSpecializationOptions(),
            getFavoritesDoctors({
              query: searchQuery,
              specialty: selectedSpecialty,
              gender: selectedGender,
              minRating: minRating[0],
              sortBy,
              page,
              limit,
            }),
          ]);

          // Set des spécialités
          setSpecialties(specialtiesData);

          // Mise en forme des docteurs
          const data = Array.isArray(rawData)
            ? []
            : rawData.data.map((doctor) => ({
                ...doctor,
                experience:
                  typeof doctor.experience === "string"
                    ? parseFloat(doctor.experience)
                    : doctor.experience,
                reviews: doctor.reviews.map((review) => ({
                  ...review,
                  date: review.date,
                })),
              }));

          setDoctors(data);
          setTotalCount(Array.isArray(rawData) ? 0 : rawData.total);
        } else {
          // Récupère en parallèle
          const [favorites, specialtiesData, rawData] = await Promise.all([
            getFavoriteDoctorIds(),
            getSpecializationOptions(),
            searchDoctors({
              query: searchQuery,
              specialty: selectedSpecialty,
              gender: selectedGender,
              minRating: minRating[0],
              sortBy,
              page,
              limit,
            }),
          ]);

          // Set des spécialités
          setSpecialties(specialtiesData);

          // Set des favoris
          const favSet = new Set(favorites);
          setFavoriteDoctorIds(favSet);

          // Mise en forme des docteurs
          const data = Array.isArray(rawData)
            ? []
            : rawData.data.map((doctor) => ({
                ...doctor,
                experience:
                  typeof doctor.experience === "string"
                    ? parseFloat(doctor.experience)
                    : doctor.experience,
                isFavorite: favSet.has(doctor.id),
                reviews: doctor.reviews.map((review) => ({
                  ...review,
                  date: review.date,
                })),
              }));

          setDoctors(data);
          setTotalCount(Array.isArray(rawData) ? 0 : rawData.total);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [
    searchQuery,
    selectedSpecialty,
    selectedGender,
    minRating,
    sortBy,
    toast,
    limit,
    page,
    showFavoritesOnly,
  ]);

  useEffect(() => {
    setPage(1);
  }, [showFavoritesOnly]);

  // Open doctor detail dialog
  const openDoctorDetail = async (doctor: Doctor) => {
    try {
      setSelectedDoctor(doctor);
      setIsDoctorDetailOpen(true);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch doctor details. Please try again.",
      });
    }
  };

  // Format date string
  const formatDate = (date: string | Date) => {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(parsedDate)) {
      return "Date invalide";
    }

    return format(parsedDate, "d MMMM yyyy", { locale: fr });
  };

  const makeDoctorFavorite = async (doctor: Doctor) => {
    try {
      const isFav = favoriteDoctorIds.has(doctor.id);

      if (isFav) {
        await removeDoctorToFavoritesDoctors({ doctorId: doctor.id });
        favoriteDoctorIds.delete(doctor.id);
      } else {
        await addDoctorToFavoritesDoctors({ doctorId: doctor.id });
        favoriteDoctorIds.add(doctor.id);
      }

      // Mise à jour local de la liste
      setFavoriteDoctorIds(new Set(favoriteDoctorIds));
      setSelectedDoctor((prev) =>
        prev ? { ...prev, isFavorite: !isFav } : prev
      );

      // Mise à jour aussi dans la liste (si tu veux)
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? { ...d, isFavorite: !isFav } : d))
      );

      toast({
        title: !isFav ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${doctor.name} a bien été ${!isFav ? "ajouté à" : "retiré de"} vos favoris.`,
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris.",
      });
    }
  };

  // Submit a review for a doctor
  const submitReview = async () => {
    if (!selectedDoctor) return;

    try {
      await submitDoctorReview({
        doctorId: selectedDoctor.id,
        rating: reviewRating,
        comment: reviewComment,
        isAnonymous,
        title: "Avis sur le médecin",
      });

      toast({
        title: "Avis envoyé",
        description: "Merci pour votre avis. Il sera publié après modération.",
      });

      setIsReviewDialogOpen(false);
      setReviewRating(5);
      setReviewComment("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit review. Please try again.",
      });
    }
  };

  const handleBookingSubmit = async () => {
    if (
      !selectedDoctor?.id ||
      !selectedSlot?.date ||
      !selectedSlot?.time ||
      !reason.trim()
    ) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("doctorId", selectedDoctor.id);
    formData.append("scheduledDate", selectedSlot.date);
    formData.append("scheduledTime", selectedSlot.time);
    formData.append("reason", reason);

    try {
      await bookAppointment(formData);
      toast({
        title: "Rendez-vous confirmé",
        description: `Le rendez-vous avec ${selectedDoctor?.name} est confirmé.`,
      });
      setIsBookingDialogOpen(false);
      router.push("/dashboard/patient/appointments/all");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Rechercher un Médecin
          </h2>
          <p className="text-muted-foreground">
            Trouvez le médecin idéal pour vos besoins de santé
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un médecin, une spécialité, un lieu..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={selectedSpecialty}
            onValueChange={setSelectedSpecialty}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les spécialités</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Meilleure note</SelectItem>
              <SelectItem value="experience">Expérience</SelectItem>
              <SelectItem value="availability">Disponibilité</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-10 w-10"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-10 w-10"
            >
              <User className="h-4 w-4" />
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {doctors?.length} médecin{doctors?.length !== 1 ? "s" : ""} trouvé
          {doctors?.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center space-x-2">
          {selectedSpecialty && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {specialties.find((s) => s.value === selectedSpecialty)?.label}
              <button
                onClick={() => setSelectedSpecialty("")}
                className="ml-1 rounded-full hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedGender && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedGender === "MALE" ? "Homme" : "Femme"}
              <button
                onClick={() => setSelectedGender("")}
                className="ml-1 rounded-full hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardHeader className="p-4 pb-2">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Aucun médecin trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez de modifier vos critères de recherche pour trouver plus de
              résultats.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("");
                setSelectedGender("");
                setMinRating([4]);
              }}
            >
              Réinitialiser tous les filtres
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => openDoctorDetail(doctor)}
            >
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    makeDoctorFavorite(doctor);
                  }}
                  className="absolute right-4 top-4"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      doctor?.isFavorite
                        ? "text-red-500 fill-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
                <div className="flex h-40 items-center justify-center bg-muted">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage
                      src={doctor.avatar || "/placeholder.svg"}
                      alt={doctor.name}
                      className="object-contain"
                    />
                    <AvatarFallback>
                      {doctor.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="p-4 pb-2 text-center">
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                <CardDescription className="flex items-center justify-center">
                  {doctor.specialty}
                </CardDescription>
                <div className="mt-1 flex items-center justify-center">
                  <StarRating rating={doctor.rating} />
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({doctor.reviewCount})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="line-clamp-1">{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Disponibilité:{" "}
                      {doctor.availability.nextAvailable
                        ? `dès le ${formatDate(doctor.availability.nextAvailable)}`
                        : "Non disponible"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{doctor.experience} ans d&apos;expérience</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <Link
                  href={`/dashboard/patient/appointments/book/${doctor.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button size="sm">Prendre RDV</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => openDoctorDetail(doctor)}
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Avatar panel */}
                <div className="sm:w-48 flex-shrink-0 bg-muted">
                  <div className="h-full w-full flex items-center justify-center p-4">
                    <Avatar className="h-32 w-32 border-4 border-background">
                      <AvatarImage
                        src={doctor.avatar || "/placeholder.svg"}
                        alt={doctor.name}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {doctor.name
                          .split(" ")
                          .map((n: string) => n?.[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Info panel */}
                <div className="flex flex-1 flex-col">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <CardDescription>{doctor.specialty}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <StarRating rating={doctor.rating} />
                        <span className="text-xs text-muted-foreground">
                          ({doctor.reviewCount} avis)
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 pt-0">
                    <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          Disponibilité:{" "}
                          {doctor.availability.nextAvailable
                            ? `dès le ${formatDate(doctor.availability.nextAvailable)}`
                            : "Non disponible"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{doctor.experience} ans d&apos;expérience</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/dashboard/patient/appointments/book/${doctor.id}`;
                      }}
                    >
                      Prendre RDV
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
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
              {getPaginationRange(page, Math.ceil(totalCount / limit)).map(
                (p, i) => (
                  <PaginationItem className="cursor-pointer" key={i}>
                    {p === "..." ? (
                      <span className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => setPage(Number(p))}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                )
              )}
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
                    prev < Math.ceil(totalCount / limit) ? prev + 1 : prev
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

      {/* Doctor Detail Dialog */}
      <Dialog open={isDoctorDetailOpen} onOpenChange={setIsDoctorDetailOpen}>
        <DialogContent className="w-[calc(100%-1rem)] sm:max-w-4xl max-h-[90vh] p-0">
          <ScrollArea className="h-[90vh] p-6">
            {selectedDoctor && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-16 w-16 border-4 border-background">
                        <AvatarImage
                          src={selectedDoctor.avatar || "/placeholder.svg"}
                          alt={selectedDoctor.name}
                          className="object-contain"
                        />
                        <AvatarFallback>
                          {selectedDoctor.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <DialogTitle className="text-xl">
                          {selectedDoctor.name}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                          {selectedDoctor.specialty}
                        </p>
                        <p className="text-sm text-card-foreground">
                          {selectedDoctor.hospital}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/dashboard/patient/doctors/${selectedDoctor?.id}`}
                        >
                          Voir le profil
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => makeDoctorFavorite(selectedDoctor)}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            selectedDoctor?.isFavorite
                              ? "text-red-500 fill-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <Tabs defaultValue="profile" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="availability">
                      Disponibilités
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                      Avis ({selectedDoctor.reviewCount})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="mt-4">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="md:col-span-2 space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>À propos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{selectedDoctor.bio}</p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium">Spécialité</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedDoctor.specialty}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium">Expérience</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedDoctor.experience} ans
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium">Genre</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedDoctor.gender === UserGenre.MALE
                                    ? "Homme"
                                    : "Femme"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Services</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedDoctor.services &&
                                selectedDoctor.services.map(
                                  (service: string, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <Check className="mr-2 h-4 w-4 text-primary" />
                                      <span>{service}</span>
                                    </div>
                                  )
                                )}
                              {!selectedDoctor.services && (
                                <>
                                  <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                    <span>Consultation générale</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                    <span>Suivi médical</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                    <span>Prescription médicale</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                    <span>Certificat médical</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Formation et parcours</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">Éducation</h4>
                                <div className="mt-2 space-y-2">
                                  {selectedDoctor.education &&
                                    selectedDoctor.education.map(
                                      (
                                        edu:
                                          | {
                                              degree: string;
                                              institution: string;
                                              year: number;
                                            }
                                          | string,
                                        index: number
                                      ) => (
                                        <div
                                          key={index}
                                          className="flex items-start"
                                        >
                                          <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary" />
                                          <div>
                                            <p className="font-medium">
                                              {typeof edu === "string"
                                                ? edu
                                                : edu.degree}
                                            </p>
                                            {typeof edu !== "string" && (
                                              <p className="text-sm text-muted-foreground">
                                                {edu.institution}, {edu.year}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  {!selectedDoctor.education && (
                                    <div className="flex items-start">
                                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary" />
                                      <div>
                                        <p className="font-medium">
                                          Diplôme de médecine
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Faculté de Médecine
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Informations pratiques</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium">Tarifs</h4>
                              <div className="mt-2 flex items-center justify-between">
                                <span>Consultation</span>
                                <span className="font-medium">
                                  {new Intl.NumberFormat("fr-ML", {
                                    style: "currency",
                                    currency: "XOF",
                                    minimumFractionDigits: 0,
                                  }).format(selectedDoctor.consultationFee)}
                                </span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex items-center justify-between">
                                <span>Accepte les mutuelles</span>
                                <span>
                                  {selectedDoctor.acceptsInsurance
                                    ? "Oui"
                                    : "Non"}
                                </span>
                              </div>
                              {selectedDoctor.acceptsInsurance && (
                                <div className="mt-2">
                                  <span className="text-sm text-muted-foreground">
                                    Réseaux acceptés:
                                  </span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {selectedDoctor.insuranceNetworks &&
                                      selectedDoctor.insuranceNetworks.map(
                                        (network: string, index: number) => (
                                          <Badge key={index} variant="outline">
                                            {network}
                                          </Badge>
                                        )
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Modes de consultation
                              </h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>En cabinet</span>
                                  </div>
                                  <Check className="h-4 w-4 text-green-500" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Contact</h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {selectedDoctor.phone || "Non disponible"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{selectedDoctor.address}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <div>
                          <Link
                            href={`/dashboard/patient/appointments/book/${selectedDoctor.id}`}
                            className="w-full mt-4"
                          >
                            <Button className="w-full" size="lg">
                              Prendre RDV
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="availability" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Prochaines disponibilités</CardTitle>
                        <CardDescription>
                          Prochain créneau disponible le Prochain créneau
                          disponible le{" "}
                          {selectedDoctor?.availability?.nextAvailable
                            ? format(
                                new Date(
                                  selectedDoctor.availability.nextAvailable
                                ),
                                "d MMMM yyyy",
                                { locale: fr }
                              )
                            : "N/A"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedDoctor.availability.slots.map(
                            (
                              slot: { date: string; times: string[] },
                              index: number
                            ) => (
                              <div key={index}>
                                <h4 className="font-medium">
                                  {formatDate(slot.date)}
                                </h4>
                                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                                  {slot.times.map(
                                    (time: string, timeIndex: number) => (
                                      <Button
                                        key={timeIndex}
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                          setSelectedSlot({
                                            date: slot.date,
                                            time,
                                          });
                                          setReason("");
                                          setIsBookingDialogOpen(true);
                                        }}
                                      >
                                        {time}
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Avis des patients</CardTitle>
                          <div className="flex items-center">
                            <StarRating rating={selectedDoctor.rating} />
                            <span className="ml-2 text-sm text-muted-foreground">
                              {selectedDoctor.reviewCount} avis
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedDoctor.reviews &&
                            selectedDoctor.reviews.map(
                              (review: {
                                id: string;
                                author: string;
                                date: string;
                                rating: number;
                                comment: string;
                              }) => (
                                <div
                                  key={review.id}
                                  className="rounded-lg border p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                      {review.author}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(review.date)}
                                    </div>
                                  </div>
                                  <div className="mt-1">
                                    <StarRating rating={review.rating} />
                                  </div>
                                  <p className="mt-2 text-sm">
                                    {review.comment}
                                  </p>
                                  <div className="mt-3 flex items-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1"
                                    >
                                      <ThumbsUp className="h-4 w-4" /> Utile
                                    </Button>
                                  </div>
                                </div>
                              )
                            )}
                          {(!selectedDoctor.reviews ||
                            selectedDoctor.reviews.length === 0) && (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                Aucun avis pour le moment
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setIsReviewDialogOpen(true)}
                              >
                                Laisser un avis
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link
                          href={`/dashboard/patient/appointments/book/${selectedDoctor.id}`}
                        >
                          <Button className="w-full" size="lg">
                            Prendre RDV
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le rendez-vous</DialogTitle>
            <DialogDescription>
              {selectedDoctor?.name} –{" "}
              {selectedSlot?.date
                ? format(selectedSlot.date, "d MMMM yyyy", { locale: fr })
                : "Date invalide"}{" "}
              à {selectedSlot?.time}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motif du rendez-vous</label>
            <Textarea
              placeholder="Décrivez brièvement la raison de votre consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Ces informations aideront le médecin à se préparer pour votre
              consultation.
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button disabled={!reason.trim()} onClick={handleBookingSubmit}>
              {isSubmitting ? "Traitement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl  max-h-[90vh] p-0">
          <ScrollArea className="h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>Laisser un avis</DialogTitle>
              <DialogDescription>
                Partagez votre expérience avec {selectedDoctor?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {reviewRating === 1
                    ? "Très insatisfait"
                    : reviewRating === 2
                      ? "Insatisfait"
                      : reviewRating === 3
                        ? "Neutre"
                        : reviewRating === 4
                          ? "Satisfait"
                          : "Très satisfait"}
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Votre commentaire</Label>
                <textarea
                  id="comment"
                  className="w-full rounded-md border p-2"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience avec ce médecin..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Publier anonymement</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={submitReview}>Publier</Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
