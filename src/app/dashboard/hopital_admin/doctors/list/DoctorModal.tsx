/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { specialities } from "@/constant";

type Department = { id: string; name: string; description?: string };

/********************
 * Create Doctor Modal
 *******************/
export function DoctorModal({
  open,
  onOpenChange,
  onDoctorCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDoctorCreated?: () => void;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<null | {
    plan: string;
    currentDoctors: number;
    maxDoctors: number | string;
  }>(null);

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
      setErrors({});
      (async () => {
        try {
          setLoading(true);
          const [depRes, subRes] = await Promise.all([
            fetch("/api/hospital_admin/department"),
            fetch("/api/hospital_admin/subscription/getSuscriptionInfos"),
          ]);
          const dep = await depRes.json();
          const sub = await subRes.json();
          setDepartments(dep?.departments ?? []);
          if (subRes.ok) {
            setSubscriptionInfo({
              plan: sub.plan,
              currentDoctors: sub.currentDoctors,
              maxDoctors:
                sub.maxDoctors === Infinity ? "Illimité" : sub.maxDoctors,
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les données",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      const { [name]: _, ...rest } = errors;
      setErrors(rest);
    }
  };
  const handleSelect = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      const { [name]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const validate = () => {
    const req = [
      "name",
      "email",
      "phone",
      "password",
      "specialization",
      "licenseNumber",
      "genre",
    ];
    const n: Record<string, string> = {};
    req.forEach((f) => {
      if (!(form as any)[f]) n[f] = "Ce champ est obligatoire";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      n.email = "Email invalide";
    if (
      form.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(form.phone)
    )
      n.phone = "Numéro de téléphone invalide";
    if (form.password && form.password.length < 6)
      n.password = "Le mot de passe doit contenir au moins 6 caractères";
    if (form.licenseNumber && !/^[A-Za-z0-9-]+$/.test(form.licenseNumber))
      n.licenseNumber = "Format de N° Ordre du Médecins invalide";
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/hospital_admin/doctors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Erreur lors de la création du médecin");
      toast({
        title: "Succès",
        description: "Le médecin a été créé avec succès",
      });
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
      onDoctorCreated?.();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Une erreur inattendue est survenue",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Ajouter un nouveau médecin
          </DialogTitle>
          {subscriptionInfo && (
            <DialogDescription className="text-sm">
              Votre abonnement:{" "}
              <span className="font-medium">{subscriptionInfo.plan}</span> •
              Médecins:{" "}
              <span className="font-medium">
                {subscriptionInfo.currentDoctors}/{subscriptionInfo.maxDoctors}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 pt-1">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
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
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
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
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 6 caractères
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="specialization">
                  Spécialisation <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.specialization}
                  onValueChange={(v) => handleSelect("specialization", v)}
                >
                  <SelectTrigger
                    className={errors.specialization ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Sélectionnez votre spécialisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-500">
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
                  <p className="mt-1 text-sm text-red-500">
                    {errors.licenseNumber}
                  </p>
                )}
              </div>
              <div>
                <Label>
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.genre}
                  onValueChange={(v) => handleSelect("genre", v)}
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
                  <p className="mt-1 text-sm text-red-500">{errors.genre}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>Département</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => handleSelect("departmentId", v)}
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
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
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

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="education">Formation</Label>
              <textarea
                id="education"
                name="education"
                value={form.education}
                onChange={handleChange as any}
                rows={3}
                className="w-full rounded-md border bg-background p-2 text-sm"
                placeholder="Diplômes, universités..."
              />
            </div>
            <div>
              <Label htmlFor="experience">Expérience professionnelle</Label>
              <textarea
                id="experience"
                name="experience"
                value={form.experience}
                onChange={handleChange as any}
                rows={3}
                className="w-full rounded-md border bg-background p-2 text-sm"
                placeholder="Postes précédents, années d'expérience..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biographie</Label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange as any}
              rows={3}
              className="w-full rounded-md border bg-background p-2 text-sm"
              placeholder="Présentation du médecin..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
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
              className="min-w-[120px]"
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
