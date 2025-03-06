import {
  BarChart,
  Database,
  FileSignature,
  FileText,
  Users,
  ShieldCheck,
  Server,
  Activity,
  LifeBuoy,
  Settings,
  Bell,
  Calendar,
  ClipboardList,
  FolderHeart,
  MessageSquare,
  UserCheck,
  Heart,
  UserPlus,
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
      {
        title: "Statistiques & Analyse",
        url: "/dashboard/superadmin/statistics",
        icon: FileText,
      },
      {
        title: "Rapports",
        url: "/dashboard/superadmin/reports",
        icon: FileText,
      },
      {
        title: "Logs d'activité",
        url: "/dashboard/superadmin/activity-logs",
        icon: Activity,
      },
    ],
  },
  {
    title: "Utilisateurs & Subscriptions",
    icon: Users,
    url: "/dashboard/superadmin/users",
    items: [
      { title: "Patients", url: "/dashboard/superadmin/users/patients" },
      { title: "Docteurs", url: "/dashboard/superadmin/users/doctors" },
      { title: "Hôpitaux", url: "/dashboard/superadmin/users/hospitals" },
      {
        title: "Abonnements",
        url: "/dashboard/superadmin/users/subscriptions",
      },
      {
        title: "Demandes de vérifications",
        url: "/dashboard/superadmin/users/verifications",
      },
      {
        title: "Rôles & Permissions",
        url: "/dashboard/superadmin/users/roles-permissions",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Système & Paramètres",
    url: "/dashboard/superadmin/system",
    icon: Database,
    items: [
      {
        title: "Paramètres",
        url: "/system/settings",
        icon: Settings,
      },
      { title: "Logs", url: "/dashboard/superadmin/system/logs" },
      { title: "Sauvegardes", url: "/dashboard/superadmin/system/backups" },
      {
        title: "Performances",
        url: "/dashboard/superadmin/system/performance",
      },
      { title: "Sécurité", url: "/dashboard/superadmin/system/security" },
      {
        title: "Intégrations API",
        url: "/dashboard/superadmin/system/api-integrations",
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
      {
        title: "Pages Statique",
        url: "/dashboard/superadmin/content/static-pages",
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
  {
    title: "Serveur & Infrastructure",
    icon: Server,
    url: "/dashboard/superadmin/server",
    items: [
      {
        title: "Statut du serveur",
        url: "/dashboard/superadmin/server/status",
      },
      { title: "Logs du serveur", url: "/dashboard/superadmin/server/logs" },
      { title: "Maintenance", url: "/dashboard/superadmin/server/maintenance" },
      {
        title: "Base de données",
        url: "/dashboard/superadmin/server/database",
      },
    ],
  },
];

// Doctor Navigation
export const doctorNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble du médecin",
    url: "/doctor/dashboard",
    items: [
      {
        title: "Aperçu",
        url: "/doctor/dashboard/overview",
        icon: ClipboardList,
      },
      {
        title: "Statistiques & Analyse",
        url: "/doctor/dashboard/statistics",
        icon: FileText,
      },
      {
        title: "Avis & Retours",
        url: "/doctor/dashboard/reviews",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Mes Patients",
    icon: Users,
    url: "/doctor/patients",
    items: [
      { title: "Liste des Patients", url: "/doctor/patients/list" },
      {
        title: "Dossiers Médicaux",
        url: "/doctor/patients/medical-records",
        icon: FolderHeart,
      },
      { title: "Demandes Spéciales", url: "/doctor/patients/requests" },
    ],
  },
  {
    title: "Rendez-vous",
    icon: Calendar,
    url: "/doctor/appointments",
    items: [
      { title: "Tous les Rendez-vous", url: "/doctor/appointments/all" },
      { title: "Prochains Rendez-vous", url: "/doctor/appointments/upcoming" },
      {
        title: "Historique des Rendez-vous",
        url: "/doctor/appointments/history",
      },
    ],
  },
  {
    title: "Mon Profil & Paramètres",
    icon: Settings,
    url: "/doctor/profile",
    items: [
      { title: "Mon Profil", url: "/doctor/profile/details" },
      { title: "Disponibilités", url: "/doctor/profile/availability" },
      { title: "Tarification", url: "/doctor/profile/pricing" },
      { title: "Paramètres", url: "/doctor/profile/settings" },
    ],
  },
  {
    title: "Documentation & Assistance",
    icon: FileText,
    url: "/doctor/support",
    items: [
      { title: "Centre d'Aide", url: "/doctor/support/help-center" },
      { title: "FAQs", url: "/doctor/support/faq" },
      { title: "Support Technique", url: "/doctor/support/contact" },
    ],
  },
];

// Patient Navigation
export const patientNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble du patient",
    url: "/patient/dashboard",
    items: [
      {
        title: "Aperçu",
        url: "/patient/dashboard/overview",
        icon: UserCheck,
      },
      {
        title: "Statistiques & Suivi",
        url: "/patient/dashboard/statistics",
        icon: FileText,
      },
    ],
  },
  {
    title: "Mes Rendez-vous",
    icon: Calendar,
    url: "/patient/appointments",
    items: [
      { title: "Prochains Rendez-vous", url: "/patient/appointments/upcoming" },
      {
        title: "Historique des Rendez-vous",
        url: "/patient/appointments/history",
      },
      { title: "Prendre un Rendez-vous", url: "/patient/appointments/book" },
    ],
  },
  {
    title: "Mon Dossier Médical",
    icon: FolderHeart,
    url: "/patient/medical-records",
    items: [
      { title: "Voir Mon Dossier", url: "/patient/medical-records/view" },
      { title: "Mises à jour", url: "/patient/medical-records/updates" },
    ],
  },
  {
    title: "Médecins & Centres de Santé",
    icon: Users,
    url: "/patient/doctors",
    items: [
      { title: "Rechercher un Médecin", url: "/patient/doctors/search" },
      { title: "Centres Médicaux", url: "/patient/doctors/hospitals" },
      { title: "Mes Médecins", url: "/patient/doctors/my-doctors" },
    ],
  },
  {
    title: "Avis & Feedback",
    icon: MessageSquare,
    url: "/patient/reviews",
    items: [
      { title: "Donner un Avis", url: "/patient/reviews/give-feedback" },
      { title: "Mes Avis", url: "/patient/reviews/my-feedback" },
    ],
  },
  {
    title: "Abonnement & Services",
    icon: Heart,
    url: "/patient/subscription",
    items: [
      { title: "Mon Abonnement", url: "/patient/subscription/details" },
      { title: "Mettre à Niveau", url: "/patient/subscription/upgrade" },
    ],
  },
  {
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/patient/settings",
    items: [
      { title: "Mon Profil", url: "/patient/settings/profile" },
      {
        title: "Sécurité & Confidentialité",
        url: "/patient/settings/security",
      },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/patient/support",
    items: [
      { title: "Centre d'Aide", url: "/patient/support/help-center" },
      { title: "FAQs", url: "/patient/support/faq" },
      { title: "Support Client", url: "/patient/support/contact" },
    ],
  },
];

// Hospital Admin Navigation
export const hospitalAdminNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble de l'hôpital",
    url: "/hospital-admin/dashboard",
    items: [
      {
        title: "Aperçu",
        url: "/hospital-admin/dashboard/overview",
        icon: ClipboardList,
      },
      {
        title: "Statistiques & Analyse",
        url: "/hospital-admin/dashboard/statistics",
        icon: FileText,
      },
      {
        title: "Rapports & Activité",
        url: "/hospital-admin/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Gestion des Docteurs",
    icon: Stethoscope,
    url: "/hospital-admin/doctors",
    items: [
      { title: "Liste des Docteurs", url: "/hospital-admin/doctors/list" },
      {
        title: "Ajouter un Docteur",
        url: "/hospital-admin/doctors/add",
        icon: UserPlus,
      },
      {
        title: "Planning des Docteurs",
        url: "/hospital-admin/doctors/schedule",
      },
    ],
  },
  {
    title: "Gestion des Patients",
    icon: Users,
    url: "/hospital-admin/patients",
    items: [
      { title: "Liste des Patients", url: "/hospital-admin/patients/list" },
      {
        title: "Dossiers Médicaux",
        url: "/hospital-admin/patients/medical-records",
        icon: FolderHeart,
      },
      { title: "Demandes Spéciales", url: "/hospital-admin/patients/requests" },
    ],
  },
  {
    title: "Rendez-vous & Planning",
    icon: Calendar,
    url: "/hospital-admin/appointments",
    items: [
      {
        title: "Tous les Rendez-vous",
        url: "/hospital-admin/appointments/all",
      },
      {
        title: "Rendez-vous en Attente",
        url: "/hospital-admin/appointments/pending",
      },
      {
        title: "Historique des Rendez-vous",
        url: "/hospital-admin/appointments/history",
      },
    ],
  },
  {
    title: "Gestion de l’Hôpital",
    icon: ShieldCheck,
    url: "/hospital-admin/management",
    items: [
      {
        title: "Informations de l’Hôpital",
        url: "/hospital-admin/management/details",
      },
      {
        title: "Services & Spécialités",
        url: "/hospital-admin/management/services",
      },
      {
        title: "Infrastructure & Équipements",
        url: "/hospital-admin/management/infrastructure",
      },
    ],
  },
  {
    title: "Paramètres & Sécurité",
    icon: Settings,
    url: "/hospital-admin/settings",
    items: [
      { title: "Mon Profil", url: "/hospital-admin/settings/profile" },
      {
        title: "Sécurité & Confidentialité",
        url: "/hospital-admin/settings/security",
      },
      { title: "Utilisateurs & Accès", url: "/hospital-admin/settings/access" },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/hospital-admin/support",
    items: [
      { title: "Centre d'Aide", url: "/hospital-admin/support/help-center" },
      { title: "FAQs", url: "/hospital-admin/support/faq" },
      { title: "Support Technique", url: "/hospital-admin/support/contact" },
    ],
  },
];

// Hospital Doctor Navigation
export const hospitalDoctorNavItems = [
  {
    title: "Tableau de bord",
    icon: BarChart,
    description: "Vue d'ensemble du médecin",
    url: "/hospital-doctor/dashboard",
    items: [
      {
        title: "Aperçu",
        url: "/hospital-doctor/dashboard/overview",
        icon: ClipboardList,
      },
      {
        title: "Statistiques & Analyse",
        url: "/hospital-doctor/dashboard/statistics",
        icon: FileText,
      },
    ],
  },
  {
    title: "Mes Patients",
    icon: Users,
    url: "/hospital-doctor/patients",
    items: [
      { title: "Liste des Patients", url: "/hospital-doctor/patients/list" },
      {
        title: "Dossiers Médicaux",
        url: "/hospital-doctor/patients/medical-records",
        icon: FolderHeart,
      },
    ],
  },
  {
    title: "Rendez-vous",
    icon: Calendar,
    url: "/hospital-doctor/appointments",
    items: [
      {
        title: "Mes Rendez-vous",
        url: "/hospital-doctor/appointments/upcoming",
      },
      {
        title: "Historique des Rendez-vous",
        url: "/hospital-doctor/appointments/history",
      },
    ],
  },
  {
    title: "Hôpital",
    icon: Stethoscope,
    url: "/hospital-doctor/hospital",
    items: [
      {
        title: "Informations de l’Hôpital",
        url: "/hospital-doctor/hospital/details",
      },
      { title: "Planning", url: "/hospital-doctor/hospital/schedule" },
    ],
  },
  {
    title: "Assistance & Aide",
    icon: LifeBuoy,
    url: "/hospital-doctor/support",
    items: [
      { title: "Centre d'Aide", url: "/hospital-doctor/support/help-center" },
      { title: "FAQs", url: "/hospital-doctor/support/faq" },
      { title: "Support Technique", url: "/hospital-doctor/support/contact" },
    ],
  },
];

export function getNavItems(role: string) {
  switch (role) {
    case "super_admin":
      return superAdminNavItems;
    case "hospital_admin":
      return hospitalAdminNavItems;
    case "independent_doctor":
      return doctorNavItems;
    case "hospital_doctor":
      return hospitalAdminNavItems;
    case "patient":
      return patientNavItems;
    default:
      return [];
  }
}
