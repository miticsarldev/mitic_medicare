"use client";

import { useState, useEffect } from "react";
import { BloodType } from "@prisma/client";
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
  insuranceProvider: string;
  insuranceNumber: string;
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
    insuranceProvider: "",
    insuranceNumber: "",
    isActive: true,
  });

  // Initialize form
  useEffect(() => {
    if (mode === "edit" && patient) {
      setFormData({
        name: patient.user.name || "",
        email: patient.user.email || "",
        phone: patient.user.phone || "",
        password: "",
        // ✅ DOB comes from user
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
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        isActive: !!patient.user.isActive,
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
        insuranceProvider: "",
        insuranceNumber: "",
        isActive: true,
      });
    }
  }, [patient, mode, isOpen]);

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
    if (mode === "create" && !formData.password) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequired()) {
      toast({
        title: "Champs requis",
        description:
          "Nom, email, téléphone (et mot de passe à la création) sont requis.",
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
        // ✅ Send the flat payload your API expects (no nested user object)
        const res = await fetch(`/api/superadmin/patients/${patient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            status: formData.isActive ? "active" : "inactive",
            dateOfBirth: formData.dateOfBirth || null,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            // API maps "Homme"/"Femme" → enum, so send label here:
            gender: formData.gender === "MALE" ? "Homme" : "Femme",
            bloodType: formData.bloodType || null,
            allergies: formData.allergies
              ? formData.allergies
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
            insuranceProvider: formData.insuranceProvider,
            insuranceNumber: formData.insuranceNumber,
            chronicConditions: [], // add another field in UI if you collect it
          }),
        });

        if (!res.ok) throw new Error("Failed to update patient");

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

  const Required = () => <span className="text-destructive">*</span>;

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
              : `Modifiez les informations du patient ${patient?.user.name ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 md:grid-cols-2 px-0.5">
              {/* Left */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">
                    Nom complet <Required />
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

                <div className="space-y-1">
                  <Label htmlFor="email">
                    Email <Required />
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

                <div className="space-y-1">
                  <Label htmlFor="phone">
                    Téléphone <Required />
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
                  <div className="space-y-1">
                    <Label htmlFor="password">
                      Mot de passe <Required />
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
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
