'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building, Bed, Stethoscope, HeartPulse, Phone, MapPin, Users, Activity } from "lucide-react";
import { useTheme } from "next-themes";

export default function HospitalInfoPage() {
  const { theme } = useTheme(); // Détecter le thème actuel

  // Données de l'hôpital (simulées)
  const hospital = {
    name: "Hôpital Général de Paris",
    description: "L'Hôpital Général de Paris est un établissement de santé de premier plan, offrant des soins de qualité depuis 1850. Nous nous engageons à fournir des soins complets et personnalisés à nos patients.",
    beds: 500,
    patientsTreated: 12000,
    services: [
      "Cardiologie",
      "Chirurgie",
      "Pédiatrie",
      "Oncologie",
      "Radiologie",
      "Urgences",
    ],
    equipment: [
      "Scanner IRM",
      "Tomographe",
      "Échographe",
      "Salle d'opération robotisée",
      "Laboratoire d'analyses",
    ],
    contact: {
      phone: "+33 1 23 45 67 89",
      email: "contact@hopitalparis.fr",
      address: "123 Rue de la Santé, 75015 Paris, France",
    },
  };

  // Couleurs conditionnelles en fonction du thème
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";
  const secondaryTextColor = theme === "dark" ? "text-gray-300" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`p-6 space-y-6 min-h-screen ${bgColor}`}>
      {/* En-tête */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>{hospital.name}</h1>
        <p className={`text-sm ${secondaryTextColor} mt-2`}>{hospital.description}</p>
      </div>

      {/* Section : Aperçu général */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Building className="w-6 h-6 text-blue-500" />
            Aperçu général
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Bed className="w-8 h-8 text-green-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.beds} lits</p>
              <p className={`text-sm ${secondaryTextColor}`}>Capacité d&apos;accueil</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.patientsTreated} patients traités</p>
              <p className={`text-sm ${secondaryTextColor}`}>En 2023</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section : Services disponibles */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Stethoscope className="w-6 h-6 text-red-500" />
            Services disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospital.services.map((service, index) => (
              <li
                key={index}
                className={`p-3 border ${borderColor} rounded-md flex items-center gap-2`}
              >
                <HeartPulse className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${textColor}`}>{service}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Équipements */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Activity className="w-6 h-6 text-orange-500" />
            Équipements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospital.equipment.map((equipment, index) => (
              <li
                key={index}
                className={`p-3 border ${borderColor} rounded-md flex items-center gap-2`}
              >
                <Activity className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${textColor}`}>{equipment}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Contacts */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Phone className="w-6 h-6 text-purple-500" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Phone className="w-6 h-6 text-blue-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.contact.phone}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Téléphone</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="w-6 h-6 text-green-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.contact.address}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Adresse</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}