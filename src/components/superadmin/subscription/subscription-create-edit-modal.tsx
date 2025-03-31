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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import type { Subscription } from "@/types/subscription";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Doctor } from "@/types/doctor";
import { Hospital } from "@/types/hospital";

interface SubscriptionCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  subscription?: Subscription | null;
  onSuccess: () => void;
}

export default function SubscriptionCreateEditModal({
  isOpen,
  onClose,
  mode,
  subscription,
  onSuccess,
}: SubscriptionCreateEditModalProps) {
  // Form data state
  const [formData, setFormData] = useState({
    subscriberType: "DOCTOR",
    doctorId: "",
    hospitalId: "",
    plan: "BASIC",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
    amount: "",
    currency: "XOF",
    autoRenew: true,
  });

  // States for doctors and hospitals lists
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when subscription changes or modal opens
  useEffect(() => {
    if (mode === "edit" && subscription) {
      setFormData({
        subscriberType: subscription.subscriberType || "DOCTOR",
        doctorId: subscription.doctorId || "",
        hospitalId: subscription.hospitalId || "",
        plan: subscription.plan || "BASIC",
        status: subscription.status || "ACTIVE",
        startDate: subscription.startDate
          ? new Date(subscription.startDate).toISOString().split("T")[0]
          : "",
        endDate: subscription.endDate
          ? new Date(subscription.endDate).toISOString().split("T")[0]
          : "",
        amount: subscription.amount ? subscription.amount.toString() : "",
        currency: subscription.currency || "XOF",
        autoRenew:
          subscription.autoRenew !== undefined ? subscription.autoRenew : true,
      });
    } else {
      // Reset form for create mode
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      setFormData({
        subscriberType: "DOCTOR",
        doctorId: "",
        hospitalId: "",
        plan: "BASIC",
        status: "ACTIVE",
        startDate: today.toISOString().split("T")[0],
        endDate: nextYear.toISOString().split("T")[0],
        amount: "",
        currency: "XOF",
        autoRenew: true,
      });
    }

    // Fetch doctors and hospitals
    fetchDoctorsAndHospitals();
  }, [subscription, mode, isOpen]);

  // Fetch doctors and hospitals
  const fetchDoctorsAndHospitals = async () => {
    setIsLoading(true);
    try {
      // Fetch doctors
      const doctorsResponse = await fetch("/api/superadmin/doctors?limit=100");
      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData.doctors || []);
      }

      // Fetch hospitals
      const hospitalsResponse = await fetch(
        "/api/superadmin/hospitals?limit=100"
      );
      if (hospitalsResponse.ok) {
        const hospitalsData = await hospitalsResponse.json();
        setHospitals(hospitalsData.hospitals || []);
      }
    } catch (error) {
      console.error("Error fetching doctors and hospitals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors and hospitals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "create") {
        // Create new subscription
        const response = await fetch("/api/superadmin/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            amount: Number.parseFloat(formData.amount),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create subscription");
        }

        toast({
          title: "Success",
          description: "Subscription created successfully",
        });
        onSuccess();
        onClose();
      } else if (mode === "edit" && subscription) {
        // Update existing subscription
        const response = await fetch(
          `/api/superadmin/subscriptions/${subscription.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
              amount: Number.parseFloat(formData.amount),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update subscription");
        }

        toast({
          title: "Success",
          description: "Subscription updated successfully",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting subscription data:", error);
      toast({
        title: "Error",
        description: "Failed to save subscription data",
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
              ? "Ajouter un nouvel abonnement"
              : "Modifier l'abonnement"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouvel abonnement en remplissant le formulaire ci-dessous"
              : `Modifiez les informations de l'abonnement`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 md:grid-cols-2 px-0.5">
              {/* Left column */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="subscriberType">Type d&apos;abonné</Label>
                  <Select
                    value={formData.subscriberType}
                    onValueChange={(value) =>
                      handleSelectChange("subscriberType", value)
                    }
                  >
                    <SelectTrigger id="subscriberType">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCTOR">Médecin</SelectItem>
                      <SelectItem value="HOSPITAL">Hôpital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.subscriberType === "DOCTOR" ? (
                  <div className="space-y-1">
                    <Label htmlFor="doctorId">Médecin</Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) =>
                        handleSelectChange("doctorId", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="doctorId">
                        <SelectValue placeholder="Sélectionner un médecin" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.user?.name || "N/A"} -{" "}
                            {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="hospitalId">Hôpital</Label>
                    <Select
                      value={formData.hospitalId}
                      onValueChange={(value) =>
                        handleSelectChange("hospitalId", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="hospitalId">
                        <SelectValue placeholder="Sélectionner un hôpital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name} - {hospital.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="plan">Plan</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value) => handleSelectChange("plan", value)}
                  >
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="Sélectionner un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Gratuit</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                      <SelectItem value="TRIAL">Essai</SelectItem>
                      <SelectItem value="EXPIRED">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="amount">Montant</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      handleSelectChange("currency", value)
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">XOF</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Switch
                    id="autoRenew"
                    checked={formData.autoRenew}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("autoRenew", checked)
                    }
                  />
                  <Label htmlFor="autoRenew">Renouvellement automatique</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {mode === "create"
                  ? "Créer l'abonnement"
                  : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
