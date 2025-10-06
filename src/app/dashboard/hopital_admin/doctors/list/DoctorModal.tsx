"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Department {
  id: string;
  name: string;
}

interface SubscriptionInfo {
  plan: string;
  currentDoctors: number;
  maxDoctors: number | string;
}

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDoctorCreated?: () => void;
  departments?: Department[];
}

export default function DoctorModal({
  open,
  onOpenChange,
  onDoctorCreated,
  departments: initialDepartments,
}: DoctorModalProps) {
  const [departments, setDepartments] = useState<Department[]>(
    initialDepartments || []
  );
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    licenseNumber: "",
    education: "",
    experience: "",
    departmentId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    bio: "",
    genre: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // Réinitialiser les erreurs à l'ouverture
      setErrors({});

      // Charger les départements si non fournis
      if (!initialDepartments) {
        fetchDepartments();
      }

      // Charger les infos d'abonnement
      fetchSubscriptionInfo();
    }
  }, [open, initialDepartments]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital_admin/department");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error("Erreur chargement départements :", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les départements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      const res = await fetch(
        "/api/hospital_admin/subscription/getSuscriptionInfos"
      );
      const data = await res.json();

      if (res.ok) {
        setSubscriptionInfo({
          plan: data.plan,
          currentDoctors: data.currentDoctors,
          maxDoctors:
            data.maxDoctors === Infinity ? "Illimité" : data.maxDoctors,
        });
      } else {
        toast({
          title: "Avertissement",
          description: data.error || "Impossible de vérifier votre abonnement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur chargement abonnement :", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "name",
      "email",
      "phone",
      "password",
      "specialization",
      "licenseNumber",
      "genre",
    ];

    requiredFields.forEach((field) => {
      if (!form[field as keyof typeof form]) {
        newErrors[field] = "Ce champ est obligatoire";
      }
    });

    // Validation email
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email invalide";
    }

    // Validation téléphone
    if (
      form.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(form.phone)
    ) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    // Validation mot de passe
    if (form.password && form.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation N° Ordre des Médecins
    if (form.licenseNumber && !/^[A-Za-z0-9-]+$/.test(form.licenseNumber)) {
      newErrors.licenseNumber = "Format de N° Ordre du Médecins invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await fetch("/api/hospital_admin/doctors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création du médecin");
      }

      toast({
        title: "Succès",
        description: "Le médecin a été créé avec succès",
      });

      // Réinitialiser le formulaire
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialization: "",
        licenseNumber: "",
        education: "",
        experience: "",
        departmentId: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        bio: "",
        genre: "",
      });

      onOpenChange(false);
      if (onDoctorCreated) onDoctorCreated();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Ajouter un nouveau médecin
          </DialogTitle>
          {subscriptionInfo && (
            <DialogDescription className="text-sm text-gray-600">
              Votre abonnement:{" "}
              <span className="font-medium">{subscriptionInfo.plan}</span> •
              Médecins:{" "}
              <span className="font-medium">
                {subscriptionInfo.currentDoctors}/{subscriptionInfo.maxDoctors}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne 1 - Informations de base */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              </div>
            </div>

            {/* Colonne 2 - Informations professionnelles */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="specialization">
                  Spécialisation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className={errors.specialization ? "border-red-500" : ""}
                />
                {errors.specialization && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.specialization}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="licenseNumber">
                  N° Ordre des Médecins <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  className={errors.licenseNumber ? "border-red-500" : ""}
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.licenseNumber}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="genre">
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange("genre", value)}
                  value={form.genre}
                >
                  <SelectTrigger
                    className={errors.genre ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Sélectionnez un genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Homme</SelectItem>
                    <SelectItem value="FEMALE">Femme</SelectItem>
                  </SelectContent>
                </Select>
                {errors.genre && (
                  <p className="text-sm text-red-500 mt-1">{errors.genre}</p>
                )}
              </div>
            </div>
          </div>

          {/* Deuxième ligne - Département et localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="departmentId">Département</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("departmentId", value)
                }
                value={form.departmentId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loading ? "Chargement..." : "Sélectionnez un département"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Adresse complète */}
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* État et code postal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="state">État/Région</Label>
              <Input
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Code postal</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Éducation et expérience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="education">Formation</Label>
              <Textarea
                id="education"
                name="education"
                value={form.education}
                onChange={handleChange}
                rows={3}
                placeholder="Diplômes, universités..."
              />
            </div>
            <div>
              <Label htmlFor="experience">Expérience professionnelle</Label>
              <Textarea
                id="experience"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows={3}
                placeholder="Postes précédents, années d'expérience..."
              />
            </div>
          </div>

          {/* Bio et avatar */}
          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Présentation du médecin..."
            />
          </div>

          {/* Boutons de soumission */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitLoading}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitLoading}
              className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
