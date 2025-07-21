"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Info,
  Globe,
  Save,
  ScrollText,
  Cake,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type AdminData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  dateOfBirth: string | null; // Format ISO-8601 (ex: "1990-01-01T00:00:00.000Z")
  profile: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    bio: string;
    avatarUrl: string | null;
    genre: string;
  };
  createdAt: string;
};

export default function ProfilePage() {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    genre: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    dateOfBirth: "",
  });

  // Synchronise le formulaire quand les données admin changent
  useEffect(() => {
    if (admin) {
      setForm({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        genre: admin.profile.genre,
        bio: admin.profile.bio,
        address: admin.profile.address,
        city: admin.profile.city,
        state: admin.profile.state,
        zipCode: admin.profile.zipCode,
        country: admin.profile.country,
        dateOfBirth: admin.dateOfBirth ? admin.dateOfBirth.split("T")[0] : "",
      });
    }
  }, [admin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hospital_admin/profil");

      if (!res.ok) throw new Error("Failed to fetch admin data");

      const data = await res.json();
      setAdmin(data.admin);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Erreur ❌",
        description: "Impossible de charger les données du profil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Formatage de la date pour l'envoyer au serveur
      const formattedData = {
        ...form,
        dateOfBirth: form.dateOfBirth
          ? `${form.dateOfBirth}T00:00:00.000Z`
          : null,
      };

      const res = await fetch("/api/hospital_admin/profil/modify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      // Rafraîchir les données après la mise à jour
      await fetchAdminData();

      toast({
        title: "Profil mis à jour ✅",
        description: "Vos informations ont bien été enregistrées.",
      });
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: "Erreur ❌",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-2 sm:p-4 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-5 w-80" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column skeleton */}
          <Card className="col-span-1">
            <CardContent className="flex flex-col items-center text-center py-8 space-y-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 w-full mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Right column skeleton */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            {/* Personal info skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Address skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Bio skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!admin)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">
          Impossible de charger les données du profil
        </p>
        <Button variant="outline" className="mt-4" onClick={fetchAdminData}>
          Réessayer
        </Button>
      </div>
    );

  return (
    <div className="p-2 sm:p-4 max-w-6xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="w-6 h-6" /> Mon Profil
      </h1>
      <p className="text-muted-foreground">
        Gérez vos informations personnelles et médicales
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Aperçu */}
        <Card className="col-span-1">
          <CardContent className="flex flex-col items-center text-center py-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
              {admin.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <h2 className="mt-4 text-xl font-semibold">{admin.name}</h2>
            <p className="text-sm text-muted-foreground">
              Membre depuis{" "}
              {new Date(admin.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="mt-4 text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {admin.phone || "Non renseigné"}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {admin.profile.city
                  ? `${admin.profile.city}, ${admin.profile.country}`
                  : "Adresse non renseignée"}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {admin.profile.genre === "MALE"
                  ? "Homme"
                  : admin.profile.genre === "FEMALE"
                    ? "Femme"
                    : "Non spécifié"}
              </div>
              {admin.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Cake className="h-4 w-4" />
                  {new Date(admin.dateOfBirth).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column - Formulaire */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" /> Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  <User className="inline w-4 h-4 mr-1" /> Nom complet
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label>
                  <Mail className="inline w-4 h-4 mr-1" /> Email
                </Label>
                <Input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label>
                  <Phone className="inline w-4 h-4 mr-1" /> Téléphone
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Genre</Label>
                <Select
                  value={form.genre}
                  onValueChange={(value) => handleChange("genre", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Homme</SelectItem>
                    <SelectItem value="FEMALE">Femme</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  <Cake className="inline w-4 h-4 mr-1" /> Date de naissance
                </Label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" /> Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Adresse</Label>
                <Input
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Rue Principale"
                />
              </div>
              <div>
                <Label>Ville</Label>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Paris"
                />
              </div>
              <div>
                <Label>Code postal</Label>
                <Input
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  placeholder="75000"
                />
              </div>
              <div>
                <Label>Pays</Label>
                <Input
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="France"
                />
              </div>
              <div>
                <Label>État / Région</Label>
                <Input
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Île-de-France"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="w-5 h-5" /> Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Décrivez-vous en quelques mots..."
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Vous pouvez mentionner vos centres d&apos;intérêt, votre
                parcours, ou toute information pertinente.
              </p>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Enregistrer les
                  modifications
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
