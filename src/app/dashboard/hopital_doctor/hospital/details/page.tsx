'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building, Stethoscope, Phone, MapPin, Users,  Calendar, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HospitalData {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  stats: {
    doctors: number;
    appointments: number;
    departments: number;
  };
  departments: Array<{
    name: string;
    description?: string;
    doctorsCount: number;
  }>;
}

export default function HospitalInfoPage() {
  const { theme } = useTheme();
  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const response = await fetch('/api/hospital_doctor/hospital');
        if (!response.ok) {
          throw new Error('Erreur de chargement des données');
        }
        const data = await response.json();
        setHospital(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";
  const secondaryTextColor = theme === "dark" ? "text-gray-300" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  if (loading) return <div className={`p-6 ${bgColor}`}>Chargement...</div>;
  if (error) return <div className={`p-6 ${bgColor}`}>Erreur: {error}</div>;
  if (!hospital) return <div className={`p-6 ${bgColor}`}>Aucune donnée disponible</div>;

  return (
    <div className={`p-6 space-y-6 min-h-screen ${bgColor}`}>
      {/* En-tête avec logo */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>{hospital.name}</h1>
        {hospital.description && (
          <p className={`text-sm ${secondaryTextColor} mt-2`}>{hospital.description}</p>
        )}
      </div>

      {/* Statistiques */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Building className="w-6 h-6 text-blue-500" />
            Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.stats.doctors}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Médecins</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.stats.appointments}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Rendez-vous</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <Building className="w-8 h-8 text-orange-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>{hospital.stats.departments}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Départements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Départements */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Stethoscope className="w-6 h-6 text-red-500" />
            Départements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospital.departments.map((dept, index) => (
              <li
                key={index}
                className={`p-4 border ${borderColor} rounded-md`}
              >
                <h3 className={`font-medium ${textColor}`}>{dept.name}</h3>
                {dept.description && (
                  <p className={`text-sm mt-1 ${secondaryTextColor}`}>{dept.description}</p>
                )}
                <div className="flex items-center mt-2 gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${secondaryTextColor}`}>
                    {dept.doctorsCount} médecin{dept.doctorsCount > 1 ? 's' : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Phone className="w-6 h-6 text-purple-500" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <MapPin className="w-6 h-6 text-green-500" />
            <div>
              <p className={`text-lg font-medium ${textColor}`}>{hospital.address}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Adresse</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-6 h-6 text-blue-500" />
            <div>
              <p className={`text-lg font-medium ${textColor}`}>{hospital.phone}</p>
              <p className={`text-sm ${secondaryTextColor}`}>Téléphone</p>
            </div>
          </div>
          {hospital.website && (
            <div className="flex items-center gap-4">
              <Globe className="w-6 h-6 text-black-500" />
              <div>
                <a 
                  href={hospital.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-lg font-medium text-blue-500 hover:underline`}
                >
                  {hospital.website}
                </a>
                <p className={`text-sm ${secondaryTextColor}`}>Site web</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}