"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Star,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

type Hospital = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    doctors: number;
    departments: number;
    appointments: number;
    medicalRecords: number;
    reviews: number;
  };
};

export default function HospitalInfo() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Hospital>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await fetch("/api/hospital_admin/hospital");
        const data = await res.json();
        setHospital(data.hospital);
        setFormData(data.hospital);
      } catch (error) {
        console.error("Erreur récupération hôpital:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la récupération des informations de l'hôpital.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hospital_admin/hospital/modify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      setEditing(false);
      toast({
        title: "Succès",
        description:
          "Les informations de l'hôpital ont été mises à jour avec succès.",
        variant: "default",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour des informations.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Skeleton placeholders for loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Aucun hôpital trouvé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Veuillez vérifier votre connexion ou contacter le support
              technique.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 space-y-6">
      {/* Header avec titre et boutons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Profil de l&apos;hôpital
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestion des informations et paramètres de votre établissement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => setEditing(!editing)}
            className="gap-2"
          >
            {editing ? (
              <>
                <span>Annuler</span>
              </>
            ) : (
              <>
                <span>Modifier</span>
              </>
            )}
          </Button>
          {editing && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-6">
            {hospital.logoUrl ? (
              <Image
                src={hospital.logoUrl}
                alt={hospital.name}
                width={96}
                height={96}
                className="object-cover rounded-lg border shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg border shadow-sm flex items-center justify-center bg-muted">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            <div className="space-y-2">
              {editing ? (
                <Input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="text-xl font-bold"
                />
              ) : (
                <CardTitle className="text-2xl font-bold">
                  {hospital.name}
                </CardTitle>
              )}
              <div className="flex items-center gap-2">
                <Badge variant={hospital.isVerified ? "default" : "outline"}>
                  {hospital.isVerified ? "Vérifié" : "Non vérifié"}
                </Badge>
                {editing ? (
                  <div className="flex gap-2">
                    <Input
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      placeholder="Ville"
                      className="w-32"
                    />
                    <Input
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      placeholder="Pays"
                      className="w-32"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hospital.city}, {hospital.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coordonnées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Coordonnées</span>
            </CardTitle>
            <CardDescription>
              Informations de contact de l&apos;hôpital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              {editing ? (
                <Input
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                />
              ) : (
                <a
                  href={`mailto:${hospital.email}`}
                  className="hover:underline"
                >
                  {hospital.email}
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              {editing ? (
                <Input
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
              ) : (
                <a href={`tel:${hospital.phone}`} className="hover:underline">
                  {hospital.phone}
                </a>
              )}
            </div>

            {hospital.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                {editing ? (
                  <Input
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <a
                    href={
                      hospital.website.startsWith("http")
                        ? hospital.website
                        : `https://${hospital.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {hospital.website}
                  </a>
                )}
              </div>
            )}

            <Separator />

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
              <div className="space-y-2">
                {editing ? (
                  <>
                    <Input
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      placeholder="Adresse"
                    />
                    <div className="flex gap-2">
                      <Input
                        name="zipCode"
                        value={formData.zipCode || ""}
                        onChange={handleChange}
                        placeholder="Code postal"
                      />
                      <Input
                        name="state"
                        value={formData.state || ""}
                        onChange={handleChange}
                        placeholder="État/Région"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p>{hospital.address}</p>
                    <p className="text-muted-foreground">
                      {hospital.zipCode}, {hospital.state}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Présentation de votre établissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="min-h-[150px]"
                placeholder="Décrivez votre hôpital, ses spécialités, ses valeurs..."
              />
            ) : hospital.description ? (
              <p className="text-muted-foreground whitespace-pre-line">
                {hospital.description}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                Aucune description disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Activité de votre établissement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <StatCard
              icon={<Building2 className="w-6 h-6" />}
              value={hospital._count.doctors}
              label="Médecins"
            />
            <StatCard
              icon={<FileText className="w-6 h-6" />}
              value={hospital._count.departments}
              label="Départements"
            />
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              value={hospital._count.appointments}
              label="Rendez-vous"
            />
            <StatCard
              icon={<FileText className="w-6 h-6" />}
              value={hospital._count.medicalRecords}
              label="Dossiers"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              value={hospital._count.reviews}
              label="Avis"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
