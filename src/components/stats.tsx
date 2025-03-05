import { Users, Calendar, Stethoscope } from "lucide-react"; // Icônes pour les sections

export const stats = [
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