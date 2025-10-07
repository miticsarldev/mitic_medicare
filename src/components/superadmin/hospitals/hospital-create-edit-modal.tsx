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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createHospital } from "@/app/actions/hospital-actions";
import type { Hospital } from "@/types/hospital";
import { type HospitalStatus, SubscriptionPlan } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HospitalCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  hospital: Hospital | null;
  onSuccess: () => void;
}

export default function HospitalCreateEditModal({
  isOpen,
  onClose,
  mode,
  hospital,
  onSuccess,
}: HospitalCreateEditModalProps) {
  const subscriptionPlans = Object.values(SubscriptionPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    description: "",
    status: "ACTIVE" as HospitalStatus,
    verified: false,
    subscription: "FREE" as SubscriptionPlan,
  });

  // Initialize form data when hospital changes or modal opens
  useEffect(() => {
    if (mode === "edit" && hospital) {
      setFormData({
        name: hospital.name || "",
        email: hospital.email || "",
        phone: hospital.phone || "",
        address: hospital.address || "",
        city: hospital.city || "",
        state: hospital.state || "",
        country: hospital.country || "",
        website: hospital.website || "",
        description: hospital.description || "",
        status: hospital.status || "ACTIVE",
        verified: hospital.isVerified || false,
        subscription: hospital.subscription?.plan || "FREE",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        website: "",
        description: "",
        status: "ACTIVE",
        verified: false,
        subscription: "FREE",
      });
    }
  }, [hospital, mode, isOpen]);

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
        // Create new hospital
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataObj.append(
            key,
            typeof value === "boolean" ? (value ? "on" : "off") : String(value)
          );
        });

        const result = await createHospital(formDataObj);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Hospital created successfully",
          });
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && hospital) {
        // Update existing hospital
        const response = await fetch(
          `/api/superadmin/hospitals/${hospital.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              country: formData.country,
              website: formData.website,
              description: formData.description,
              status: formData.status,
              isVerified: formData.verified,
              subscription: formData.subscription,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update hospital");
        }

        toast({
          title: "Success",
          description: "Hospital updated successfully",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting hospital data:", error);
      toast({
        title: "Error",
        description: "Failed to save hospital data",
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
            {mode === "create"
              ? "Ajouter un établissement"
              : "Modifier l'établissement"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouveau établissement de santé sur la plateforme"
              : `Modifiez les informations de ${hospital?.name}`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 px-0.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;établissement</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Hôpital Saint-Louis"
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
                    placeholder="contact@hopital.fr"
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://www.hopital.fr"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="1 rue de l'Hôpital"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Paris"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Région</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Île-de-France"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="France"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as HospitalStatus,
                      })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription">Abonnement</Label>
                  <Select
                    name="subscription"
                    value={formData.subscription}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        subscription: value as SubscriptionPlan,
                      })
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Informations supplémentaires..."
                  value={formData.description}
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
                    ? "Créer l'établissement"
                    : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
