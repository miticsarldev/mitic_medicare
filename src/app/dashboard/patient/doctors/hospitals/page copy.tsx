/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2,
  Calendar,
  Check,
  Filter,
  Heart,
  Locate,
  MapPin,
  Phone,
  Search,
  Share2,
  Star,
  Users,
  Stethoscope,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Progress } from "@/components/ui/progress";

// Sample data for hospitals
const hospitals = [
  {
    id: "h1",
    name: "Hôpital Saint-Louis",
    type: "Hôpital Universitaire",
    address: "1 Avenue Claude Vellefaux, 75010 Paris",
    location: { lat: 48.8748, lng: 2.3684 },
    phone: "01 42 49 49 49",
    website: "https://hopital-saintlouis.aphp.fr",
    rating: 4.2,
    reviewCount: 328,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Cardiologie",
      "Dermatologie",
      "Oncologie",
      "Neurologie",
      "Pédiatrie",
    ],
    services: [
      "Urgences 24/7",
      "Imagerie médicale",
      "Laboratoire d'analyses",
      "Consultations externes",
    ],
    openingHours: {
      monday: "24h/24",
      tuesday: "24h/24",
      wednesday: "24h/24",
      thursday: "24h/24",
      friday: "24h/24",
      saturday: "24h/24",
      sunday: "24h/24",
    },
    insurances: ["CPAM", "MGEN", "Harmonie Mutuelle", "Axa", "Allianz"],
    doctors: 245,
    beds: 650,
    founded: 1607,
    description:
      "L'hôpital Saint-Louis est un hôpital universitaire de l'Assistance publique - Hôpitaux de Paris (AP-HP) situé dans le 10e arrondissement de Paris. Fondé en 1607 par le roi Henri IV, il est spécialisé en hématologie, dermatologie et oncologie.",
    reviews: [
      {
        id: "r1",
        author: "Marie D.",
        rating: 5,
        date: "2024-11-15",
        comment:
          "Excellente prise en charge aux urgences. Personnel attentif et compétent.",
      },
      {
        id: "r2",
        author: "Thomas L.",
        rating: 3,
        date: "2024-10-22",
        comment:
          "Bons médecins mais temps d'attente trop long en consultation externe.",
      },
      {
        id: "r3",
        author: "Sophie M.",
        rating: 4,
        date: "2024-09-30",
        comment:
          "Service de cardiologie remarquable. Équipements modernes et médecins à l'écoute.",
      },
    ],
    isFavorite: true,
    distance: 1.2,
  },
  {
    id: "h2",
    name: "Hôpital Necker-Enfants Malades",
    type: "Hôpital Pédiatrique",
    address: "149 Rue de Sèvres, 75015 Paris",
    location: { lat: 48.8472, lng: 2.3144 },
    phone: "01 44 49 40 00",
    website: "https://hopital-necker.aphp.fr",
    rating: 4.5,
    reviewCount: 412,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Pédiatrie",
      "Chirurgie pédiatrique",
      "Néphrologie",
      "Cardiologie pédiatrique",
    ],
    services: [
      "Urgences pédiatriques",
      "Transplantation",
      "Maladies rares",
      "Imagerie pédiatrique",
    ],
    openingHours: {
      monday: "24h/24",
      tuesday: "24h/24",
      wednesday: "24h/24",
      thursday: "24h/24",
      friday: "24h/24",
      saturday: "24h/24",
      sunday: "24h/24",
    },
    insurances: [
      "CPAM",
      "MGEN",
      "Harmonie Mutuelle",
      "Axa",
      "Allianz",
      "Swiss Life",
    ],
    doctors: 320,
    beds: 500,
    founded: 1778,
    description:
      "L'hôpital Necker-Enfants malades est un hôpital universitaire de l'Assistance publique - Hôpitaux de Paris, situé dans le 15e arrondissement de Paris. C'est le premier hôpital pédiatrique au monde, fondé en 1778.",
    reviews: [
      {
        id: "r4",
        author: "Julie B.",
        rating: 5,
        date: "2024-11-10",
        comment:
          "Équipe pédiatrique exceptionnelle. Ma fille a été parfaitement prise en charge.",
      },
      {
        id: "r5",
        author: "Marc P.",
        rating: 4,
        date: "2024-10-05",
        comment:
          "Service de cardiologie pédiatrique de renommée mondiale. Très satisfait du suivi.",
      },
      {
        id: "r6",
        author: "Camille R.",
        rating: 5,
        date: "2024-09-18",
        comment:
          "Personnel attentionné et environnement adapté aux enfants. Recommande vivement.",
      },
    ],
    isFavorite: false,
    distance: 3.5,
  },
  {
    id: "h3",
    name: "Hôpital Pitié-Salpêtrière",
    type: "Centre Hospitalier Universitaire",
    address: "47-83 Boulevard de l'Hôpital, 75013 Paris",
    location: { lat: 48.8399, lng: 2.3662 },
    phone: "01 42 16 00 00",
    website: "https://pitiesalpetriere.aphp.fr",
    rating: 4.3,
    reviewCount: 567,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Neurologie",
      "Cardiologie",
      "Psychiatrie",
      "Médecine interne",
      "Chirurgie",
    ],
    services: [
      "Urgences 24/7",
      "Neurochirurgie",
      "Transplantation cardiaque",
      "Centre AVC",
    ],
    openingHours: {
      monday: "24h/24",
      tuesday: "24h/24",
      wednesday: "24h/24",
      thursday: "24h/24",
      friday: "24h/24",
      saturday: "24h/24",
      sunday: "24h/24",
    },
    insurances: [
      "CPAM",
      "MGEN",
      "Harmonie Mutuelle",
      "Axa",
      "Allianz",
      "Generali",
    ],
    doctors: 780,
    beds: 1600,
    founded: 1656,
    description:
      "L'hôpital de la Pitié-Salpêtrière est un hôpital universitaire de l'Assistance publique - Hôpitaux de Paris, situé dans le 13e arrondissement de Paris. C'est l'un des plus grands hôpitaux d'Europe, avec une expertise reconnue en neurologie et cardiologie.",
    reviews: [
      {
        id: "r7",
        author: "Pierre D.",
        rating: 4,
        date: "2024-11-20",
        comment:
          "Service de neurologie excellent. Médecins experts et à l'écoute.",
      },
      {
        id: "r8",
        author: "Isabelle M.",
        rating: 3,
        date: "2024-10-15",
        comment:
          "Qualité des soins impeccable mais organisation administrative à améliorer.",
      },
      {
        id: "r9",
        author: "Laurent K.",
        rating: 5,
        date: "2024-09-25",
        comment:
          "Prise en charge exceptionnelle en cardiologie. Je dois ma vie à cette équipe.",
      },
    ],
    isFavorite: true,
    distance: 4.8,
  },
  {
    id: "h4",
    name: "Hôpital Européen Georges-Pompidou",
    type: "Hôpital Général",
    address: "20 Rue Leblanc, 75015 Paris",
    location: { lat: 48.8372, lng: 2.2751 },
    phone: "01 56 09 20 00",
    website: "https://hegp.aphp.fr",
    rating: 4.4,
    reviewCount: 289,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Cardiologie",
      "Cancérologie",
      "Néphrologie",
      "Urologie",
      "Vasculaire",
    ],
    services: [
      "Urgences 24/7",
      "Chirurgie robotique",
      "Transplantation rénale",
      "Radiothérapie",
    ],
    openingHours: {
      monday: "24h/24",
      tuesday: "24h/24",
      wednesday: "24h/24",
      thursday: "24h/24",
      friday: "24h/24",
      saturday: "24h/24",
      sunday: "24h/24",
    },
    insurances: [
      "CPAM",
      "MGEN",
      "Harmonie Mutuelle",
      "Axa",
      "Allianz",
      "Malakoff Médéric",
    ],
    doctors: 420,
    beds: 800,
    founded: 2000,
    description:
      "L'Hôpital européen Georges-Pompidou (HEGP) est un hôpital universitaire de l'Assistance publique - Hôpitaux de Paris, situé dans le 15e arrondissement de Paris. Inauguré en 2000, c'est l'un des hôpitaux les plus modernes d'Europe.",
    reviews: [
      {
        id: "r10",
        author: "François L.",
        rating: 5,
        date: "2024-11-05",
        comment:
          "Hôpital ultra-moderne avec des équipements de pointe. Service impeccable.",
      },
      {
        id: "r11",
        author: "Nathalie P.",
        rating: 4,
        date: "2024-10-12",
        comment:
          "Excellente prise en charge en cancérologie. Équipe pluridisciplinaire très compétente.",
      },
      {
        id: "r12",
        author: "Antoine S.",
        rating: 4,
        date: "2024-09-08",
        comment:
          "Service de cardiologie remarquable. Suivi personnalisé et médecins disponibles.",
      },
    ],
    isFavorite: false,
    distance: 5.3,
  },
  {
    id: "h5",
    name: "Hôpital Cochin",
    type: "Centre Hospitalier Universitaire",
    address: "27 Rue du Faubourg Saint-Jacques, 75014 Paris",
    location: { lat: 48.8361, lng: 2.3372 },
    phone: "01 58 41 41 41",
    website: "https://hopital-cochin.aphp.fr",
    rating: 4.1,
    reviewCount: 342,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Obstétrique",
      "Gynécologie",
      "Endocrinologie",
      "Rhumatologie",
      "Pneumologie",
    ],
    services: [
      "Maternité",
      "Centre du diabète",
      "Procréation médicalement assistée",
      "Médecine interne",
    ],
    openingHours: {
      monday: "24h/24",
      tuesday: "24h/24",
      wednesday: "24h/24",
      thursday: "24h/24",
      friday: "24h/24",
      saturday: "24h/24",
      sunday: "24h/24",
    },
    insurances: [
      "CPAM",
      "MGEN",
      "Harmonie Mutuelle",
      "Axa",
      "Allianz",
      "Groupama",
    ],
    doctors: 380,
    beds: 950,
    founded: 1780,
    description:
      "L'hôpital Cochin est un hôpital universitaire de l'Assistance publique - Hôpitaux de Paris, situé dans le 14e arrondissement de Paris. Il est particulièrement réputé pour sa maternité Port-Royal et ses services d'endocrinologie et de rhumatologie.",
    reviews: [
      {
        id: "r13",
        author: "Émilie T.",
        rating: 5,
        date: "2024-11-18",
        comment:
          "Excellente prise en charge à la maternité. Équipe bienveillante et professionnelle.",
      },
      {
        id: "r14",
        author: "Julien M.",
        rating: 3,
        date: "2024-10-20",
        comment:
          "Bons médecins mais locaux vieillissants dans certains services.",
      },
      {
        id: "r15",
        author: "Caroline B.",
        rating: 4,
        date: "2024-09-15",
        comment:
          "Service d'endocrinologie de qualité. Suivi rigoureux et personnalisé.",
      },
    ],
    isFavorite: false,
    distance: 2.9,
  },
  {
    id: "h6",
    name: "Clinique des Champs-Élysées",
    type: "Clinique Privée",
    address: "15 Avenue des Champs-Élysées, 75008 Paris",
    location: { lat: 48.8698, lng: 2.3075 },
    phone: "01 53 93 03 03",
    website: "https://www.cliniquedeschampselysees.com",
    rating: 4.7,
    reviewCount: 215,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Dermatologie",
      "Chirurgie esthétique",
      "Médecine esthétique",
      "Laser",
    ],
    services: [
      "Consultations spécialisées",
      "Injections",
      "Traitements laser",
      "Chirurgie ambulatoire",
    ],
    openingHours: {
      monday: "9h00-19h00",
      tuesday: "9h00-19h00",
      wednesday: "9h00-19h00",
      thursday: "9h00-19h00",
      friday: "9h00-19h00",
      saturday: "9h00-17h00",
      sunday: "Fermé",
    },
    insurances: ["CPAM", "Axa", "Allianz", "Swiss Life", "Generali"],
    doctors: 25,
    beds: 15,
    founded: 1998,
    description:
      "La Clinique des Champs-Élysées est un établissement privé spécialisé en dermatologie et médecine esthétique, situé dans le prestigieux 8e arrondissement de Paris. Elle propose des traitements innovants réalisés par des médecins experts.",
    reviews: [
      {
        id: "r16",
        author: "Sophie V.",
        rating: 5,
        date: "2024-11-22",
        comment:
          "Prestations haut de gamme et résultats impeccables. Équipe très professionnelle.",
      },
      {
        id: "r17",
        author: "Michel P.",
        rating: 4,
        date: "2024-10-18",
        comment:
          "Excellent suivi et conseils personnalisés. Prix élevés mais qualité au rendez-vous.",
      },
      {
        id: "r18",
        author: "Anne L.",
        rating: 5,
        date: "2024-09-05",
        comment:
          "Médecins experts et cadre luxueux. Très satisfaite de mon traitement.",
      },
    ],
    isFavorite: true,
    distance: 1.8,
  },
  {
    id: "h7",
    name: "Centre Médical Montparnasse",
    type: "Centre Médical",
    address: "22 Rue du Départ, 75014 Paris",
    location: { lat: 48.8422, lng: 2.3229 },
    phone: "01 43 20 90 90",
    website: "https://www.centremedicalmontparnasse.fr",
    rating: 4.0,
    reviewCount: 178,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Médecine générale",
      "Ophtalmologie",
      "Dentaire",
      "Radiologie",
      "ORL",
    ],
    services: [
      "Consultations",
      "Analyses médicales",
      "Radiographie",
      "Échographie",
    ],
    openingHours: {
      monday: "8h00-20h00",
      tuesday: "8h00-20h00",
      wednesday: "8h00-20h00",
      thursday: "8h00-20h00",
      friday: "8h00-20h00",
      saturday: "8h00-18h00",
      sunday: "Fermé",
    },
    insurances: ["CPAM", "MGEN", "Harmonie Mutuelle", "Axa", "Allianz"],
    doctors: 45,
    beds: 0,
    founded: 1985,
    description:
      "Le Centre Médical Montparnasse est un établissement pluridisciplinaire situé au cœur de Paris. Il regroupe des médecins généralistes et spécialistes, ainsi qu'un laboratoire d'analyses médicales et un centre d'imagerie.",
    reviews: [
      {
        id: "r19",
        author: "Paul M.",
        rating: 4,
        date: "2024-11-12",
        comment:
          "Centre bien organisé avec de nombreuses spécialités. Pratique pour faire plusieurs examens au même endroit.",
      },
      {
        id: "r20",
        author: "Lucie D.",
        rating: 3,
        date: "2024-10-25",
        comment:
          "Médecins compétents mais délais d'attente parfois longs pour certaines spécialités.",
      },
      {
        id: "r21",
        author: "Thierry N.",
        rating: 5,
        date: "2024-09-20",
        comment:
          "Service d'ophtalmologie excellent. Matériel moderne et médecin très pédagogue.",
      },
    ],
    isFavorite: false,
    distance: 3.2,
  },
  {
    id: "h8",
    name: "Clinique Internationale du Parc Monceau",
    type: "Clinique Privée",
    address: "21 Rue de Chazelles, 75017 Paris",
    location: { lat: 48.8794, lng: 2.3065 },
    phone: "01 47 63 01 01",
    website: "https://www.clinique-parc-monceau.com",
    rating: 4.6,
    reviewCount: 203,
    image: "/placeholder.svg?height=200&width=400",
    specialties: [
      "Chirurgie orthopédique",
      "Chirurgie digestive",
      "Ophtalmologie",
      "Urologie",
    ],
    services: [
      "Bloc opératoire",
      "Hospitalisation",
      "Consultations",
      "Imagerie médicale",
    ],
    openingHours: {
      monday: "24h/24",
      tuesday: "24h/24",
      wednesday: "24h/24",
      thursday: "24h/24",
      friday: "24h/24",
      saturday: "24h/24",
      sunday: "24h/24",
    },
    insurances: [
      "CPAM",
      "MGEN",
      "Harmonie Mutuelle",
      "Axa",
      "Allianz",
      "Swiss Life",
    ],
    doctors: 60,
    beds: 85,
    founded: 1974,
    description:
      "La Clinique Internationale du Parc Monceau est un établissement privé situé dans le 17e arrondissement de Paris. Spécialisée en chirurgie, elle dispose d'équipements de pointe et d'une équipe médicale expérimentée.",
    reviews: [
      {
        id: "r22",
        author: "Bernard L.",
        rating: 5,
        date: "2024-11-08",
        comment:
          "Excellente prise en charge pour ma chirurgie du genou. Équipe attentionnée et compétente.",
      },
      {
        id: "r23",
        author: "Sylvie P.",
        rating: 4,
        date: "2024-10-14",
        comment:
          "Chambres confortables et personnel soignant disponible. Bonne expérience globale.",
      },
      {
        id: "r24",
        author: "Gérard M.",
        rating: 5,
        date: "2024-09-28",
        comment:
          "Chirurgiens de haut niveau et suivi post-opératoire rigoureux. Très satisfait.",
      },
    ],
    isFavorite: false,
    distance: 2.5,
  },
];

// Sample data for specialties
const specialties = [
  "Cardiologie",
  "Dermatologie",
  "Oncologie",
  "Neurologie",
  "Pédiatrie",
  "Chirurgie",
  "Ophtalmologie",
  "Gynécologie",
  "Obstétrique",
  "Endocrinologie",
  "Rhumatologie",
  "Pneumologie",
  "Néphrologie",
  "Urologie",
  "ORL",
  "Psychiatrie",
  "Médecine interne",
  "Médecine générale",
  "Chirurgie esthétique",
  "Médecine esthétique",
];

// Sample data for insurance providers
const insuranceProviders = [
  "CPAM",
  "MGEN",
  "Harmonie Mutuelle",
  "Axa",
  "Allianz",
  "Swiss Life",
  "Generali",
  "Malakoff Médéric",
  "Groupama",
];

// Sample data for hospital types
const hospitalTypes = [
  "Hôpital Universitaire",
  "Hôpital Général",
  "Clinique Privée",
  "Centre Médical",
  "Hôpital Pédiatrique",
  "Centre Hospitalier Universitaire",
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

export default function HospitalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<
    (typeof hospitals)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "name">(
    "rating"
  );
  const [favorites, setFavorites] = useState<string[]>(
    hospitals.filter((h) => h.isFavorite).map((h) => h.id)
  );

  // Filter hospitals based on search, specialties, insurances, and types
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      searchQuery === "" ||
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSpecialties =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.some((s) => hospital.specialties.includes(s));

    const matchesInsurances =
      selectedInsurances.length === 0 ||
      selectedInsurances.some((i) => hospital.insurances.includes(i));

    const matchesTypes =
      selectedTypes.length === 0 || selectedTypes.includes(hospital.type);

    return (
      matchesSearch && matchesSpecialties && matchesInsurances && matchesTypes
    );
  });

  // Sort hospitals based on selected sort option
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "distance") {
      return a.distance - b.distance;
    } else {
      return a.name.localeCompare(b.name);
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

  // Toggle insurance selection
  const toggleInsurance = (insurance: string) => {
    if (selectedInsurances.includes(insurance)) {
      setSelectedInsurances(selectedInsurances.filter((i) => i !== insurance));
    } else {
      setSelectedInsurances([...selectedInsurances, insurance]);
    }
  };

  // Toggle type selection
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialties([]);
    setSelectedInsurances([]);
    setSelectedTypes([]);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Centres Médicaux
          </h2>
          <p className="text-muted-foreground">
            Trouvez des hôpitaux, cliniques et centres médicaux près de chez
            vous
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
              <SelectItem value="rating">Meilleure note</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
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
                    placeholder="Nom, adresse, spécialité..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type d&apos;établissement
                </label>
                <div className="space-y-1.5">
                  {hospitalTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
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

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Assurances acceptées
                </label>
                <div className="space-y-1.5">
                  {insuranceProviders.map((insurance) => (
                    <div
                      key={insurance}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`insurance-${insurance}`}
                        checked={selectedInsurances.includes(insurance)}
                        onCheckedChange={() => toggleInsurance(insurance)}
                      />
                      <label
                        htmlFor={`insurance-${insurance}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {insurance}
                      </label>
                    </div>
                  ))}
                </div>
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
              <CardTitle>Carte</CardTitle>
              <CardDescription>Établissements à proximité</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[300px] bg-muted rounded-md overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Carte interactive
                    </p>
                  </div>
                </div>
                {/* Map would be rendered here in a real application */}
                <div className="absolute bottom-3 right-3">
                  <Button size="sm" variant="secondary" className="h-8">
                    <Locate className="mr-2 h-3.5 w-3.5" />
                    Ma position
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Établissements médicaux</CardTitle>
                <CardDescription>
                  {filteredHospitals.length} établissement
                  {filteredHospitals.length !== 1 ? "s" : ""} trouvé
                  {filteredHospitals.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedHospitals.length === 0 ? (
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
                  {sortedHospitals.map((hospital) => (
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
                                    toggleFavorite(hospital.id);
                                  }}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      favorites.includes(hospital.id)
                                        ? "fill-red-500 text-red-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {favorites.includes(hospital.id)
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
                            {hospital.type}
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
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          <Locate className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {hospital.distance} km
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedHospitals.map((hospital) => (
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
                                {hospital.type}
                              </Badge>
                              <StarRating rating={hospital.rating} />
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({hospital.reviewCount})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-sm">
                              <Locate className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {hospital.distance} km
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
                                      toggleFavorite(hospital.id);
                                    }}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        favorites.includes(hospital.id)
                                          ? "fill-red-500 text-red-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {favorites.includes(hospital.id)
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hospital Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedHospital && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedHospital.name}</DialogTitle>
                  <Badge variant="outline">{selectedHospital.type}</Badge>
                </div>
                <DialogDescription>
                  <div className="flex items-center mt-2">
                    <StarRating rating={selectedHospital.rating} />
                    <span className="ml-2 text-sm">
                      {selectedHospital.reviewCount} avis
                    </span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Locate className="mr-1 h-3 w-3" />
                      <span>{selectedHospital.distance} km</span>
                    </div>
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
                      onClick={() => toggleFavorite(selectedHospital.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(selectedHospital.id)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>

                  <Tabs defaultValue="info" className="mt-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="info">Informations</TabsTrigger>
                      <TabsTrigger value="specialties">Spécialités</TabsTrigger>
                      <TabsTrigger value="services">Services</TabsTrigger>
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

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Horaires d&apos;ouverture
                          </h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Lundi</span>
                              <span>
                                {selectedHospital.openingHours.monday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Mardi</span>
                              <span>
                                {selectedHospital.openingHours.tuesday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Mercredi</span>
                              <span>
                                {selectedHospital.openingHours.wednesday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Jeudi</span>
                              <span>
                                {selectedHospital.openingHours.thursday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Vendredi</span>
                              <span>
                                {selectedHospital.openingHours.friday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Samedi</span>
                              <span>
                                {selectedHospital.openingHours.saturday}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Dimanche</span>
                              <span>
                                {selectedHospital.openingHours.sunday}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Assurances acceptées
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedHospital.insurances.map((insurance) => (
                            <Badge key={insurance} variant="secondary">
                              {insurance}
                            </Badge>
                          ))}
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
                              <p className="text-sm font-medium">{specialty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="services" className="mt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedHospital.services.map((service) => (
                          <div
                            key={service}
                            className="flex items-center rounded-lg border p-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{service}</p>
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
                          <div className="flex items-center">
                            <span className="w-16 text-sm">5 étoiles</span>
                            <Progress value={70} className="h-2 flex-1 mx-2" />
                            <span className="w-8 text-sm text-right">70%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-16 text-sm">4 étoiles</span>
                            <Progress value={20} className="h-2 flex-1 mx-2" />
                            <span className="w-8 text-sm text-right">20%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-16 text-sm">3 étoiles</span>
                            <Progress value={7} className="h-2 flex-1 mx-2" />
                            <span className="w-8 text-sm text-right">7%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-16 text-sm">2 étoiles</span>
                            <Progress value={2} className="h-2 flex-1 mx-2" />
                            <span className="w-8 text-sm text-right">2%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-16 text-sm">1 étoile</span>
                            <Progress value={1} className="h-2 flex-1 mx-2" />
                            <span className="w-8 text-sm text-right">1%</span>
                          </div>
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
                    <h4 className="text-sm font-medium mb-3">Chiffres clés</h4>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BedIcon className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">Lits</span>
                        </div>
                        <span className="font-medium">
                          {selectedHospital.beds}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">Fondé en</span>
                        </div>
                        <span className="font-medium">
                          {selectedHospital.founded}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-3">Localisation</h4>
                    <div className="relative h-[200px] bg-muted rounded-md overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                      {/* Map would be rendered here in a real application */}
                    </div>
                    <div className="mt-3 flex items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm">
                        {selectedHospital.address}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {selectedHospital.distance} km de votre position
                      </span>
                      <Button variant="outline" size="sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        Itinéraire
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button>
                      <Phone className="mr-2 h-4 w-4" /> Appeler
                    </Button>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" /> Prendre rendez-vous
                    </Button>
                    <Button variant="outline">
                      <Share2 className="mr-2 h-4 w-4" /> Partager
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Drawer for Mobile */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtres</DrawerTitle>
            <DrawerDescription>
              Affinez votre recherche d&apos;établissements médicaux
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
                    placeholder="Nom, adresse, spécialité..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type d&apos;établissement
                </label>
                <div className="space-y-1.5">
                  {hospitalTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <label
                        htmlFor={`mobile-type-${type}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
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

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Assurances acceptées
                </label>
                <div className="space-y-1.5">
                  {insuranceProviders.map((insurance) => (
                    <div
                      key={insurance}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-insurance-${insurance}`}
                        checked={selectedInsurances.includes(insurance)}
                        onCheckedChange={() => toggleInsurance(insurance)}
                      />
                      <label
                        htmlFor={`mobile-insurance-${insurance}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {insurance}
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

const BedIcon = ({ className }: { className?: string }) => {
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
      <path d="M2 4v16" />
      <path d="M22 4v16" />
      <path d="M2 8h20" />
      <path d="M2 16h20" />
      <path d="M4 12h16" />
    </svg>
  );
};
