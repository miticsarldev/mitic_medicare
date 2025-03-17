import { Users, Calendar, Stethoscope, Smile } from "lucide-react";

export const stats = [
  {
    title: "Total Patients",
    value: "1,234",
    change: "-2.1%",
    trend: "down",
    icon: Users,
    color: "bg-blue-500",
    description: "Nombre total de patients actifs",
  },
  {
    title: "Rendez-vous Aujourd'hui",
    value: "3",
    change: "+2.1%",
    trend: "up",
    icon: Calendar,
    color: "bg-green-500",
    description: "Rendez-vous pour aujourd'hui",
  },
  {
    title: "Rendez-vous prochain",
    value: "12",
    change: "+2.1%",
    trend: "up",
    icon: Stethoscope,
    color: "bg-purple-500",
    description: "Rendez-vous a venir",
  },
  {
    title: "Satisfaction",
    value: "12%",
    change: "+2.1%",
    trend: "up",
    icon: Smile,
    color: "bg-yellow-500",
    description: "Taux des avis a propos du medecin",
  },
];

export const stats2 = [
  {
    title: "Patients Actifs",
    value: "1,234",
    icon: <Users className="h-8 w-8 text-blue-500" />,
    description: "Nombre total de patients actifs",
  },
  {
    title: "Rendez-vous Aujourd'hui",
    value: "56",
    icon: <Calendar className="h-8 w-8 text-green-500" />,
    description: "Rendez-vous pour aujourd'hui",
  },
  {
    title: "Médecins Disponibles",
    value: "12",
    icon: <Stethoscope className="h-8 w-8 text-purple-500" />,
    description: "Médecins actuellement disponibles",
  },
];

export const Rendez_vous = [
    {
      id: 1,
      patient: "Jean Dupont", 
      appointmentDate: "2023-10-15",
      motif: "Consultation",
      documents: 3,
      status: "Confirmé",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    {
      id: 2,
      patient: "Marie Curie", 
      appointmentDate: "2023-10-14",
      motif: "Consultation",
      documents: 3,
      status: "En attente",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    {
      id: 3,
      patient: "Pierre Durand", 
      appointmentDate: "2023-10-13",
      motif: "Consultation",
      documents: 3,
      status: "Annulé",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    {
      id: 4,
      patient: "Sophie Martin", 
      appointmentDate: "2023-10-12",
      motif: "Consultation",
      documents: 3,
      status: "Confirmé",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    {
      id: 5,
      patient: "Lucie Bernard", 
      appointmentDate: "2023-10-11",
      motif: "Consultation",
      documents: 3,
      status: "Confirmé",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    {
      id: 6,
      patient: "Thomas Leroy", 
      appointmentDate: "2023-10-10",
      motif: "Consultation",
      documents: 3,
      status: "En attente",
      avatar: "/placeholder.svg?height=32&width=32"
    },
  ];

  export const performanceStats = [
    {
      title: "Total des consultations",
      value: 970,
      change: "+8% cette semaine",
      trend: "up",
      history: [
        { date: "Janvier", value: 120 },
        { date: "Février", value: 135 },
        { date: "Mars", value: 110 },
        { date: "Avril", value: 150 },
        { date: "Mai", value: 160 },
        { date: "Juin", value: 140 },
        { date: "Juillet", value: 155 },
      ],
    },
    {
      title: "Nouveaux patients",
      value: 263,
      change: "+5% cette semaine",
      trend: "up",
    },
    {
      title: "Taux de satisfaction",
      value: "93%",
      change: "-2% cette semaine",
      trend: "down",
    },
    {
      title: "Revenus générés",
      value: "36200 XOF",
      change: "+10% cette semaine",
      trend: "up",
    },
  ];
  

  export const patientReviewsStats = [
    {
      title: "Nombre total d'avis",
      value: "1,250",
      change: "+12% cette semaine",
      trend: "up",
    },
    {
      title: "Note moyenne",
      value: "4.7/5",
      change: "+0.2",
      trend: "up",
    },
    {
      title: "Satisfaction globale",
      value: "92%",
      change: "-1% cette semaine",
      trend: "down",
    },
  ];
  
  export const patientReviews = [
    {
      id: 1,
      patient: "Alice Dupont",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 5,
      comment: "Super consultation ! Très à l'écoute et bienveillant.",
    },
    {
      id: 2,
      patient: "Jean Martin",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.5,
      comment: "Médecin compétent, un peu de retard mais rien de grave.",
    },
    {
      id: 3,
      patient: "Sophie Bernard",
      avatar: "https://randomuser.me/api/portraits/women/60.jpg",
      rating: 4,
      comment: "Bonne expérience, explications claires.",
    },
    {
      id: 4,
      patient: "Paul Lefevre",
      avatar: "https://randomuser.me/api/portraits/men/50.jpg",
      rating: 3.5,
      comment: "Consultation correcte mais j'aurais aimé plus de conseils.",
    },
    {
      id: 5,
      patient: "Emma Rousseau",
      avatar: "https://randomuser.me/api/portraits/women/25.jpg",
      rating: 5,
      comment: "Parfait, merci pour votre patience et professionnalisme !",
    },
  ];
  
  