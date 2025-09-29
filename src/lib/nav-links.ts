import { UserRole } from "@prisma/client";
import {
  BarChart,
  FileSignature,
  FileText,
  Users,
  ShieldCheck,
  LifeBuoy,
  Settings,
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
      {
        title: "Gestion des plans",
        url: "/dashboard/superadmin/subscriptions/plans",
      },
      {
        title: "Statistiques des revenus",
        url: "/dashboard/superadmin/subscriptions/revenue",
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
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/dashboard/superadmin/settings",
    items: [
      { title: "Mon Profil", url: "/dashboard/superadmin/settings/profile" },
      {
        title: "Sécurité & Confidentialité",
        url: "/dashboard/superadmin/settings/security",
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
    ],
  },
  {
    title: "Rendez-vous",
    icon: Calendar,
    url: "/dashboard/independant_doctor/appointments",
    items: [
      {
        title: "Tous les Rendez-vous",
        url: "/dashboard/independant_doctor/appointments/upcoming",
      },
    ],
  },
  {
    title: "Mes Disponibilités",
    icon: Calendar,
    url: "/dashboard/independant_doctor/avaibility",
    items: [
      {
        title: "Mes Disponibilités",
        url: "/dashboard/independant_doctor/avaibility/avaibilities",
      },
      {
        title: "Mon planning",
        url: "/dashboard/independant_doctor/avaibility/schedule",
      },
    ],
  },
  {
    title: "Mon Profil & Paramètres",
    icon: Settings,
    url: "/dashboard/independant_doctor/settings",
    items: [
      {
        title: "Mon Profile",
        url: "/dashboard/independant_doctor/settings/profile",
      },
      {
        title: "Abonnement",
        url: "/dashboard/independant_doctor/settings/pricing",
      },
      {
        title: "Sécurité & Confidentialité",
        url: "/dashboard/independant_doctor/settings/security",
      },
      {
        title: "Avis & Feedback",
        url: "/dashboard/independant_doctor/settings/reviews",
      },
    ],
  },
  {
    title: "Assistance & aide",
    icon: FileText,
    url: "/dashboard/independant_doctor/support",
    items: [
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
      {
        title: "Mes antécédents médicaux",
        url: "/dashboard/patient/medical-records/medical-history",
      },
    ],
  },
  {
    title: "Médecins & Hôpitaux",
    icon: Users,
    url: "/dashboard/patient/doctors",
    items: [
      {
        title: "Médecins",
        url: "/dashboard/patient/doctors/search",
      },
      {
        title: "Hôpitaux",
        url: "/dashboard/patient/doctors/hospitals",
      },
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
    title: "Gestion des Medecins",
    icon: Stethoscope,
    url: "/dashboard/hopital_admin/doctors",
    items: [
      {
        title: "Liste des Medecins",
        url: "/dashboard/hopital_admin/doctors/list",
      },
      {
        title: "Planning des Medecins",
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
        title: "Gestion de l'abonnement",
        url: "/dashboard/hopital_admin/management/pricing",
      },
      {
        title: "Departements & Spécialités",
        url: "/dashboard/hopital_admin/management/services",
      },
      {
        title: "Gestion des Disponibilités",
        url: "/dashboard/hopital_admin/management/avaibility",
      },
      {
        title: "Gestion des Avis",
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
    ],
  },
  {
    title: "Mes Disponibilités",
    icon: Calendar,
    url: "/dashboard/hopital_doctor/avaibility",
    items: [
      {
        title: "Mes Disponibilités",
        url: "/dashboard/hopital_doctor/avaibility/avaibilities",
      },
      {
        title: "Mon planning",
        url: "/dashboard/hopital_doctor/avaibility/schedule",
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
    ],
  },
  {
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/dashboard/hopital_admin/settings",
    items: [
      {
        title: "Mon Profil",
        url: "/dashboard/hopital_doctor/settings/profile",
      },
      {
        title: "Sécurité & Confidentialité",
        url: "/dashboard/hopital_doctor/settings/security",
      },
      {
        title: "Avis & Feedback",
        url: "/dashboard/hopital_doctor/settings/reviews",
      },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/dashboard/hopital_doctor/support",
    items: [
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
