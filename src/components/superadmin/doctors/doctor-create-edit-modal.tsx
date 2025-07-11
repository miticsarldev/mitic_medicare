"use client";

import type React from "react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createDoctor } from "@/app/actions/doctor-actions";
import type { Doctor } from "@/types/doctor";
import { SubscriptionPlan } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hospital } from "@/types/hospital";
import { locations } from "@/constant";

interface DoctorCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  doctor: Doctor | null;
  onSuccess: () => void;
  specialties: string[];
  hospitals: Hospital[];
}

export default function DoctorCreateEditModal({
  isOpen,
  onClose,
  mode,
  doctor,
  onSuccess,
  specialties,
  hospitals,
}: DoctorCreateEditModalProps) {
  const subscriptionPlans = Object.values(SubscriptionPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    location: "",
    status: "active",
    subscription: "Trial",
    verified: false,
    notes: "",
    sendEmail: true,
    hospitalId: "",
    bio: "",
    licenseNumber: "",
    education: "",
    experience: "",
  });

  // Initialize form data when doctor changes or modal opens
  useEffect(() => {
    if (mode === "edit" && doctor) {
      setFormData({
        name: doctor.user.name || "",
        email: doctor.user.email || "",
        phone: doctor.user.phone || "",
        password: "", // Don't populate password for security reasons
        specialty: doctor.specialization || "",
        location: doctor.user.profile?.city || "",
        status: doctor.user.isActive ? "active" : "inactive",
        subscription: doctor.subscription?.plan || "Trial",
        verified: doctor.isVerified,
        notes: "",
        sendEmail: false,
        hospitalId: doctor.hospital?.id || "",
        bio: doctor.user.profile?.bio || "",
        licenseNumber: doctor.licenseNumber || "",
        education: doctor.education || "",
        experience: doctor.experience || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialty: "",
        location: "",
        status: "active",
        subscription: "Trial",
        verified: false,
        notes: "",
        sendEmail: true,
        hospitalId: "",
        bio: "",
        licenseNumber: "",
        education: "",
        experience: "",
      });
    }
  }, [doctor, mode, isOpen]);

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create new doctor
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataObj.append(
            key,
            typeof value === "boolean" ? (value ? "on" : "off") : String(value)
          );
        });

        const result = await createDoctor(formDataObj);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Doctor created successfully",
          });
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && doctor) {
        // Update existing doctor
        const response = await fetch(`/api/superadmin/doctors/${doctor.user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            specialty: formData.specialty,
            location: formData.location,
            status: formData.status,
            subscription: formData.subscription,
            verified: formData.verified,
            hospitalId: formData.hospitalId || null,
            bio: formData.bio,
            licenseNumber: formData.licenseNumber,
            education: formData.education,
            experience: formData.experience,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update doctor");
        }

        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting doctor data:", error);
      toast({
        title: "Error",
        description: "Failed to save doctor data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Ajouter un médecin" : "Modifier le médecin"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouveau compte médecin sur la plateforme"
              : `Modifiez les informations de ${doctor?.user.name}`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 px-0.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Dr. Jean Dupont"
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
                    placeholder="jean.dupont@example.com"
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
                    placeholder="01 23 45 67 89"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {mode === "create" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={mode === "create"}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Select
                    name="specialty"
                    value={formData.specialty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialty: value })
                    }
                  >
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Select
                    name="location"
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value })
                    }
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(locations).map(([country, regions]) => (
                        <SelectGroup key={country}>
                          <SelectLabel>{country}</SelectLabel>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription">Abonnement</Label>
                  <Select
                    name="subscription"
                    value={formData.subscription}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subscription: value })
                    }
                  >
                    <SelectTrigger id="subscription">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hospitals.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="hospitalId">Établissement</Label>
                    <Select
                      name="hospitalId"
                      value={formData.hospitalId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, hospitalId: value })
                      }
                    >
                      <SelectTrigger id="hospitalId">
                        <SelectValue placeholder="Sélectionner un établissement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name} ({hospital.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Numéro de licence</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="12345678"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Informations sur le médecin..."
                  value={formData.bio}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Formation</Label>
                <Textarea
                  id="education"
                  name="education"
                  placeholder="Diplômes et formations..."
                  value={formData.education}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  placeholder="Expérience professionnelle..."
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Informations supplémentaires..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  name="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, verified: checked as boolean })
                  }
                />
                <Label htmlFor="verified" className="text-sm font-normal">
                  Marquer comme vérifié
                </Label>
              </div>

              {mode === "create" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        sendEmail: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-normal">
                    Envoyer un email d&apos;invitation
                  </Label>
                </div>
              )}
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
                    ? "Créer le compte"
                    : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
