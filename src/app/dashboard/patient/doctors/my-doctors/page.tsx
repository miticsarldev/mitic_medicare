"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  FileText,
  Filter,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  Trash2,
  User,
  Video,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Sample data for doctors
const doctors = [
  {
    id: "d1",
    name: "Dr. Sophie Martin",
    specialty: "Médecin Généraliste",
    address: "15 Rue de la Paix, 75002 Paris",
    phone: "01 42 68 53 09",
    email: "sophie.martin@example.com",
    image: "/placeholder.svg?height=128&width=128",
    rating: 4.8,
    reviewCount: 124,
    isFavorite: true,
    lastVisit: "2024-02-15",
    nextAppointment: "2024-03-20T14:30:00",
    consultations: [
      {
        id: "c1",
        date: "2024-02-15",
        type: "Consultation",
        reason: "Contrôle annuel",
        notes: "Tension artérielle normale, analyses sanguines prescrites.",
      },
      {
        id: "c2",
        date: "2023-11-03",
        type: "Consultation",
        reason: "Rhume",
        notes: "Prescription de paracétamol et repos recommandé.",
      },
      {
        id: "c3",
        date: "2023-07-22",
        type: "Téléconsultation",
        reason: "Renouvellement ordonnance",
        notes: "Renouvellement pour 3 mois.",
      },
    ],
    prescriptions: [
      {
        id: "p1",
        date: "2024-02-15",
        medications: ["Doliprane 1000mg", "Vitamine D"],
        duration: "1 mois",
      },
      {
        id: "p2",
        date: "2023-11-03",
        medications: ["Paracétamol 500mg", "Spray nasal"],
        duration: "5 jours",
      },
      {
        id: "p3",
        date: "2023-07-22",
        medications: ["Levothyrox 50µg"],
        duration: "3 mois",
      },
    ],
    availability: {
      monday: "9h00-17h00",
      tuesday: "9h00-17h00",
      wednesday: "9h00-12h00",
      thursday: "9h00-17h00",
      friday: "9h00-17h00",
      saturday: "Fermé",
      sunday: "Fermé",
    },
    languages: ["Français", "Anglais"],
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Descartes",
        year: 2010,
      },
      {
        degree: "Spécialisation en Médecine Générale",
        institution: "Hôpital Necker",
        year: 2013,
      },
    ],
    acceptsNewPatients: true,
    acceptsInsurance: ["CPAM", "MGEN", "Allianz"],
  },
  {
    id: "d2",
    name: "Dr. Thomas Dubois",
    specialty: "Cardiologue",
    address: "8 Boulevard Haussmann, 75009 Paris",
    phone: "01 45 26 78 90",
    email: "thomas.dubois@example.com",
    image: "/placeholder.svg?height=128&width=128",
    rating: 4.9,
    reviewCount: 87,
    isFavorite: true,
    lastVisit: "2023-12-05",
    nextAppointment: null,
    consultations: [
      {
        id: "c4",
        date: "2023-12-05",
        type: "Consultation",
        reason: "Examen cardiaque annuel",
        notes: "ECG normal, légère hypertension à surveiller.",
      },
      {
        id: "c5",
        date: "2023-06-18",
        type: "Consultation",
        reason: "Douleurs thoraciques",
        notes: "Stress lié au travail, exercices de relaxation recommandés.",
      },
    ],
    prescriptions: [
      {
        id: "p4",
        date: "2023-12-05",
        medications: ["Perindopril 5mg"],
        duration: "6 mois",
      },
      {
        id: "p5",
        date: "2023-06-18",
        medications: ["Magnésium", "Anxiolytique léger"],
        duration: "1 mois",
      },
    ],
    availability: {
      monday: "8h30-16h30",
      tuesday: "8h30-16h30",
      wednesday: "8h30-16h30",
      thursday: "8h30-16h30",
      friday: "8h30-16h30",
      saturday: "Fermé",
      sunday: "Fermé",
    },
    languages: ["Français", "Allemand"],
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Lyon 1",
        year: 2008,
      },
      {
        degree: "Spécialisation en Cardiologie",
        institution: "Hôpital Pitié-Salpêtrière",
        year: 2013,
      },
    ],
    acceptsNewPatients: false,
    acceptsInsurance: ["CPAM", "MGEN", "Axa", "Swiss Life"],
  },
  {
    id: "d3",
    name: "Dr. Émilie Laurent",
    specialty: "Dermatologue",
    address: "45 Rue Saint-Lazare, 75009 Paris",
    phone: "01 48 74 36 25",
    email: "emilie.laurent@example.com",
    image: "/placeholder.svg?height=128&width=128",
    rating: 4.7,
    reviewCount: 56,
    isFavorite: false,
    lastVisit: "2024-01-20",
    nextAppointment: "2024-07-15T10:15:00",
    consultations: [
      {
        id: "c6",
        date: "2024-01-20",
        type: "Consultation",
        reason: "Examen des grains de beauté",
        notes: "Aucune anomalie détectée, prochain contrôle dans 6 mois.",
      },
      {
        id: "c7",
        date: "2023-08-12",
        type: "Consultation",
        reason: "Eczéma",
        notes: "Prescription de crème corticoïde et conseils d'hydratation.",
      },
    ],
    prescriptions: [
      {
        id: "p6",
        date: "2024-01-20",
        medications: ["Crème hydratante"],
        duration: "Usage quotidien",
      },
      {
        id: "p7",
        date: "2023-08-12",
        medications: ["Dermocorticoïde", "Émollient"],
        duration: "2 semaines",
      },
    ],
    availability: {
      monday: "9h30-18h00",
      tuesday: "9h30-18h00",
      wednesday: "Fermé",
      thursday: "9h30-18h00",
      friday: "9h30-18h00",
      saturday: "9h30-12h00",
      sunday: "Fermé",
    },
    languages: ["Français", "Espagnol"],
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université de Bordeaux",
        year: 2011,
      },
      {
        degree: "Spécialisation en Dermatologie",
        institution: "Hôpital Saint-Louis",
        year: 2015,
      },
    ],
    acceptsNewPatients: true,
    acceptsInsurance: ["CPAM", "MGEN", "Allianz", "Generali"],
  },
  {
    id: "d4",
    name: "Dr. Antoine Moreau",
    specialty: "Ophtalmologue",
    address: "12 Avenue des Gobelins, 75005 Paris",
    phone: "01 43 31 94 87",
    email: "antoine.moreau@example.com",
    image: "/placeholder.svg?height=128&width=128",
    rating: 4.5,
    reviewCount: 92,
    isFavorite: false,
    lastVisit: "2023-09-08",
    nextAppointment: null,
    consultations: [
      {
        id: "c8",
        date: "2023-09-08",
        type: "Consultation",
        reason: "Contrôle de la vue",
        notes: "Légère myopie, renouvellement de lunettes.",
      },
      {
        id: "c9",
        date: "2022-10-15",
        type: "Consultation",
        reason: "Irritation oculaire",
        notes: "Conjonctivite allergique, collyre prescrit.",
      },
    ],
    prescriptions: [
      {
        id: "p8",
        date: "2023-09-08",
        medications: ["Ordonnance lunettes"],
        duration: "2 ans",
      },
      {
        id: "p9",
        date: "2022-10-15",
        medications: ["Collyre anti-allergique"],
        duration: "10 jours",
      },
    ],
    availability: {
      monday: "8h00-19h00",
      tuesday: "8h00-19h00",
      wednesday: "8h00-19h00",
      thursday: "8h00-19h00",
      friday: "8h00-19h00",
      saturday: "8h00-12h00",
      sunday: "Fermé",
    },
    languages: ["Français", "Anglais", "Italien"],
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Diderot",
        year: 2009,
      },
      {
        degree: "Spécialisation en Ophtalmologie",
        institution: "Hôpital des Quinze-Vingts",
        year: 2014,
      },
    ],
    acceptsNewPatients: true,
    acceptsInsurance: ["CPAM", "MGEN", "Axa", "Allianz"],
  },
  {
    id: "d5",
    name: "Dr. Claire Petit",
    specialty: "Gynécologue",
    address: "3 Rue de Sèvres, 75006 Paris",
    phone: "01 45 48 67 32",
    email: "claire.petit@example.com",
    image: "/placeholder.svg?height=128&width=128",
    rating: 4.9,
    reviewCount: 118,
    isFavorite: true,
    lastVisit: "2023-11-28",
    nextAppointment: "2024-05-10T11:00:00",
    consultations: [
      {
        id: "c10",
        date: "2023-11-28",
        type: "Consultation",
        reason: "Examen annuel",
        notes: "Tout est normal, frottis réalisé.",
      },
      {
        id: "c11",
        date: "2023-05-14",
        type: "Consultation",
        reason: "Contraception",
        notes: "Changement de pilule, suivi dans 6 mois.",
      },
    ],
    prescriptions: [
      {
        id: "p10",
        date: "2023-11-28",
        medications: ["Pilule contraceptive"],
        duration: "6 mois",
      },
      {
        id: "p11",
        date: "2023-05-14",
        medications: ["Pilule contraceptive"],
        duration: "6 mois",
      },
    ],
    availability: {
      monday: "9h00-17h30",
      tuesday: "9h00-17h30",
      wednesday: "9h00-17h30",
      thursday: "9h00-17h30",
      friday: "9h00-17h30",
      saturday: "Fermé",
      sunday: "Fermé",
    },
    languages: ["Français", "Anglais"],
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Descartes",
        year: 2007,
      },
      {
        degree: "Spécialisation en Gynécologie",
        institution: "Hôpital Cochin",
        year: 2012,
      },
    ],
    acceptsNewPatients: true,
    acceptsInsurance: ["CPAM", "MGEN", "Axa", "Allianz", "Generali"],
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
  "Dentiste",
  "Kinésithérapeute",
  "Ostéopathe",
  "Nutritionniste",
];

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

// Helper function to format date
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
};

// Helper function to format date and time
const formatDateTime = (dateTimeString: string | null) => {
  if (!dateTimeString) return "Aucun rendez-vous prévu";
  return format(new Date(dateTimeString), "d MMMM yyyy 'à' HH'h'mm", {
    locale: fr,
  });
};

export default function MyDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<
    (typeof doctors)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "lastVisit" | "rating">("name");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(
    doctors.filter((d) => d.isFavorite).map((d) => d.id)
  );
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Filter doctors based on search, specialties, and favorites
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchQuery === "" ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialties =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.includes(doctor.specialty);

    const matchesFavorites =
      !showFavoritesOnly || favorites.includes(doctor.id);

    return matchesSearch && matchesSpecialties && matchesFavorites;
  });

  // Sort doctors based on selected sort option
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "lastVisit") {
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Open doctor detail dialog
  const openDoctorDetail = (doctor: (typeof doctors)[0]) => {
    setSelectedDoctor(doctor);
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialties([]);
    setShowFavoritesOnly(false);
  };

  // Open review dialog
  const openReviewDialog = () => {
    setReviewRating(5);
    setReviewComment("");
    setIsReviewDialogOpen(true);
  };

  // Submit review
  const submitReview = () => {
    // In a real app, this would send the review to the backend
    console.log("Review submitted:", {
      doctor: selectedDoctor?.id,
      rating: reviewRating,
      comment: reviewComment,
    });
    setIsReviewDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mes Médecins</h2>
          <p className="text-muted-foreground">
            Gérez vos médecins, consultez votre historique et prenez rendez-vous
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setIsFilterDrawerOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <Select
            value={sortBy}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Ordre alphabétique</SelectItem>
              <SelectItem value="lastVisit">Dernière visite</SelectItem>
              <SelectItem value="rating">Meilleure note</SelectItem>
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

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
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
                    placeholder="Nom, spécialité, adresse..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favorites-only"
                    checked={showFavoritesOnly}
                    onCheckedChange={() =>
                      setShowFavoritesOnly(!showFavoritesOnly)
                    }
                  />
                  <label
                    htmlFor="favorites-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Afficher uniquement mes favoris
                  </label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Spécialités</label>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-1.5">
                    {specialties.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center space-x-2"
                      >
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

          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Prochains rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctors
                .filter((doctor) => doctor.nextAppointment)
                .sort((a, b) => {
                  const dateA = a.nextAppointment
                    ? new Date(a.nextAppointment).getTime()
                    : Infinity;
                  const dateB = b.nextAppointment
                    ? new Date(b.nextAppointment).getTime()
                    : Infinity;
                  return dateA - dateB;
                })
                .slice(0, 3)
                .map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-start space-x-3 rounded-md border p-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={doctor.image} alt={doctor.name} />
                      <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.specialty}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{formatDateTime(doctor.nextAppointment)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              {doctors.filter((doctor) => doctor.nextAppointment).length ===
                0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-medium">
                    Aucun rendez-vous prévu
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vous n&apos;avez pas de rendez-vous à venir avec vos
                    médecins.
                  </p>
                </div>
              )}
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" /> Voir tous les rendez-vous
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Mes médecins</CardTitle>
                <CardDescription>
                  {filteredDoctors.length} médecin
                  {filteredDoctors.length !== 1 ? "s" : ""} trouvé
                  {filteredDoctors.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <User className="mr-2 h-4 w-4" />
                  Ajouter un médecin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedDoctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Aucun médecin trouvé
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
                  {sortedDoctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                      onClick={() => openDoctorDetail(doctor)}
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback>
                            {doctor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base">
                            {doctor.name}
                          </CardTitle>
                          <CardDescription className="flex items-center">
                            <Badge variant="outline" className="font-normal">
                              {doctor.specialty}
                            </Badge>
                          </CardDescription>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(doctor.id);
                                }}
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    favorites.includes(doctor.id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {favorites.includes(doctor.id)
                                ? "Retirer des favoris"
                                : "Ajouter aux favoris"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span className="truncate">{doctor.address}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <StarRating rating={doctor.rating} />
                          <span className="text-xs text-muted-foreground">
                            {doctor.reviewCount} avis
                          </span>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>
                            Dernière visite: {formatDate(doctor.lastVisit)}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          {doctor.nextAppointment ? (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              Prochain RDV:{" "}
                              {format(
                                new Date(doctor.nextAppointment),
                                "dd/MM/yyyy",
                                { locale: fr }
                              )}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Aucun RDV prévu
                            </span>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle appointment booking
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Prendre rendez-vous</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle messaging
                              }}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Envoyer un message</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle removal
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer"
                      onClick={() => openDoctorDetail(doctor)}
                    >
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{doctor.name}</p>
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className="mr-2 font-normal text-xs"
                              >
                                {doctor.specialty}
                              </Badge>
                              <StarRating rating={doctor.rating} />
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({doctor.reviewCount})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-sm">
                              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(doctor.lastVisit)}
                              </span>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(doctor.id);
                                    }}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        favorites.includes(doctor.id)
                                          ? "fill-red-500 text-red-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {favorites.includes(doctor.id)
                                    ? "Retirer des favoris"
                                    : "Ajouter aux favoris"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle appointment booking
                                  }}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Prendre rendez-vous</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle messaging
                                  }}
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>Envoyer un message</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle removal
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Supprimer</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{doctor.address}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          {doctor.nextAppointment ? (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              Prochain RDV:{" "}
                              {format(
                                new Date(doctor.nextAppointment),
                                "dd/MM/yyyy",
                                { locale: fr }
                              )}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Aucun RDV prévu
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Doctor Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedDoctor.name}</DialogTitle>
                  <Badge variant="outline">{selectedDoctor.specialty}</Badge>
                </div>
                <DialogDescription>
                  <div className="flex items-center mt-2">
                    <StarRating rating={selectedDoctor.rating} />
                    <span className="ml-2 text-sm">
                      {selectedDoctor.reviewCount} avis
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewDialog();
                      }}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      <span className="text-xs">Évaluer</span>
                    </Button>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="info">Informations</TabsTrigger>
                      <TabsTrigger value="consultations">
                        Consultations
                      </TabsTrigger>
                      <TabsTrigger value="prescriptions">
                        Ordonnances
                      </TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 mt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Coordonnées
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm">
                                {selectedDoctor.address}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm">
                                {selectedDoctor.phone}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm">
                                {selectedDoctor.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Horaires de consultation
                          </h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Lundi</span>
                              <span>{selectedDoctor.availability.monday}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Mardi</span>
                              <span>{selectedDoctor.availability.tuesday}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Mercredi</span>
                              <span>
                                {selectedDoctor.availability.wednesday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Jeudi</span>
                              <span>
                                {selectedDoctor.availability.thursday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Vendredi</span>
                              <span>{selectedDoctor.availability.friday}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Samedi</span>
                              <span>
                                {selectedDoctor.availability.saturday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Dimanche</span>
                              <span>{selectedDoctor.availability.sunday}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium mb-2">Formation</h4>
                        <div className="space-y-2">
                          {selectedDoctor.education.map((edu, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                                <FileText className="h-3 w-3 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {edu.degree}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {edu.institution}, {edu.year}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Langues parlées
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedDoctor.languages.map((language) => (
                              <Badge key={language} variant="secondary">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Assurances acceptées
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedDoctor.acceptsInsurance.map(
                              (insurance) => (
                                <Badge key={insurance} variant="secondary">
                                  {insurance}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge
                            variant={
                              selectedDoctor.acceptsNewPatients
                                ? "default"
                                : "destructive"
                            }
                          >
                            {selectedDoctor.acceptsNewPatients
                              ? "Accepte de nouveaux patients"
                              : "N'accepte pas de nouveaux patients"}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFavorite(selectedDoctor.id)}
                        >
                          <Heart
                            className={`mr-2 h-4 w-4 ${
                              favorites.includes(selectedDoctor.id)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                          {favorites.includes(selectedDoctor.id)
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="consultations"
                      className="mt-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Historique des consultations
                        </h4>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Exporter
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {selectedDoctor.consultations.map((consultation) => (
                          <div
                            key={consultation.id}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  {consultation.type}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {formatDate(consultation.date)}
                                </span>
                              </div>
                            </div>
                            <p className="mt-2 text-sm font-medium">
                              Motif: {consultation.reason}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {consultation.notes}
                            </p>
                          </div>
                        ))}
                      </div>

                      {selectedDoctor.consultations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <FileText className="h-8 w-8 text-muted-foreground/50" />
                          <h3 className="mt-2 text-sm font-medium">
                            Aucune consultation
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Vous n&apos;avez pas encore consulté ce médecin.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent
                      value="prescriptions"
                      className="mt-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ordonnances</h4>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Exporter
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {selectedDoctor.prescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {formatDate(prescription.date)}
                              </span>
                              <Badge variant="outline">
                                Durée: {prescription.duration}
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="flex items-center">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                                  <span className="text-sm">{med}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedDoctor.prescriptions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <FileText className="h-8 w-8 text-muted-foreground/50" />
                          <h3 className="mt-2 text-sm font-medium">
                            Aucune ordonnance
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Vous n&apos;avez pas d&apos;ordonnances de ce
                            médecin.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="contact" className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Coordonnées</h4>
                          <div className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm">
                                {selectedDoctor.address}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm">
                                {selectedDoctor.phone}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm">
                                {selectedDoctor.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Envoyer un message
                          </h4>
                          <div className="rounded-lg border p-3 space-y-2">
                            <Textarea
                              placeholder="Votre message..."
                              className="min-h-[100px]"
                            />
                            <Button className="w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Envoyer
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">
                          Options de contact
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Button>
                            <Phone className="mr-2 h-4 w-4" />
                            Appeler
                          </Button>
                          <Button variant="outline">
                            <Video className="mr-2 h-4 w-4" />
                            Téléconsultation
                          </Button>
                          <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Prendre rendez-vous
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Prochain rendez-vous
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedDoctor.nextAppointment ? (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDateTime(selectedDoctor.nextAppointment)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              <Video className="mr-2 h-3 w-3" />
                              Téléconsultation
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Calendar className="mr-2 h-3 w-3" />
                              Modifier
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Aucun rendez-vous prévu
                          </p>
                          <Button className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Prendre rendez-vous
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Dernière visite
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(selectedDoctor.lastVisit)}</span>
                        </div>
                        {selectedDoctor.consultations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">
                              Motif: {selectedDoctor.consultations[0].reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedDoctor.consultations[0].notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Actions rapides
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Prendre rendez-vous
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Envoyer un message
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Demander une ordonnance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Évaluer {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Partagez votre expérience avec ce médecin pour aider d&apos;autres
              patients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Note</Label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className="p-0 h-8 w-8"
                    onClick={() => setReviewRating(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                ))}
                <span className="ml-2 text-sm">{reviewRating}/5</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={submitReview}>Soumettre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer for Mobile */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtres</DrawerTitle>
            <DrawerDescription>
              Affinez votre recherche de médecins
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[50vh]">
            <div className="px-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="mobile-search" className="text-sm font-medium">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile-search"
                    type="search"
                    placeholder="Nom, spécialité, adresse..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile-favorites-only"
                    checked={showFavoritesOnly}
                    onCheckedChange={() =>
                      setShowFavoritesOnly(!showFavoritesOnly)
                    }
                  />
                  <label
                    htmlFor="mobile-favorites-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Afficher uniquement mes favoris
                  </label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Spécialités</label>
                <div className="space-y-1.5">
                  {specialties.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-specialty-${specialty}`}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={() => toggleSpecialty(specialty)}
                      />
                      <label
                        htmlFor={`mobile-specialty-${specialty}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DrawerFooter>
            <Button onClick={() => setIsFilterDrawerOpen(false)}>
              Appliquer les filtres
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
