"use client";

import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Calendar,
  Check,
  //   ChevronDown,
  //   Clock,
  Filter,
  Heart,
  Home,
  //   Info,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Share2,
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
  DialogTrigger,
} from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
// import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Sample data for doctors
const doctorsData = [
  {
    id: "doc-001",
    name: "Dr. Sophie Martin",
    specialty: "Cardiologie",
    subspecialty: "Cardiologie interventionnelle",
    gender: "Femme",
    languages: ["Français", "Anglais", "Espagnol"],
    address: "15 Rue de la Paix, 75002 Paris",
    hospital: "Hôpital Européen Georges-Pompidou",
    distance: 1.2,
    rating: 4.8,
    reviewCount: 124,
    experience: 15,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Descartes",
        year: "2005",
      },
      {
        degree: "Spécialisation en Cardiologie",
        institution: "Hôpital Pitié-Salpêtrière",
        year: "2010",
      },
    ],
    awards: [
      "Prix d'Excellence en Cardiologie 2018",
      "Médaille de l'Innovation Médicale 2020",
    ],
    publications: 23,
    availability: {
      nextAvailable: "2025-03-15",
      slots: [
        { date: "2025-03-15", times: ["09:00", "11:30", "14:00"] },
        { date: "2025-03-16", times: ["10:00", "15:30"] },
        { date: "2025-03-17", times: ["08:30", "13:00", "16:30"] },
      ],
    },
    consultationFee: 80,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "Harmonie Mutuelle", "Allianz"],
    bio: "Cardiologue spécialisée dans le traitement des maladies cardiovasculaires avec une approche centrée sur le patient. Plus de 15 ans d'expérience dans le diagnostic et le traitement des pathologies cardiaques complexes.",
    services: [
      "Échocardiographie",
      "Test d'effort",
      "Holter",
      "Consultation préventive",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: true,
    homeVisit: false,
    reviews: [
      {
        id: "rev-001",
        author: "Marie Dubois",
        rating: 5,
        date: "2024-12-10",
        comment:
          "Excellente cardiologue, très à l'écoute et professionnelle. A pris le temps d'expliquer en détail ma condition et les options de traitement.",
      },
      {
        id: "rev-002",
        author: "Jean Lefebvre",
        rating: 4,
        date: "2024-11-22",
        comment:
          "Très bonne expérience. Diagnostic précis et conseils utiles. Seul bémol : un peu d'attente avant la consultation.",
      },
    ],
  },
  {
    id: "doc-002",
    name: "Dr. Thomas Dubois",
    specialty: "Dermatologie",
    subspecialty: "Dermatologie esthétique",
    gender: "Homme",
    languages: ["Français", "Anglais"],
    address: "8 Avenue Montaigne, 75008 Paris",
    hospital: "Clinique des Champs-Élysées",
    distance: 2.5,
    rating: 4.6,
    reviewCount: 98,
    experience: 12,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Diderot",
        year: "2008",
      },
      {
        degree: "Spécialisation en Dermatologie",
        institution: "Hôpital Saint-Louis",
        year: "2013",
      },
    ],
    awards: ["Prix Jeune Chercheur en Dermatologie 2019"],
    publications: 15,
    availability: {
      nextAvailable: "2025-03-12",
      slots: [
        { date: "2025-03-12", times: ["10:30", "14:30", "16:00"] },
        { date: "2025-03-13", times: ["09:00", "11:30", "15:00"] },
        { date: "2025-03-14", times: ["08:30", "13:30"] },
      ],
    },
    consultationFee: 90,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "Allianz", "AXA"],
    bio: "Dermatologue spécialisé dans les traitements esthétiques et la prise en charge des maladies de peau. Approche holistique combinant médecine conventionnelle et dernières innovations technologiques.",
    services: [
      "Consultation dermatologique",
      "Traitement de l'acné",
      "Dépistage du cancer de la peau",
      "Dermatologie esthétique",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: true,
    homeVisit: false,
    reviews: [
      {
        id: "rev-003",
        author: "Sophie Bernard",
        rating: 5,
        date: "2024-12-05",
        comment:
          "Dr. Dubois a traité mon problème d'acné avec efficacité. Très professionnel et attentif. Je recommande vivement.",
      },
      {
        id: "rev-004",
        author: "Pierre Martin",
        rating: 4,
        date: "2024-11-18",
        comment:
          "Consultation rapide et efficace. Bon suivi post-consultation.",
      },
    ],
  },
  {
    id: "doc-003",
    name: "Dr. Marie Lefevre",
    specialty: "Ophtalmologie",
    subspecialty: "Chirurgie réfractive",
    gender: "Femme",
    languages: ["Français", "Anglais", "Italien"],
    address: "22 Rue du Départ, 75014 Paris",
    hospital: "Centre Médical Montparnasse",
    distance: 3.8,
    rating: 4.9,
    reviewCount: 156,
    experience: 18,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Pierre et Marie Curie",
        year: "2003",
      },
      {
        degree: "Spécialisation en Ophtalmologie",
        institution: "Hôpital des Quinze-Vingts",
        year: "2008",
      },
    ],
    awards: [
      "Prix d'Excellence en Chirurgie Oculaire 2017",
      "Médaille du Mérite Médical 2021",
    ],
    publications: 31,
    availability: {
      nextAvailable: "2025-03-18",
      slots: [
        { date: "2025-03-18", times: ["09:15", "11:45", "14:30"] },
        { date: "2025-03-19", times: ["10:00", "13:00", "16:15"] },
        { date: "2025-03-20", times: ["08:45", "12:30", "15:00"] },
      ],
    },
    consultationFee: 95,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "Harmonie Mutuelle", "Swiss Life"],
    bio: "Ophtalmologue spécialisée en chirurgie réfractive avec plus de 18 ans d'expérience. Expertise dans le traitement de la myopie, l'hypermétropie, l'astigmatisme et la presbytie par laser.",
    services: [
      "Examen de la vue",
      "Chirurgie réfractive",
      "Traitement du glaucome",
      "Chirurgie de la cataracte",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: false,
    homeVisit: false,
    reviews: [
      {
        id: "rev-005",
        author: "Antoine Moreau",
        rating: 5,
        date: "2024-12-15",
        comment:
          "Excellente chirurgienne. Mon opération de la cataracte s'est parfaitement déroulée et le suivi était impeccable.",
      },
      {
        id: "rev-006",
        author: "Claire Petit",
        rating: 5,
        date: "2024-11-30",
        comment:
          "Dr. Lefevre est exceptionnelle. Très professionnelle et rassurante. Je vois parfaitement depuis mon opération.",
      },
    ],
  },
  {
    id: "doc-004",
    name: "Dr. Jean Dupont",
    specialty: "Médecine générale",
    subspecialty: "Médecine préventive",
    gender: "Homme",
    languages: ["Français", "Anglais"],
    address: "8 Rue de la Roquette, 75011 Paris",
    hospital: "Cabinet Médical Bastille",
    distance: 1.8,
    rating: 4.7,
    reviewCount: 210,
    experience: 20,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Descartes",
        year: "2001",
      },
      {
        degree: "Diplôme de Médecine Générale",
        institution: "Faculté de Médecine Paris Descartes",
        year: "2004",
      },
    ],
    awards: ["Prix du Meilleur Médecin Généraliste 2016"],
    publications: 8,
    availability: {
      nextAvailable: "2025-03-10",
      slots: [
        {
          date: "2025-03-10",
          times: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
        },
        {
          date: "2025-03-11",
          times: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
        },
        {
          date: "2025-03-12",
          times: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
        },
      ],
    },
    consultationFee: 30,
    acceptsInsurance: true,
    insuranceNetworks: [
      "MGEN",
      "Harmonie Mutuelle",
      "Allianz",
      "AXA",
      "Swiss Life",
    ],
    bio: "Médecin généraliste avec 20 ans d'expérience, spécialisé en médecine préventive. Approche globale de la santé, prenant en compte les aspects physiques, psychologiques et sociaux du patient.",
    services: [
      "Consultation générale",
      "Bilan de santé",
      "Vaccination",
      "Suivi médical",
      "Certificats médicaux",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: true,
    homeVisit: true,
    reviews: [
      {
        id: "rev-007",
        author: "Lucie Blanc",
        rating: 5,
        date: "2024-12-18",
        comment:
          "Dr. Dupont est un excellent médecin, très humain et à l'écoute. Il prend le temps d'expliquer et de rassurer.",
      },
      {
        id: "rev-008",
        author: "Thomas Rousseau",
        rating: 4,
        date: "2024-12-02",
        comment:
          "Médecin compétent et sympathique. Cabinet bien organisé avec peu d'attente.",
      },
    ],
  },
  {
    id: "doc-005",
    name: "Dr. Isabelle Moreau",
    specialty: "Endocrinologie",
    subspecialty: "Diabétologie",
    gender: "Femme",
    languages: ["Français", "Anglais", "Allemand"],
    address: "27 Rue du Faubourg Saint-Jacques, 75014 Paris",
    hospital: "Hôpital Cochin",
    distance: 4.2,
    rating: 4.5,
    reviewCount: 87,
    experience: 14,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Diderot",
        year: "2007",
      },
      {
        degree: "Spécialisation en Endocrinologie",
        institution: "Hôpital Cochin",
        year: "2012",
      },
    ],
    awards: ["Prix de Recherche en Diabétologie 2019"],
    publications: 19,
    availability: {
      nextAvailable: "2025-03-14",
      slots: [
        {
          date: "2025-03-14",
          times: ["10:00", "11:30", "14:00", "15:30", "17:00"],
        },
        { date: "2025-03-15", times: ["09:30", "11:00", "14:30", "16:00"] },
        { date: "2025-03-16", times: ["10:30", "13:00", "15:30"] },
      ],
    },
    consultationFee: 70,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "AXA", "Swiss Life"],
    bio: "Endocrinologue spécialisée dans le traitement du diabète et des troubles hormonaux. Approche personnalisée pour chaque patient, combinant traitement médical et conseils sur le mode de vie.",
    services: [
      "Consultation endocrinologique",
      "Suivi diabétique",
      "Troubles thyroïdiens",
      "Troubles métaboliques",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: true,
    homeVisit: false,
    reviews: [
      {
        id: "rev-009",
        author: "Michel Lambert",
        rating: 5,
        date: "2024-11-25",
        comment:
          "Dr. Moreau a complètement transformé ma gestion du diabète. Ses conseils sont précieux et elle est très disponible.",
      },
      {
        id: "rev-010",
        author: "Émilie Durand",
        rating: 4,
        date: "2024-11-10",
        comment:
          "Très bonne endocrinologue, attentive et précise dans ses explications. Le suivi est excellent.",
      },
    ],
  },
  {
    id: "doc-006",
    name: "Dr. Philippe Laurent",
    specialty: "Neurologie",
    subspecialty: "Neurologie cognitive",
    gender: "Homme",
    languages: ["Français", "Anglais"],
    address: "5 Rue Cabanis, 75014 Paris",
    hospital: "Centre Hospitalier Sainte-Anne",
    distance: 3.5,
    rating: 4.7,
    reviewCount: 112,
    experience: 22,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Descartes",
        year: "1999",
      },
      {
        degree: "Spécialisation en Neurologie",
        institution: "Hôpital Pitié-Salpêtrière",
        year: "2004",
      },
    ],
    awards: [
      "Prix d'Excellence en Neurologie 2015",
      "Médaille de la Recherche Neurologique 2020",
    ],
    publications: 42,
    availability: {
      nextAvailable: "2025-03-20",
      slots: [
        { date: "2025-03-20", times: ["09:00", "11:30", "14:00"] },
        { date: "2025-03-21", times: ["10:00", "13:30", "16:00"] },
        { date: "2025-03-22", times: ["09:30", "12:00", "14:30"] },
      ],
    },
    consultationFee: 100,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "Harmonie Mutuelle", "AXA"],
    bio: "Neurologue spécialisé dans les troubles cognitifs et les maladies neurodégénératives. Plus de 20 ans d'expérience dans le diagnostic et le traitement des pathologies neurologiques complexes.",
    services: [
      "Consultation neurologique",
      "Électroencéphalogramme",
      "Traitement des migraines",
      "Suivi Alzheimer et Parkinson",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: false,
    homeVisit: true,
    reviews: [
      {
        id: "rev-011",
        author: "Catherine Mercier",
        rating: 5,
        date: "2024-12-08",
        comment:
          "Dr. Laurent est exceptionnel. Son expertise en neurologie cognitive a permis un diagnostic précis pour mon père atteint d'Alzheimer.",
      },
      {
        id: "rev-012",
        author: "François Bertrand",
        rating: 4,
        date: "2024-11-15",
        comment:
          "Excellent neurologue, très compétent et humain. Explications claires et traitement efficace pour mes migraines.",
      },
    ],
  },
  {
    id: "doc-007",
    name: "Dr. Claire Petit",
    specialty: "Pédiatrie",
    subspecialty: "Allergologie pédiatrique",
    gender: "Femme",
    languages: ["Français", "Anglais", "Portugais"],
    address: "149 Rue de Sèvres, 75015 Paris",
    hospital: "Hôpital Necker-Enfants Malades",
    distance: 2.9,
    rating: 4.9,
    reviewCount: 178,
    experience: 16,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Descartes",
        year: "2005",
      },
      {
        degree: "Spécialisation en Pédiatrie",
        institution: "Hôpital Necker-Enfants Malades",
        year: "2010",
      },
      {
        degree: "Diplôme d'Allergologie",
        institution: "Université Paris Descartes",
        year: "2012",
      },
    ],
    awards: [
      "Prix d'Excellence en Pédiatrie 2018",
      "Prix Innovation en Allergologie Pédiatrique 2021",
    ],
    publications: 25,
    availability: {
      nextAvailable: "2025-03-13",
      slots: [
        {
          date: "2025-03-13",
          times: ["09:00", "10:30", "14:00", "15:30", "17:00"],
        },
        { date: "2025-03-14", times: ["09:00", "10:30", "14:00", "15:30"] },
        { date: "2025-03-15", times: ["09:30", "11:00", "14:30"] },
      ],
    },
    consultationFee: 60,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "Harmonie Mutuelle", "Allianz", "AXA"],
    bio: "Pédiatre spécialisée en allergologie pédiatrique avec 16 ans d'expérience. Expertise dans le diagnostic et le traitement des allergies alimentaires, respiratoires et cutanées chez l'enfant.",
    services: [
      "Consultation pédiatrique",
      "Tests allergologiques",
      "Suivi de croissance",
      "Vaccination",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: true,
    homeVisit: false,
    reviews: [
      {
        id: "rev-013",
        author: "Julie Martin",
        rating: 5,
        date: "2024-12-20",
        comment:
          "Dr. Petit est une pédiatre exceptionnelle. Elle a su diagnostiquer rapidement l'allergie de mon fils et proposer un traitement efficace.",
      },
      {
        id: "rev-014",
        author: "Nicolas Durand",
        rating: 5,
        date: "2024-12-05",
        comment:
          "Excellente pédiatre, très douce avec les enfants et très professionnelle. Ma fille n'a plus peur d'aller chez le médecin.",
      },
    ],
  },
  {
    id: "doc-008",
    name: "Dr. Antoine Rousseau",
    specialty: "Psychiatrie",
    subspecialty: "Thérapie cognitivo-comportementale",
    gender: "Homme",
    languages: ["Français", "Anglais"],
    address: "1 Rue Cabanis, 75014 Paris",
    hospital: "Centre Hospitalier Sainte-Anne",
    distance: 3.4,
    rating: 4.6,
    reviewCount: 95,
    experience: 18,
    education: [
      {
        degree: "Doctorat en Médecine",
        institution: "Université Paris Diderot",
        year: "2003",
      },
      {
        degree: "Spécialisation en Psychiatrie",
        institution: "Centre Hospitalier Sainte-Anne",
        year: "2008",
      },
    ],
    awards: ["Prix de Recherche en Psychiatrie 2017"],
    publications: 22,
    availability: {
      nextAvailable: "2025-03-11",
      slots: [
        {
          date: "2025-03-11",
          times: ["10:00", "11:30", "14:00", "15:30", "17:00"],
        },
        { date: "2025-03-12", times: ["10:00", "11:30", "14:00", "15:30"] },
        { date: "2025-03-13", times: ["10:00", "11:30", "14:00"] },
      ],
    },
    consultationFee: 85,
    acceptsInsurance: true,
    insuranceNetworks: ["MGEN", "AXA", "Swiss Life"],
    bio: "Psychiatre spécialisé en thérapie cognitivo-comportementale avec 18 ans d'expérience. Approche bienveillante et personnalisée pour le traitement des troubles anxieux, dépressifs et du comportement.",
    services: [
      "Consultation psychiatrique",
      "Thérapie cognitivo-comportementale",
      "Suivi psychologique",
      "Traitement des addictions",
    ],
    avatar: "/placeholder.svg?height=400&width=400",
    videoConsultation: true,
    homeVisit: false,
    reviews: [
      {
        id: "rev-015",
        author: "Anonyme",
        rating: 5,
        date: "2024-12-12",
        comment:
          "Dr. Rousseau m'a aidé à surmonter mon anxiété sociale grâce à la TCC. Son approche est efficace et respectueuse.",
      },
      {
        id: "rev-016",
        author: "Anonyme",
        rating: 4,
        date: "2024-11-28",
        comment:
          "Très bon psychiatre, à l'écoute et professionnel. Les séances sont structurées et constructives.",
      },
    ],
  },
];

// Sample data for specialties
const specialties = [
  { value: "general", label: "Médecine générale" },
  { value: "cardiology", label: "Cardiologie" },
  { value: "dermatology", label: "Dermatologie" },
  { value: "ophthalmology", label: "Ophtalmologie" },
  { value: "endocrinology", label: "Endocrinologie" },
  { value: "neurology", label: "Neurologie" },
  { value: "pediatrics", label: "Pédiatrie" },
  { value: "psychiatry", label: "Psychiatrie" },
  { value: "gynecology", label: "Gynécologie" },
  { value: "orthopedics", label: "Orthopédie" },
];

// Sample data for insurance networks
const insuranceNetworks = [
  { value: "mgen", label: "MGEN" },
  { value: "harmonie", label: "Harmonie Mutuelle" },
  { value: "allianz", label: "Allianz" },
  { value: "axa", label: "AXA" },
  { value: "swiss", label: "Swiss Life" },
];

// Helper function to get star rating display
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function DoctorSearchPage() {
  //   const router = useRouter();
  //   const searchParams = useSearchParams();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedInsurance, setSelectedInsurance] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [videoConsultation, setVideoConsultation] = useState(false);
  const [homeVisit, setHomeVisit] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number[]>([10]);
  const [maxPrice, setMaxPrice] = useState<number[]>([150]);
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [sortBy, setSortBy] = useState("rating");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<
    (typeof doctorsData)[0] | null
  >(null);
  const [isDoctorDetailOpen, setIsDoctorDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter doctors based on search and filters
  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch =
      searchQuery === "" ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "" ||
      doctor.specialty.toLowerCase() ===
        specialties
          .find((s) => s.value === selectedSpecialty)
          ?.label.toLowerCase();

    const matchesGender =
      selectedGender === "" ||
      doctor.gender.toLowerCase() === selectedGender.toLowerCase();

    const matchesInsurance =
      selectedInsurance === "" ||
      doctor.insuranceNetworks.some(
        (network) =>
          network.toLowerCase() ===
          insuranceNetworks
            .find((i) => i.value === selectedInsurance)
            ?.label.toLowerCase()
      );

    const matchesLanguage =
      selectedLanguage === "" ||
      doctor.languages.some(
        (lang) => lang.toLowerCase() === selectedLanguage.toLowerCase()
      );

    const matchesVideoConsultation =
      !videoConsultation || doctor.videoConsultation;

    const matchesHomeVisit = !homeVisit || doctor.homeVisit;

    const matchesDistance = doctor.distance <= maxDistance[0];

    const matchesPrice = doctor.consultationFee <= maxPrice[0];

    const matchesRating = doctor.rating >= minRating[0];

    return (
      matchesSearch &&
      matchesSpecialty &&
      matchesGender &&
      matchesInsurance &&
      matchesLanguage &&
      matchesVideoConsultation &&
      matchesHomeVisit &&
      matchesDistance &&
      matchesPrice &&
      matchesRating
    );
  });

  // Sort doctors based on selected sort option
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "experience":
        return b.experience - a.experience;
      case "price_low":
        return a.consultationFee - b.consultationFee;
      case "price_high":
        return b.consultationFee - a.consultationFee;
      case "distance":
        return a.distance - b.distance;
      case "availability":
        return (
          new Date(a.availability.nextAvailable).getTime() -
          new Date(b.availability.nextAvailable).getTime()
        );
      default:
        return b.rating - a.rating;
    }
  });

  // Open doctor detail dialog
  const openDoctorDetail = (doctor: (typeof doctorsData)[0]) => {
    setSelectedDoctor(doctor);
    setIsDoctorDetailOpen(true);
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-4">
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
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filtres avancés
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Filtres avancés</DialogTitle>
                <DialogDescription>
                  Affinez votre recherche de médecins selon vos critères
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Genre du médecin</Label>
                  <RadioGroup
                    value={selectedGender}
                    onValueChange={setSelectedGender}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="gender-all" />
                      <Label htmlFor="gender-all">Tous</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="homme" id="gender-male" />
                      <Label htmlFor="gender-male">Homme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femme" id="gender-female" />
                      <Label htmlFor="gender-female">Femme</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Mutuelle acceptée</Label>
                  <Select
                    value={selectedInsurance}
                    onValueChange={setSelectedInsurance}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les mutuelles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les mutuelles</SelectItem>
                      {insuranceNetworks.map((insurance) => (
                        <SelectItem
                          key={insurance.value}
                          value={insurance.value}
                        >
                          {insurance.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Langue parlée</Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les langues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les langues</SelectItem>
                      <SelectItem value="français">Français</SelectItem>
                      <SelectItem value="anglais">Anglais</SelectItem>
                      <SelectItem value="espagnol">Espagnol</SelectItem>
                      <SelectItem value="allemand">Allemand</SelectItem>
                      <SelectItem value="italien">Italien</SelectItem>
                      <SelectItem value="portugais">Portugais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Distance maximale: {maxDistance[0]} km</Label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    max={20}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prix maximum: {maxPrice[0]} €</Label>
                  <Slider
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Note minimale: {minRating[0]}</Label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    min={1}
                    max={5}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="video-consultation"
                      checked={videoConsultation}
                      onCheckedChange={setVideoConsultation}
                    />
                    <Label htmlFor="video-consultation">
                      Téléconsultation disponible
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="home-visit"
                      checked={homeVisit}
                      onCheckedChange={setHomeVisit}
                    />
                    <Label htmlFor="home-visit">Visite à domicile</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedGender("");
                    setSelectedInsurance("");
                    setSelectedLanguage("");
                    setMaxDistance([10]);
                    setMaxPrice([150]);
                    setMinRating([4]);
                    setVideoConsultation(false);
                    setHomeVisit(false);
                  }}
                >
                  Réinitialiser
                </Button>
                <Button onClick={() => setIsFilterDialogOpen(false)}>
                  Appliquer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Meilleure note</SelectItem>
              <SelectItem value="experience">Expérience</SelectItem>
              <SelectItem value="price_low">Prix croissant</SelectItem>
              <SelectItem value="price_high">Prix décroissant</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedDoctors.length} médecin{sortedDoctors.length !== 1 ? "s" : ""}{" "}
          trouvé{sortedDoctors.length !== 1 ? "s" : ""}
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
              {selectedGender === "homme" ? "Homme" : "Femme"}
              <button
                onClick={() => setSelectedGender("")}
                className="ml-1 rounded-full hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {videoConsultation && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Téléconsultation
              <button
                onClick={() => setVideoConsultation(false)}
                className="ml-1 rounded-full hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {sortedDoctors.length === 0 ? (
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
                setSelectedInsurance("");
                setSelectedLanguage("");
                setMaxDistance([10]);
                setMaxPrice([150]);
                setMinRating([4]);
                setVideoConsultation(false);
                setHomeVisit(false);
              }}
            >
              Réinitialiser tous les filtres
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => openDoctorDetail(doctor)}
            >
              <div className="relative">
                <div className="absolute right-2 top-2 z-10">
                  {doctor.videoConsultation && (
                    <Badge variant="secondary" className="mr-1">
                      <MessageSquare className="mr-1 h-3 w-3" />{" "}
                      Téléconsultation
                    </Badge>
                  )}
                </div>
                <div className="flex h-40 items-center justify-center bg-muted">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="p-4 pb-2 text-center">
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                <CardDescription className="flex items-center justify-center">
                  {doctor.specialty}
                  {doctor.subspecialty && (
                    <span className="ml-1">• {doctor.subspecialty}</span>
                  )}
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
                      Disponible dès le{" "}
                      {formatDate(doctor.availability.nextAvailable)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{doctor.experience} ans d&apos;expérience</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="font-medium">{doctor.consultationFee} €</div>
                <Button size="sm">Prendre RDV</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => openDoctorDetail(doctor)}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="flex h-full w-full items-center justify-center bg-muted p-4 sm:w-48">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-1 flex-col">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <CardDescription>
                          {doctor.specialty}
                          {doctor.subspecialty && (
                            <span className="ml-1">
                              • {doctor.subspecialty}
                            </span>
                          )}
                        </CardDescription>
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
                          Disponible dès le{" "}
                          {formatDate(doctor.availability.nextAvailable)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{doctor.experience} ans d&apos;expérience</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex space-x-2">
                          {doctor.videoConsultation && (
                            <Badge
                              variant="outline"
                              className="flex items-center"
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />{" "}
                              Téléconsultation
                            </Badge>
                          )}
                          {doctor.homeVisit && (
                            <Badge
                              variant="outline"
                              className="flex items-center"
                            >
                              <Home className="mr-1 h-3 w-3" /> Domicile
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="font-medium">
                      {doctor.consultationFee} €
                    </div>
                    <Button size="sm">Prendre RDV</Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Doctor Detail Dialog */}
      <Dialog open={isDoctorDetailOpen} onOpenChange={setIsDoctorDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-16 w-16 border-4 border-background">
                      <AvatarImage
                        src={selectedDoctor.avatar}
                        alt={selectedDoctor.name}
                      />
                      <AvatarFallback>
                        {selectedDoctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <DialogTitle className="text-xl">
                        {selectedDoctor.name}
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.specialty} •{" "}
                        {selectedDoctor.subspecialty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <Tabs defaultValue="profile" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="availability">Disponibilités</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Avis ({selectedDoctor.reviewCount})
                  </TabsTrigger>
                  <TabsTrigger value="location">Localisation</TabsTrigger>
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
                              <h4 className="font-medium">Langues parlées</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedDoctor.languages.join(", ")}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Genre</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedDoctor.gender}
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
                            {selectedDoctor.services.map((service, index) => (
                              <div key={index} className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-primary" />
                                <span>{service}</span>
                              </div>
                            ))}
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
                                {selectedDoctor.education.map((edu, index) => (
                                  <div key={index} className="flex items-start">
                                    <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary" />
                                    <div>
                                      <p className="font-medium">
                                        {edu.degree}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {edu.institution}, {edu.year}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {selectedDoctor.awards.length > 0 && (
                              <div>
                                <h4 className="font-medium">Distinctions</h4>
                                <div className="mt-2 space-y-2">
                                  {selectedDoctor.awards.map((award, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <Award className="mr-2 h-4 w-4 text-yellow-500" />
                                      <span>{award}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedDoctor.publications > 0 && (
                              <div>
                                <h4 className="font-medium">Publications</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedDoctor.publications} publications
                                  dans des revues médicales
                                </p>
                              </div>
                            )}
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
                                {selectedDoctor.consultationFee} €
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
                                  {selectedDoctor.insuranceNetworks.map(
                                    (network, index) => (
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>Téléconsultation</span>
                                </div>
                                {selectedDoctor.videoConsultation ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>Visite à domicile</span>
                                </div>
                                {selectedDoctor.homeVisit ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">Contact</h4>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center">
                                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>01 XX XX XX XX</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{selectedDoctor.address}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Button className="w-full">Prendre rendez-vous</Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="availability" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prochaines disponibilités</CardTitle>
                      <CardDescription>
                        Prochain créneau disponible le{" "}
                        {formatDate(selectedDoctor.availability.nextAvailable)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedDoctor.availability.slots.map(
                          (slot, index) => (
                            <div key={index}>
                              <h4 className="font-medium">
                                {formatDate(slot.date)}
                              </h4>
                              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                                {slot.times.map((time, timeIndex) => (
                                  <Button
                                    key={timeIndex}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        Voir plus de disponibilités
                      </Button>
                    </CardFooter>
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
                        {selectedDoctor.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{review.author}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(review.date)}
                              </div>
                            </div>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                            <p className="mt-2 text-sm">{review.comment}</p>
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
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Voir tous les avis
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="location" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Adresse et localisation</CardTitle>
                      <CardDescription>
                        {selectedDoctor.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <div className="flex h-full items-center justify-center">
                          <MapPin className="h-12 w-12 text-muted-foreground/50" />
                          <span className="ml-2 text-muted-foreground">
                            Carte non disponible en prévisualisation
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Distance</span>
                          <span>{selectedDoctor.distance} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Établissement</span>
                          <span>{selectedDoctor.hospital}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Transports</span>
                          <span>Métro, Bus</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Itinéraire</Button>
                      <Button variant="outline">Partager</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-4">
                <Button className="w-full" size="lg">
                  Prendre rendez-vous avec {selectedDoctor.name}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
