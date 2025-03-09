import { CreditCard, FileText, User } from "lucide-react";

export const appointmentsData = [
    {
      id: 1,
      patient: "Salia Keita",
      doctor: "Dr. Martin",
      department: "Cardiologie",
      date: "2023-10-15",
      time: "10:00",
      reason: "Consultation de routine",
      status: "Confirmé",
    },
    {
      id: 2,
      patient: "Oumar Diallo",
      doctor: "Dr. Sophie",
      department: "Dermatologie",
      date: "2023-10-14",
      time: "14:30",
      reason: "Problème de peau",
      status: "En attente",
    },
    {
      id: 3,
      patient: "Seydou Dolo",
      doctor: "Dr. Lucie",
      department: "Orthopédie",
      date: "2023-10-13",
      time: "09:00",
      reason: "Douleur articulaire",
      status: "Annulé",
    },
    {
      id: 4,
      patient: "Youssouf Sylla",
      doctor: "Dr. Thomas",
      department: "Pédiatrie",
      date: "2023-10-12",
      time: "11:15",
      reason: "Vaccination",
      status: "Confirmé",
    },
    {
      id: 5,
      patient: "Demba Yara",
      doctor: "Dr. Jean",
      department: "Gynécologie",
      date: "2023-10-11",
      time: "16:45",
      reason: "Examen annuel",
      status: "Confirmé",
    },
    {
      id: 6,
      patient: "Lassana Cisse",
      doctor: "Dr. Marie",
      department: "Neurologie",
      date: "2023-10-10",
      time: "08:30",
      reason: "Maux de tête persistants",
      status: "En attente",
    },
  ];


export const patientStats = [
  { title: "Total Consultations", value: "12", description: "Consultations terminées", icon: <FileText /> },
  { title: "Médecins Visités", value: "5", description: "Nombre total de médecins consultés", icon: <User /> },
  { title: "Paiements Effectués", value: "150000", description: "Total des paiements effectués", icon: <CreditCard /> }
];

export const patientAppointments = [
  { id: 1, doctor: "Dr. Aly Coulibaly", specialty: "Medecin Genéraliste", date: "2025-03-10", status: "En attente" },
  { id: 2, doctor: "Dr. Alou Koné", specialty: "Cardiologie", date: "2025-02-20", status: "Annulé" },
  { id: 3, doctor: "Dr. Oumar Koîta", specialty: "Dermatologie", date: "2025-01-15", status: "Terminé" }
];