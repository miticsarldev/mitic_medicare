"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createPatient } from "@/app/actions/patient-actions";
import { Patient } from "@/types/patient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BloodType } from "@prisma/client";
import { EyeOff, Eye } from "lucide-react";

interface PatientCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  patient?: Patient | null;
  onSuccess: () => void;
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string; // yyyy-mm-dd
  gender: "MALE" | "FEMALE";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bloodType: "" | BloodType;
  allergies: string; // CSV in UI
  emergencyContact: string;
  emergencyPhone: string;
  isActive: boolean;
};

export default function PatientCreateEditModal({
  isOpen,
  onClose,
  mode,
  patient,
  onSuccess,
}: PatientCreateEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    gender: "MALE", // ✅ enum value, not label
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    bloodType: "",
    allergies: "",
    emergencyContact: "",
    emergencyPhone: "",
    isActive: true,
  });

  // Initialize form
  useEffect(() => {
    if (mode === "edit" && patient) {
      setFormData({
        name: patient.user.name || "",
        email: patient.user.email || "",
        phone: patient.user.phone || "",
        password: "", // Don't populate password for security reasons
        dateOfBirth: patient.user.dateOfBirth
          ? new Date(patient.user.dateOfBirth).toISOString().split("T")[0]
          : "",
        // ✅ keep enum in state
        gender: (patient.user.profile?.genre as "MALE" | "FEMALE") || "MALE",
        address: patient.user.profile?.address || "",
        city: patient.user.profile?.city || "",
        state: patient.user.profile?.state || "",
        zipCode: patient.user.profile?.zipCode || "",
        country: patient.user.profile?.country || "",
        bloodType: (patient.bloodType as BloodType) || "",
        allergies: Array.isArray(patient.allergies)
          ? patient.allergies.join(", ")
          : (patient.allergies as unknown as string) || "",
        emergencyContact: patient.emergencyContact || "",
        emergencyPhone: patient.emergencyPhone || "",
        isActive: patient.user.isActive,
      });
    } else if (isOpen) {
      // Reset on open for create
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        dateOfBirth: "",
        gender: "MALE",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        bloodType: "",
        allergies: "",
        emergencyContact: "",
        emergencyPhone: "",
        isActive: true,
      });
    }
  }, [patient, mode, isOpen]);

  const calculateBoundaryDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is 0-indexed
    const day = today.getDate();

    // Helper to format as YYYY-MM-DD
    const formatDate = (d: Date) => {
      return d.toISOString().split("T")[0];
    };

    // 1. Max Date (Minimum Age of 14)
    // The birth date must be 14 years ago or earlier.
    const maxAgeDate = new Date(year - 14, month - 1, day);
    const maxDate = formatDate(maxAgeDate);

    // 2. Min Date (Maximum Age of 150)
    // The birth date must be no earlier than 150 years ago.
    const minAgeDate = new Date(year - 150, month - 1, day);
    const minDate = formatDate(minAgeDate);

    return { maxDate, minDate };
  };

  const { maxDate, minDate } = calculateBoundaryDates();

  // Inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSelectChange = <K extends keyof FormState>(
    name: K,
    value: string
  ) => {
    // Cast types properly for special cases
    if (name === "isActive") {
      setFormData((s) => ({ ...s, isActive: value === "true" }));
    } else if (name === "bloodType") {
      setFormData((s) => ({ ...s, bloodType: value as BloodType | "" }));
    } else if (name === "gender") {
      setFormData((s) => ({ ...s, gender: value as "MALE" | "FEMALE" }));
    } else {
      setFormData((s) => ({ ...s, [name]: value }) as FormState);
    }
  };

  const validateRequired = () => {
    if (!formData.name || !formData.email || !formData.phone) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequired()) {
      toast({
        title: "Champs requis",
        description: "Nom, email, téléphone (à la création) sont requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "create") {
        // Server action expects FormData (leave gender as enum "MALE"/"FEMALE")
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            fd.append(k, String(v));
          }
        });
        // Flatten CSV lists for create API if it expects strings:
        // (already strings in state)
        const result = await createPatient(fd);

        if (result?.error) {
          toast({
            title: "Erreur",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({ title: "Succès", description: "Patient créé avec succès." });
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && patient) {
        // Update existing patient
        const response = await fetch(`/api/superadmin/patients/${patient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            isActive: formData.isActive,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            gender: formData.gender,
            bloodType: formData.bloodType,
            allergies: formData.allergies.split(",").map((item) => item.trim()),
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
          }),
        });

        if (!response.ok) throw new Error("Failed to update patient");

        toast({ title: "Succès", description: "Patient modifié avec succès." });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les données du patient.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Ajouter un nouveau patient"
              : "Modifier le patient"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouveau compte patient en remplissant le formulaire ci-dessous"
              : `Modifiez les informations du patient ${patient?.user.name}`}
            {/* ✅ FIX: Change <div> to <span>.
      You might need to adjust CSS if the original div relied on block behavior,
      but for simple text, <span> is semantically correct here. */}
            <span className="text-xs text-muted-foreground mt-1 block">
              {/* Adding 'block' class if the layout requires it to act like a block on a new line */}
              Les champs marqués d&lsquo;un{" "}
              <span className="text-red-500">*</span> sont obligatoires
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 md:grid-cols-2 px-0.5">
              {/* Left */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">
                    Nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>

                {mode === "create" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <p className="text-xs text-muted-foreground">
                      Définir un mot de passe ou laisser vide pour que le
                      patient puisse le définir lui-même (lien via email)
                    </p>
                    <div className="relative">
                      {/* Use a relative container for positioning */}
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        aria-required="true"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {/* 👇 DYNAMIC ICON */}
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date de naissance <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    max={maxDate}
                    min={minDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Genre <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Sélectionner un genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* store enum values, display FR labels */}
                      <SelectItem value="MALE">Homme</SelectItem>
                      <SelectItem value="FEMALE">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
              </div>

              {/* Right */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="state">Région</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="zipCode">Code postal</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bloodType">Groupe sanguin</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) =>
                      handleSelectChange("bloodType", value)
                    }
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Sélectionner un groupe sanguin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A_POSITIVE">A+</SelectItem>
                      <SelectItem value="A_NEGATIVE">A-</SelectItem>
                      <SelectItem value="B_POSITIVE">B+</SelectItem>
                      <SelectItem value="B_NEGATIVE">B-</SelectItem>
                      <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                      <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                      <SelectItem value="O_POSITIVE">O+</SelectItem>
                      <SelectItem value="O_NEGATIVE">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="allergies">
                    Allergies (séparées par des virgules)
                  </Label>
                  <Input
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                  />
                </div>
                {mode === "edit" && (
                  <div className="space-y-1">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.isActive ? "true" : "false"}
                      onValueChange={(value) =>
                        handleSelectChange("isActive", value)
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Actif</SelectItem>
                        <SelectItem value="false">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : mode === "create"
                    ? "Créer le patient"
                    : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
