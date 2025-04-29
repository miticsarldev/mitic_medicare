import { UserRole } from "@prisma/client";
import {
  BarChart,
  FileSignature,
  FileText,
  Users,
  ShieldCheck,
  LifeBuoy,
  Settings,
  Bell,
  Calendar,
  ClipboardList,
  FolderHeart,
  MessageSquare,
  UserCheck,
  Stethoscope,
} from "lucide-react";

// Super Admin Navigation
export const superAdminNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Tableau de bord",
    url: "/dashboard/superadmin",
    items: [
      {
        title: "Overview",
        url: "/dashboard/superadmin/overview",
        icon: FileSignature,
      },
    ],
  },
  {
    title: "Utilisateurs",
    icon: Users,
    url: "/dashboard/superadmin/users",
    items: [
      { title: "Patients", url: "/dashboard/superadmin/users/patients" },
      { title: "Docteurs", url: "/dashboard/superadmin/users/doctors" },
      { title: "Hôpitaux", url: "/dashboard/superadmin/users/hospitals" },
    ],
  },
  {
    title: "Rendez-vous",
    icon: Users,
    url: "/dashboard/superadmin/appointment",
    items: [
      {
        title: "Tous les rendez-vous",
        url: "/dashboard/superadmin/appointment/all",
      },
    ],
  },
  {
    title: "Abonnements",
    icon: Users,
    url: "/dashboard/superadmin/subscriptions",
    items: [
      {
        title: "Liste des abonnements",
        url: "/dashboard/superadmin/subscriptions/all",
      },
    ],
  },
  {
    title: "Vérifications",
    icon: Users,
    url: "/dashboard/superadmin/verifications",
    items: [
      {
        title: "Demandes de vérifications",
        url: "/dashboard/superadmin/verifications/all",
      },
    ],
  },
  {
    title: "Gestion du Contenu",
    icon: FileText,
    url: "/dashboard/superadmin/content",
    items: [
      { title: "Articles & Blog", url: "/dashboard/superadmin/content/blogs" },
      { title: "FAQ", url: "/dashboard/superadmin/content/faq" },
      {
        title: "Avis & Témoignages",
        url: "/dashboard/superadmin/content/reviews",
      },
    ],
  },
  {
    title: "Notifications & Assistance",
    icon: Bell,
    url: "/dashboard/superadmin/notifications",
    items: [
      {
        title: "Centre de notifications",
        url: "/dashboard/superadmin/notifications/center",
      },
      {
        title: "Tickets de support",
        url: "/dashboard/superadmin/notifications/tickets",
        icon: LifeBuoy,
      },
      {
        title: "Emails & Alertes",
        url: "/dashboard/superadmin/notifications/emails",
      },
    ],
  },
];

// Independant Doctor Navigation
export const doctorNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble du médecin",
    url: "/dashboard/independant_doctor",
    items: [
      {
        title: "Aperçu",
        url: "/dashboard/independant_doctor/overview",
        icon: ClipboardList,
      },
      {
        title: "Statistiques & Analyse",
        url: "/dashboard/independant_doctor/statistics",
        icon: FileText,
      },
      {
        title: "Avis & Retours",
        url: "/dashboard/independant_doctor/reviews",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Mes Patients",
    icon: Users,
    url: "/dashboard/independant_doctor/patients",
    items: [
      {
        title: "Liste des Patients",
        url: "/dashboard/independant_doctor/patients/list",
      },
      {
        title: "Dossiers Médicaux",
        url: "/dashboard/independant_doctor/patients/medical-records",
        icon: FolderHeart,
      },
    ],
  },
  {
    title: "Rendez-vous",
    icon: Calendar,
    url: "/dashboard/independant_doctor/appointments",
    items: [
      {
        title: "Tous les Rendez-vous",
        url: "/dashboard/independant_doctor/appointments/all",
      },
      {
        title: "Prochains Rendez-vous",
        url: "/dashboard/independant_doctor/appointments/upcoming",
      },
    ],
  },
  {
    title: "Mon Profil & Paramètres",
    icon: Settings,
    url: "/dashboard/independant_doctor/settings",
    items: [
      {
        title: "Mon Profil",
        url: "/dashboard/independant_doctor/settings/profil",
      },
      {
        title: "Disponibilités",
        url: "/dashboard/independant_doctor/settings/availability",
      },
      {
        title: "Tarification",
        url: "/dashboard/independant_doctor/settings/pricing",
      },
      {
        title: "Paramètres",
        url: "/dashboard/independant_doctor/settings/settings",
      },
    ],
  },
  {
    title: "Documentation & Assistance",
    icon: FileText,
    url: "/dashboard/independant_doctor/support",
    items: [
      {
        title: "Centre d'Aide",
        url: "/dashboard/independant_doctor/support/help-center",
      },
      { title: "FAQs", url: "/dashboard/independant_doctor/support/faq" },
      {
        title: "Support Technique",
        url: "/dashboard/independant_doctor/support/contact",
      },
    ],
  },
];

// Patient Navigation
export const patientNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble du patient",
    url: "/dashboard/patient",
    items: [
      {
        title: "Aperçu",
        url: "/dashboard/patient/overview",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Rendez-vous",
    icon: Calendar,
    url: "/dashboard/patient/appointments",
    items: [
      {
        title: "Mes Rendez-vous",
        url: "/dashboard/patient/appointments/all",
      },
      {
        title: "Prendre un Rendez-vous",
        url: "/dashboard/patient/appointments/book",
      },
    ],
  },
  {
    title: "Mon Dossier Médical",
    icon: FolderHeart,
    url: "/dashboard/patient/medical-records",
    items: [
      {
        title: "Voir Mon Dossier",
        url: "/dashboard/patient/medical-records/view",
      },
    ],
  },
  {
    title: "Médecins & Centres",
    icon: Users,
    url: "/dashboard/patient/doctors",
    items: [
      {
        title: "Rechercher un Médecin",
        url: "/dashboard/patient/doctors/search",
      },
      {
        title: "Centres Médicaux",
        url: "/dashboard/patient/doctors/hospitals",
      },
      { title: "Mes Médecins", url: "/dashboard/patient/doctors/my-doctors" },
    ],
  },
  {
    title: "Avis & Feedback",
    icon: MessageSquare,
    url: "/dashboard/patient/reviews",
    items: [
      {
        title: "Donner un Avis",
        url: "/dashboard/patient/reviews/give-feedback",
      },
      { title: "Mes Avis", url: "/dashboard/patient/reviews/my-feedback" },
    ],
  },
  {
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/dashboard/patient/settings",
    items: [
      { title: "Mon Profil", url: "/dashboard/patient/settings/profile" },
      {
        title: "Sécurité & Confidentialité",
        url: "/dashboard/patient/settings/security",
      },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/dashboard/patient/support",
    items: [
      { title: "FAQs", url: "/dashboard/patient/support/faq" },
      { title: "Support Client", url: "/dashboard/patient/support/contact" },
    ],
  },
];

// Hospital Admin Navigation
export const hospitalAdminNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble de l'hôpital",
    url: "/dashboard/hopital_admin",
    items: [
      {
        title: "Aperçu",
        url: "/dashboard/hopital_admin/overview",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Gestion des Docteurs",
    icon: Stethoscope,
    url: "/dashboard/hopital_admin/doctors",
    items: [
      {
        title: "Liste des Docteurs",
        url: "/dashboard/hopital_admin/doctors/list",
      },
      {
        title: "Planning des Docteurs",
        url: "/dashboard/hopital_admin/doctors/schedule",
      },
    ],
  },
  {
    title: "Gestion des Patients",
    icon: Users,
    url: "/dashboard/hopital_admin/patients",
    items: [
      {
        title: "Liste des Patients",
        url: "/dashboard/hopital_admin/patients/list",
      },
      {
        title: "Dossiers Médicaux",
        url: "/dashboard/hopital_admin/patients/medical-records",
        icon: FolderHeart,
      },
    ],
  },
  {
    title: "Rendez-vous & Planning",
    icon: Calendar,
    url: "/dashboard/hopital_admin/appointments",
    items: [
      {
        title: "Tous les Rendez-vous",
        url: "/dashboard/hopital_admin/appointments/all",
      },
      {
        title: "Rendez-vous en Attente",
        url: "/dashboard/hopital_admin/appointments/pending",
      },
      {
        title: "Historique des Rendez-vous",
        url: "/dashboard/hopital_admin/appointments/history",
      },
    ],
  },
  {
    title: "Gestion de l’Hôpital",
    icon: ShieldCheck,
    url: "/dashboard/hopital_admin/management",
    items: [
      {
        title: "Informations de l’Hôpital",
        url: "/dashboard/hopital_admin/management/details",
      },
      {
        title: "Tarification & Abonnements",
        url: "/dashboard/hopital_admin/management/pricing",
      },
      {
        title: "Departements & Spécialités",
        url: "/dashboard/hopital_admin/management/services",
      },
      {
        title: "Commentaires & Avis",
        url: "/dashboard/hopital_admin/management/reviews",
      },
    ],
  },
  {
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/dashboard/hopital_admin/settings",
    items: [
      { title: "Mon Profil", url: "/dashboard/hopital_admin/settings/profile" },
      {
        title: "Sécurité & Confidentialité",
        url: "/dashboard/hopital_admin/settings/security",
      },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/dashboard/hopital_admin/support",
    items: [
      {
        title: "Centre d'Aide",
        url: "/dashboard/hopital_admin/support/help-center",
      },
      { title: "FAQs", url: "/dashboard/hopital_admin/support/faq" },
      {
        title: "Support Technique",
        url: "/dashboard/hopital_admin/support/contact",
      },
    ],
  },
];

// Hospital Doctor Navigation
export const hospitalDoctorNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble du médecin",
    url: "/dashboard/hopital_doctor",
    items: [
      {
        title: "Aperçu",
        url: "/dashboard/hopital_doctor/overview",
        icon: ClipboardList,
      },     
    ],
  },
  {
    title: "Mes Patients",
    icon: Users,
    url: "/dashboard/hopital_doctor/patients",
    items: [
      {
        title: "Liste des Patients",
        url: "/dashboard/hopital_doctor/patients/list",
      },
    ],
  },
  {
    title: "Rendez-vous",
    icon: Calendar,
    url: "/dashboard/hopital_doctor/appointments",
    items: [
      {
        title: "Mes Rendez-vous",
        url: "/dashboard/hopital_doctor/appointments/upcoming",
      },
      {
        title: "Historique des Rendez-vous",
        url: "/dashboard/hopital_doctor/appointments/history",
      },
    ],
  },
  {
    title: "Hôpital",
    icon: Stethoscope,
    url: "/dashboard/hopital_doctor/hospital",
    items: [
      {
        title: "Informations de l’Hôpital",
        url: "/dashboard/hopital_doctor/hospital/details",
      },
      { title: "Planning", url: "/dashboard/hopital_doctor/hospital/schedule" },
    ],
  },
  {
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/dashboard/hopital_admin/settings",
    items: [
      { title: "Mon Profil", url: "/dashboard/hopital_doctor/settings/profile" },
      {
        title: "Sécurité & Confidentialité",
        url: "/dashboard/hopital_doctor/settings/security",
      },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/dashboard/hopital_doctor/support",
    items: [
      {
        title: "Centre d'Aide",
        url: "/dashboard/hopital_doctor/support/help-center",
      },
      { title: "FAQs", url: "/dashboard/hopital_doctor/support/faq" },
      {
        title: "Support Technique",
        url: "/dashboard/hopital_doctor/support/contact",
      },
    ],
  },
];

export function getNavItems(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return superAdminNavItems;
    case "HOSPITAL_ADMIN":
      return hospitalAdminNavItems;
    case "INDEPENDENT_DOCTOR":
      return doctorNavItems;
    case "HOSPITAL_DOCTOR":
      return hospitalDoctorNavItems;
    case "PATIENT":
      return patientNavItems;
    default:
      return [];
  }
}
