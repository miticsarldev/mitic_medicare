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
import clsx from "clsx";

interface DoctorCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  doctor: Doctor | null;
  onSuccess: () => void;
  specialties: string[];
  hospitals: Hospital[];
}

type DoctorType = "independent" | "hospital";
type Errors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "password"
    | "specialty"
    | "location"
    | "hospitalId"
    | "subscription"
    | "licenseNumber",
    string
  >
>;

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

  // explicit doctor type
  const [doctorType, setDoctorType] = useState<DoctorType>(
    doctor?.isIndependent ? "independent" : "hospital"
  );

  const [errors, setErrors] = useState<Errors>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    location: "",
    status: "active",
    subscription: "" as "" | SubscriptionPlan, // only for independent
    verified: false,
    notes: "",
    sendEmail: true,
    hospitalId: "",
    bio: "",
    licenseNumber: "",
    education: "",
    experience: "",
  });

  // Initialize
  useEffect(() => {
    if (mode === "edit" && doctor) {
      setDoctorType(doctor.isIndependent ? "independent" : "hospital");
      setFormData({
        name: doctor.user.name || "",
        email: doctor.user.email || "",
        phone: doctor.user.phone || "",
        password: "", // never prefill
        specialty: doctor.specialization || "",
        location: doctor.user.profile?.city || "",
        status: doctor.user.isActive ? "active" : "inactive",
        subscription:
          (doctor.isIndependent ? doctor.subscription?.plan : "") || "",
        verified: !!doctor.isVerified,
        notes: "",
        sendEmail: false,
        hospitalId: doctor.hospital?.id || "",
        bio: doctor.user.profile?.bio || "",
        licenseNumber: doctor.licenseNumber || "",
        education: doctor.education || "",
        experience: doctor.experience || "",
      });
    } else {
      setDoctorType("hospital");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialty: "",
        location: "",
        status: "active",
        subscription: "",
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
    setErrors({});
  }, [doctor, mode, isOpen]);

  // Clear irrelevant fields when toggling type
  useEffect(() => {
    setErrors((e) => ({
      ...e,
      hospitalId: undefined,
      subscription: undefined,
    }));
    setFormData((s) => ({
      ...s,
      hospitalId: doctorType === "hospital" ? s.hospitalId : "",
      subscription: doctorType === "independent" ? s.subscription : "",
    }));
  }, [doctorType]);

  // Helpers
  const setField = (name: keyof typeof formData, value: string | boolean) => {
    setFormData((s) => ({ ...s, [name]: value as never }));
    setErrors((e) => ({ ...e, [name]: undefined })); // clear error on edit
  };

  // Validation
  const validate = (): Errors => {
    const e: Errors = {};
    if (!formData.name.trim()) e.name = "Nom requis.";
    if (!formData.email.trim()) e.email = "Email requis.";
    if (!formData.specialty) e.specialty = "Spécialité requise.";
    if (!formData.location.trim()) e.location = "Localisation requise.";
    if (!formData.phone.trim()) e.phone = "Numéro de téléphone requis";
    if (!formData.licenseNumber.trim())
      e.licenseNumber = "N° Ordre du médecin requis";
    if (mode === "create" && !formData.password)
      e.password = "Mot de passe requis.";
    if (doctorType === "hospital" && !formData.hospitalId)
      e.hospitalId = "Établissement requis.";
    if (doctorType === "independent" && !formData.subscription)
      e.subscription = "Abonnement requis.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      toast({
        title: "Champs manquants",
        description: "Merci de remplir les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const fd = new FormData();
        // only append relevant values
        fd.append("name", formData.name.trim());
        fd.append("email", formData.email.trim());
        if (formData.phone) fd.append("phone", formData.phone.trim());
        fd.append("password", formData.password);
        fd.append("specialty", formData.specialty);
        fd.append("location", formData.location);
        fd.append("status", formData.status);
        fd.append("verified", formData.verified ? "on" : "off");
        fd.append("sendEmail", formData.sendEmail ? "on" : "off");
        if (formData.bio) fd.append("bio", formData.bio);
        if (formData.licenseNumber)
          fd.append("licenseNumber", formData.licenseNumber);
        if (formData.education) fd.append("education", formData.education);
        if (formData.experience) fd.append("experience", formData.experience);

        // type-specific
        fd.append("doctorType", doctorType);
        if (doctorType === "hospital") {
          fd.append("hospitalId", formData.hospitalId); // required
        } else {
          fd.append("subscription", formData.subscription); // required
        }

        const result = await createDoctor(fd);
        if (result?.error) {
          toast({
            title: "Erreur",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({ title: "Succès", description: "Médecin créé avec succès." });
          onSuccess();
          onClose();
        }
      } else if (mode === "edit" && doctor) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || "",
          specialty: formData.specialty,
          location: formData.location,
          status: formData.status,
          verified: formData.verified,
          hospitalId:
            doctorType === "hospital" ? formData.hospitalId || null : null,
          subscription:
            doctorType === "independent" ? formData.subscription : undefined,
          bio: formData.bio,
          licenseNumber: formData.licenseNumber,
          education: formData.education,
          experience: formData.experience,
          isIndependent: doctorType === "independent",
        };

        const res = await fetch(`/api/superadmin/doctors/${doctor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update doctor");

        toast({ title: "Succès", description: "Médecin mis à jour." });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d’enregistrer les informations du médecin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Ajouter un médecin" : "Modifier le médecin"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouveau compte médecin"
              : `Modifiez les informations de ${doctor?.user.name ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 py-2 px-0.5">
              {/* Type de médecin */}
              <div>
                <Label>Type de médecin</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant={doctorType === "hospital" ? "default" : "outline"}
                    onClick={() => setDoctorType("hospital")}
                  >
                    Hôpital
                  </Button>
                  <Button
                    type="button"
                    variant={
                      doctorType === "independent" ? "default" : "outline"
                    }
                    onClick={() => setDoctorType("independent")}
                  >
                    Indépendant
                  </Button>
                </div>
              </div>

              {/* Identité */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className={clsx(errors.name && "border-destructive")}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={clsx(errors.email && "border-destructive")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    className={clsx(errors.email && "border-destructive")}
                    onChange={(e) => setField("phone", e.target.value)}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
                {mode === "create" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setField("password", e.target.value)}
                      className={clsx(errors.password && "border-destructive")}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Profil pro */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(v) => setField("specialty", v)}
                  >
                    <SelectTrigger
                      id="specialty"
                      className={clsx(errors.specialty && "border-destructive")}
                      aria-invalid={!!errors.specialty}
                    >
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((sp) => (
                        <SelectItem key={sp} value={sp}>
                          {sp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialty && (
                    <p className="text-xs text-destructive">
                      {errors.specialty}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(v) => setField("location", v)}
                  >
                    <SelectTrigger
                      id="location"
                      className={clsx(errors.location && "border-destructive")}
                      aria-invalid={!!errors.location}
                    >
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(locations).map(([country, regions]) => (
                        <SelectGroup key={country}>
                          <SelectLabel>{country}</SelectLabel>
                          {regions.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Hospital only */}
                {doctorType === "hospital" && (
                  <div className="space-y-2">
                    <Label htmlFor="hospitalId">Établissement *</Label>
                    <Select
                      value={formData.hospitalId}
                      onValueChange={(v) =>
                        setField("hospitalId", v === "none" ? "" : v)
                      }
                    >
                      <SelectTrigger
                        id="hospitalId"
                        className={clsx(
                          errors.hospitalId && "border-destructive"
                        )}
                        aria-invalid={!!errors.hospitalId}
                      >
                        <SelectValue placeholder="Sélectionner un établissement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {hospitals.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name} ({h.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.hospitalId && (
                      <p className="text-xs text-destructive">
                        {errors.hospitalId}
                      </p>
                    )}
                  </div>
                )}

                {/* Independent only */}
                {doctorType === "independent" && (
                  <div className="space-y-2">
                    <Label htmlFor="subscription">Abonnement *</Label>
                    <Select
                      value={formData.subscription || ""}
                      onValueChange={(v) =>
                        setField("subscription", v as SubscriptionPlan)
                      }
                    >
                      <SelectTrigger
                        id="subscription"
                        className={clsx(
                          errors.subscription && "border-destructive"
                        )}
                        aria-invalid={!!errors.subscription}
                      >
                        <SelectValue placeholder="Choisir un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {plan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subscription && (
                      <p className="text-xs text-destructive">
                        {errors.subscription}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Statut *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setField("status", v)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">N° Ordre du médecin *</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setField("licenseNumber", e.target.value)}
                    className={clsx(
                      errors.licenseNumber && "border-destructive"
                    )}
                    aria-invalid={!!errors.licenseNumber}
                  />
                  {errors.licenseNumber && (
                    <p className="text-xs text-destructive">
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio / formation / expérience */}
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Formation</Label>
                <Textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={(e) => setField("education", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={(e) => setField("experience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setField("verified", !!checked)}
                />
                <Label htmlFor="verified" className="text-sm font-normal">
                  Marquer comme vérifié
                </Label>
              </div>

              {mode === "create" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={formData.sendEmail}
                    onCheckedChange={(checked) =>
                      setField("sendEmail", !!checked)
                    }
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-normal">
                    Envoyer un email d’invitation
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
                    : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
