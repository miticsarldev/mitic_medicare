import { UserRole } from "@prisma/client";

export const countries = [
  { value: "Burkina-Faso", label: "Burkina-Faso" },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
  { value: "Guineé", label: "Guineé" },
  { value: "Mali", label: "Mali" },
  { value: "Niger", label: "Niger" },
  { value: "Sénégal", label: "Sénégal" },
  { value: "Togo", label: "Togo" },
];

export const locations = {
  Mali: [
    { value: "Bamako", label: "Bamako" },
    { value: "Bafoulabé", label: "Bafoulabé" },
    { value: "Bandiagara", label: "Bandiagara" },
    { value: "Bougouni", label: "Bougouni" },
    { value: "Dioïla", label: "Dioïla" },
    { value: "Douentza", label: "Douentza" },
    { value: "Gao", label: "Gao" },
    { value: "Kati", label: "Kati" },
    { value: "Kayes", label: "Kayes" },
    { value: "Kidal", label: "Kidal" },
    { value: "Kita", label: "Kita" },
    { value: "Koulikoro", label: "Koulikoro" },
    { value: "Koutiala", label: "Koutiala" },
    { value: "Ménaka", label: "Ménaka" },
    { value: "Mopti", label: "Mopti" },
    { value: "Nara", label: "Nara" },
    { value: "Niono", label: "Niono" },
    { value: "Nioro du Sahel", label: "Nioro du Sahel" },
    { value: "San", label: "San" },
    { value: "Ségou", label: "Ségou" },
    { value: "Sikasso", label: "Sikasso" },
    { value: "Taoudénit", label: "Taoudénit" },
    { value: "Tombouctou", label: "Tombouctou" },
    { value: "Yanfolila", label: "Yanfolila" },
  ],
  "Burkina-Faso": [
    { value: "Boucle du Mouhoun", label: "Boucle du Mouhoun" },
    { value: "Cascades", label: "Cascades" },
    { value: "Centre", label: "Centre" },
    { value: "Centre-Est", label: "Centre-Est" },
    { value: "Centre-Nord", label: "Centre-Nord" },
    { value: "Centre-Ouest", label: "Centre-Ouest" },
    { value: "Centre-Sud", label: "Centre-Sud" },
    { value: "Est", label: "Est" },
    { value: "Hauts-Bassins", label: "Hauts-Bassins" },
    { value: "Nord", label: "Nord" },
    { value: "Plateau-Central", label: "Plateau-Central" },
    { value: "Sahel", label: "Sahel" },
    { value: "Sud-Ouest", label: "Sud-Ouest" },
  ],
  "Côte d'Ivoire": [
    { value: "Abidjan", label: "Abidjan" },
    { value: "Bas-Sassandra", label: "Bas-Sassandra" },
    { value: "Comoe", label: "Comoe" },
    { value: "Denguélé", label: "Denguélé" },
    { value: "Goh-Djiboua", label: "Goh-Djiboua" },
    { value: "Lacs", label: "Lacs" },
    { value: "Lagunes", label: "Lagunes" },
    { value: "Montagnes", label: "Montagnes" },
    { value: "Sassandra-Marahoué", label: "Sassandra-Marahoué" },
    { value: "Savanes", label: "Savanes" },
    { value: "Vallée du Bandama", label: "Vallée du Bandama" },
    { value: "Woroba", label: "Woroba" },
    { value: "Yamoussoukro", label: "Yamoussoukro" },
    { value: "Zanzan", label: "Zanzan" },
  ],
  Guineé: [
    { value: "Boké", label: "Boké" },
    { value: "Conakry", label: "Conakry" },
    { value: "Faranah", label: "Faranah" },
    { value: "Kankan", label: "Kankan" },
    { value: "Kindia", label: "Kindia" },
    { value: "Labé", label: "Labé" },
    { value: "Mamou", label: "Mamou" },
    { value: "Nzérékoré", label: "Nzérékoré" },
  ],
  Niger: [
    { value: "Agadez", label: "Agadez" },
    { value: "Diffa", label: "Diffa" },
    { value: "Dosso", label: "Dosso" },
    { value: "Maradi", label: "Maradi" },
    { value: "Tahoua", label: "Tahoua" },
    { value: "Tillabéri", label: "Tillabéri" },
    { value: "Zinder", label: "Zinder" },
    { value: "Niamey", label: "Niamey" },
  ],
  Sénégal: [
    { value: "Dakar", label: "Dakar" },
    { value: "Diourbel", label: "Diourbel" },
    { value: "Fatick", label: "Fatick" },
    { value: "Kaffrine", label: "Kaffrine" },
    { value: "Kaolack", label: "Kaolack" },
    { value: "Kédougou", label: "Kédougou" },
    { value: "Kolda", label: "Kolda" },
    { value: "Louga", label: "Louga" },
    { value: "Matam", label: "Matam" },
    { value: "Saint-Louis", label: "Saint-Louis" },
    { value: "Sédhiou", label: "Sédhiou" },
    { value: "Tambacounda", label: "Tambacounda" },
    { value: "Thiès", label: "Thiès" },
    { value: "Ziguinchor", label: "Ziguinchor" },
  ],
  Togo: [
    { value: "Centrale", label: "Centrale" },
    { value: "Kara", label: "Kara" },
    { value: "Maritime", label: "Maritime" },
    { value: "Plateaux", label: "Plateaux" },
    { value: "Savanes", label: "Savanes" },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  PATIENT: "Patient",
  HOSPITAL_ADMIN: "Administrateur du centre",
  SUPER_ADMIN: "Super Administrateur",
  INDEPENDENT_DOCTOR: "Docteur Indépendant",
  HOSPITAL_DOCTOR: "Docteur de centre",
};

export const institutionTypes = [
  { value: "clinic", label: "Clinique" },
  { value: "hospital", label: "Hôpital" },
];

export const governorates = [
  { value: "Bamako", label: "Bamako" },
  { value: "Waga", label: "Waga" },
  { value: "Niamey", label: "Niamey" },
];

// export const specialities = [
//   { value: "cardiologue", label: "Cardiologue" },
//   { value: "dermatologue", label: "Dermatologue" },
//   { value: "generaliste", label: "Médecin Généraliste" },
//   { value: "chirurgien", label: "Chirurgien" },
//   { value: "gynecologue", label: "Gynécologue-Obstétricien" },
//   { value: "neurologue", label: "Neurologue" },
//   { value: "ophtalmologue", label: "Ophtalmologue" },
//   { value: "orl", label: "Oto-Rhino-Laryngologiste (ORL)" },
//   { value: "pediatre", label: "Pédiatre" },
//   { value: "psychiatre", label: "Psychiatre" },
//   { value: "radiologue", label: "Radiologue" },
//   { value: "anesthesiste", label: "Anesthésiste" },
//   { value: "med_interne", label: "Médecin Interne" },
//   { value: "sante_publique", label: "Médecin en Santé Publique" },
//   { value: "med_laboratoire", label: "Médecin de Laboratoire" },
// ];

export const specialities = [
  {
    value: "generaliste",
    label: "Médecin Généraliste",
    synonyms: ["généraliste", "médecine générale"],
  },
  { value: "pediatre", label: "Pédiatre" },
  {
    value: "gyneco_obstetrique",
    label: "Gynécologie-Obstétrique",
    synonyms: ["gynécologue", "obstétricien"],
  },
  { value: "cardiologie", label: "Cardiologue" },
  {
    value: "dermatologie",
    label: "Dermatologue / Vénérologue",
    synonyms: ["dermato", "vénérologie"],
  },
  { value: "ophtalmologie", label: "Ophtalmologue", synonyms: ["ophtalmo"] },
  { value: "orl", label: "ORL (Oto-Rhino-Laryngologie)" },
  {
    value: "chirurgie_generale",
    label: "Chirurgie générale",
    synonyms: ["chirurgien"],
  },
  { value: "ortho_traumato", label: "Orthopédie - Traumatologie" },
  {
    value: "anesthesie_rea",
    label: "Anesthésie - Réanimation",
    synonyms: ["anesthésiste"],
  },
  { value: "neurologie", label: "Neurologue" },
  { value: "psychiatrie", label: "Psychiatre" },
  {
    value: "radiologie",
    label: "Radiologie & Imagerie",
    synonyms: ["radiologue", "imagerie"],
  },
  { value: "gastro_hepato", label: "Gastro-entérologie & Hépatologie" },
  { value: "pneumologie", label: "Pneumologue" },
  { value: "nephrologie", label: "Néphrologue" },
  { value: "endocrino_diabeto", label: "Endocrinologie - Diabétologie" },
  { value: "rhumatologie", label: "Rhumatologie" },
  { value: "hematologie", label: "Hématologie" },
  { value: "oncologie", label: "Oncologie médicale" },
  {
    value: "infectiologie",
    label: "Infectiologie / Médecine Tropicale",
    synonyms: ["médecine tropicale", "paludisme", "TB"],
  },
  { value: "sante_publique", label: "Santé Publique / Communautaire" },
  { value: "medecine_interne", label: "Médecine Interne" },
  {
    value: "biologie_medicale",
    label: "Biologie Médicale / Laboratoire",
    synonyms: ["médecin de labo"],
  },
  { value: "odontostomatologie", label: "Odonto-stomatologie (Dentiste)" },
  { value: "urologie", label: "Urologue" },
] as const;

export const annee = [
  { value: "Janvier", label: "Janvier" },
  { value: "Février", label: "Février" },
  { value: "Mars", label: "Mars" },
  { value: "Avril", label: "Avril" },
  { value: "Mai", label: "Mai" },
  { value: "Juin", label: "Juin" },
  { value: "Juillet", label: "Juillet" },
  { value: "Août", label: "Août" },
  { value: "Septembre", label: "Septembre" },
  { value: "Octobre", label: "Octobre" },
  { value: "Novembre", label: "Novembre" },
  { value: "Décembre", label: "Décembre" },
];

export const questions = [
  {
    id: 1,
    title: "Problème au niveau d'oreilles",
    description:
      "Récemment, mes oreilles ont commencé à bourdonner comme si elles tremblaient. Je ne trouve pas de description appropriée pour cela. Parfois, cela s'accompagne d'un brouillard dans mes yeux, alors certaines personnes m'ont dit que c'était dû au tension. Maintenant, je ne sais pas si je dois...",
    doctorName: "Dr Karim Ballo",
    specialty: "Oto-Rhino-Laryngologiste (ORL)",
    image: "/doctors.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
  {
    id: 2,
    title: "Douleurs articulaires fréquentes",
    description:
      "Depuis quelques semaines, j'ai des douleurs persistantes aux genoux...",
    doctorName: "Dr Karim Keîta",
    specialty: "Rhumatologue",
    image: "/medecin.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
  {
    id: 3,
    title: "Douleurs articulaires fréquentes",
    description:
      "Depuis quelques semaines, j'ai des douleurs persistantes aux genoux...",
    doctorName: "Dr Karim Keîta",
    specialty: "Rhumatologue",
    image: "/medecin.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
  {
    id: 4,
    title: "Douleurs articulaires fréquentes",
    description:
      "Depuis quelques semaines, j'ai des douleurs persistantes aux genoux...",
    doctorName: "Dr Karim Keîta",
    specialty: "Rhumatologue",
    image: "/medecin.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
  {
    id: 5,
    title: "Douleurs articulaires fréquentes",
    description:
      "Depuis quelques semaines, j'ai des douleurs persistantes aux genoux...",
    doctorName: "Dr Karim Keîta",
    specialty: "Rhumatologue",
    image: "/medecin.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
  {
    id: 6,
    title: "Douleurs articulaires fréquentes",
    description:
      "Depuis quelques semaines, j'ai des douleurs persistantes aux genoux...",
    doctorName: "Dr Karim Keîta",
    specialty: "Rhumatologue",
    image: "/medecin.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
  {
    id: 7,
    title: "Douleurs articulaires fréquentes",
    description:
      "Depuis quelques semaines, j'ai des douleurs persistantes aux genoux...",
    doctorName: "Dr Karim Keîta",
    specialty: "Rhumatologue",
    image: "/medecin.png",
    answer:
      "Je vous conseille vivement d’aller consulter un médecin, surtout si vous avez des troubles visuels associés",
  },
];

export const posts = [
  {
    id: 1,
    title:
      "La rééducation périnéale est une pratique paramédicale qui vise à renforcer les muscles du périnée, cette zone musculaire située entre le vagin et l'anus. Elle est souvent recommandée aux femmes après une grossesse ou un accouchement, mais peut également être bénéfique pour les hommes et les femmes à tout âge.",
    content:
      "Quels sont les bienfaits de la rééducation périnéale ? Amélioration du contrôle de la vessie et réduction des fuites urinaires : la rééducation périnéale renforce les muscles du sphincter vésical, ce qui permet de mieux contrôler la miction et de réduire les fuites urinaires, même d'effort.Prévention et réduction de la descente d'organes : le périnée joue un rôle important dans le soutien des organes pelviens, tels que la vessie, l'utérus et le rectum. En renforçant les muscles périnéaux, on peut prévenir ou réduire la descente d'organes, qui peut se manifester par une sensation de pesanteur ou une protrusion des organes.Amélioration de la vie sexuelle : la rééducation périnéale peut également améliorer la sensibilité et la tonicité du vagin, ce qui peut se traduire par une augmentation du plaisir sexuel pour les femmes et les hommes.Soulagement de la constipation : les muscles du périnée sont également impliqués dans l'évacuation des selles. En les renforçant, on peut faciliter le transit intestinal et soulager la constipation.Amélioration de la posture et de la proprioception : la rééducation périnéale peut également avoir un impact positif sur la posture et la proprioception, la perception de son propre corps.",
    authorName: "Marie L.",
    authorImage: "/doctors.png",
    date: "26 Février 2025",
    category: "generaliste",
  },
  {
    id: 2,
    title: "Quels aliments privilégier pour une meilleure digestion ?",
    content: "J’ai des problèmes digestifs récurrents. Des suggestions ?",
    authorName: "Paul D.",
    authorImage: "/doc.webp",
    date: "25 Février 2025",
    category: "cardiologue",
  },
];

export const recentArticles = [
  {
    title: "Les bienfaits du sommeil sur la santé mentale",
    image: "/doc.webp",
    category: "Santé mentale",
  },
  {
    title: "Comment booster son système immunitaire naturellement",
    image: "/montre.png",
    category: "Bien-être",
  },
  {
    title: "L'importance de l'hydratation pour le corps",
    image: "/orange.png",
    category: "Nutrition",
  },
  {
    title: "Les nouvelles avancées en médecine régénérative",
    image: "/montre.png",
    category: "Innovation",
  },
];

export const medicalArticles = [
  {
    title: "Comprendre les maladies cardiovasculaires",
    image: "/ballon.png",
    author: "Dr. Ali Koné",
    authorImage: "/medecin.png",
    specialty: "Cardiologue",
  },
  {
    title: "Les nouvelles thérapies contre le cancer",
    image: "/montre.png",
    author: "Dr. Alou Cissé",
    authorImage: "/doc.webp",
    specialty: "Oncologue",
  },
  {
    title: "Les effets du stress sur le système nerveux",
    image: "/orange.png",
    author: "Dr. Sophie Martin",
    authorImage: "/doctors.png",
    specialty: "Neurologue",
  },
];

export const pastAppointments = [
  {
    id: 1,
    date: "12 Février 2024",
    doctor: "Dr. Oumar Koîta",
    specialty: "Cardiologue",
  },
  {
    id: 2,
    date: "5 Janvier 2024",
    doctor: "Dr. Marie Ballo",
    specialty: "Oncologue",
  },
];

export const upcomingAppointments = [
  {
    id: 1,
    date: "15 Mars 2025 - 10:00 AM",
    doctor: "Dr. Madou Ag",
    specialty: "Cardiologie",
    reason: "Consultation",
  },
  {
    id: 2,
    date: "20 Mars 2025 - 14:30 PM",
    doctor: "Dr. Marie Ballo",
    specialty: "Dermatologie",
    reason: "Consultation",
  },
  {
    id: 3,
    date: "25 Mars 2025 - 09:00 AM",
    doctor: "Dr. Ali Kone",
    specialty: "Neurologie",
    reason: "Consultation",
  },
];

export const appointmentsByDate = {
  "2025-03-17": [
    {
      id: 1,
      patient: "Mariam Diallo",
      time: "09:00",
      reason: "Consultation générale",
      status: "pending",
    },
    {
      id: 2,
      patient: "Alima Konté",
      time: "10:30",
      reason: "Suivi diabète",
      status: "pending",
    },
    {
      id: 3,
      patient: "Fatoumata Sow",
      time: "14:00",
      reason: "Douleurs dorsales",
      status: "accepted",
    },
    {
      id: 4,
      patient: "Issa Sylla",
      time: "16:00",
      reason: "Bilan de santé",
      status: "rejected",
    },
  ],
  "2025-03-18": [
    {
      id: 5,
      patient: "Amara konaté",
      time: "08:30",
      reason: "Examen annuel",
      status: "pending",
    },
    {
      id: 6,
      patient: "Papa touré",
      time: "11:00",
      reason: "Suivi hypertension",
      status: "pending",
    },
  ],
  "2025-03-19": [
    {
      id: 7,
      patient: "Penda Diarra",
      time: "09:45",
      reason: "Consultation pédiatrique",
      status: "pending",
    },
    {
      id: 8,
      patient: "Massiré Dramé",
      time: "13:00",
      reason: "Allergies saisonnières",
      status: "accepted",
    },
  ],
};

export const patientReviews = [
  {
    id: 1,
    patient: "Sophie Martin",
    rating: 5,
    comment: "Excellent médecin, très à l'écoute.",
  },
  {
    id: 2,
    patient: "David Garcia",
    rating: 4,
    comment: "Consultation efficace, je recommande.",
  },
  {
    id: 3,
    patient: "Laura Dubois",
    rating: 5,
    comment: "Très satisfaite de la prise en charge.",
  },
];

export const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Fév", revenue: 15000 },
  { month: "Mar", revenue: 13000 },
  { month: "Avr", revenue: 17000 },
  { month: "Mai", revenue: 16000 },
];

export const pendingAppointments = [
  { id: 1, patient: "Jean Dupont", date: "16 Mars 2024", time: "10:00 AM" },
  { id: 2, patient: "Alice Moreau", date: "18 Mars 2024", time: "11:30 AM" },
  { id: 3, patient: "Marc Lemoine", date: "17 Mars 2024", time: "04:00 PM" },
];

export const patientData = {
  recentActivity: [
    {
      type: "appointment",
      description: "Consultation avec Mme. Dupont",
      date: new Date(2024, 2, 12, 10, 0),
    },
    {
      type: "medication",
      description: "Prescription de Levothyrox",
      date: new Date(2024, 2, 11, 14, 30),
    },
    {
      type: "test",
      description: "Résultats d'analyse de sang",
      date: new Date(2024, 2, 10, 9, 15),
    },
    {
      type: "appointment",
      description: "Suivi avec M. Lemoine",
      date: new Date(2024, 2, 9, 16, 0),
    },
  ],
};

export const primaryContactNumber = "+33 7 53 92 77 21";
export const secondaryContactNumber = "+223 73 81 00 23";
export const contactEmail = "contact@miticsarlml.com";
