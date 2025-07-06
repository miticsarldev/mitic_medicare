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

interface PatientCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  patient?: Patient | null;
  onSuccess: () => void;
}

export default function PatientCreateEditModal({
  isOpen,
  onClose,
  mode,
  patient,
  onSuccess,
}: PatientCreateEditModalProps) {
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    gender: "Homme",
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

  // Initialize form data when patient changes or modal opens
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
        gender: patient.user.profile?.genre || "Homme",
        address: patient.user.profile?.address || "",
        city: patient.user.profile?.city || "",
        state: patient.user.profile?.state || "",
        zipCode: patient.user.profile?.zipCode || "",
        country: patient.user.profile?.country || "",
        bloodType: patient.bloodType || "",
        allergies: Array.isArray(patient.allergies)
          ? patient.allergies.join(", ")
          : patient.allergies || "",
        emergencyContact: patient.emergencyContact || "",
        emergencyPhone: patient.emergencyPhone || "",
        isActive: patient.user.isActive,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        dateOfBirth: "",
        gender: "Homme",
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

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select change for dropdowns
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "create") {
        // Create new patient
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataObj.append(key, String(value));
          }
        });

        const result = await createPatient(formDataObj);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Patient created successfully",
          });
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && patient) {
        console.log({ patient: patient.id });
        // Update existing patient
        const response = await fetch(`/api/superadmin/patients/${patient.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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

        if (!response.ok) {
          throw new Error("Failed to update patient");
        }

        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting patient data:", error);
      toast({
        title: "Error",
        description: "Failed to save patient data",
        variant: "destructive",
      });
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
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 md:grid-cols-2 px-0.5">
              {/* Left column */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {mode === "create" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={mode === "create"}
                    />
                  </div>
                )}
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                      <SelectItem value="MALE">Homme</SelectItem>
                      <SelectItem value="FEMALE">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Région</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Code postal</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.isActive ? "active" : "inactive"}
                      onValueChange={(value) =>
                        handleSelectChange(
                          "isActive",
                          value === "active" ? "true" : "false"
                        )
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {mode === "create"
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
