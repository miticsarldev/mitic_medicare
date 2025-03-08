"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail } from "lucide-react";

const clinicAdminSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/,
      "Le prénom ne doit contenir que des lettres"
    ),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/,
      "Le nom ne doit contenir que des lettres"
    ),
  email: z
    .string()
    .email("L'adresse email doit être valide")
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /[A-Z]/,
      "Le mot de passe doit contenir au moins une lettre majuscule"
    )
    .regex(
      /[a-z]/,
      "Le mot de passe doit contenir au moins une lettre minuscule"
    )
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[\W_]/,
      "Le mot de passe doit contenir au moins un caractère spécial"
    ),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[0-9]{9,15}$/,
      "Numéro de téléphone invalide. Ex: +223123456789"
    ),
  clinicName: z.string().min(2, "Le nom de la clinique est requis"),
  clinicPhone: z
    .string()
    .min(
      8,
      "Le numéro de téléphone de la clinique doit avoir au moins 8 chiffres"
    ),
  clinicAddress: z.string().min(5, "L'adresse de la clinique est requise"),
  clinicCity: z.string().min(2, "La ville est requise"),
  clinicPostalCode: z.string().min(5, "Le code postal est requis"),
  clinicCountry: z.string().min(2, "Le pays est requis"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
});

type ClinicAdminFormValues = z.infer<typeof clinicAdminSchema>;

const RegisterClinicForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClinicAdminFormValues>({
    resolver: zodResolver(clinicAdminSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: ClinicAdminFormValues) => {
    try {
      const response = await fetch("/api/institutions/register-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de l'inscription");
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte administrateur de clinique a été créé.",
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold text-center">Inscription Clinique</h1>
      <p className="text-center text-muted-foreground">
        Remplissez le formulaire pour enregistrer votre clinique.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input id="email" type="email" {...register("email")} />
            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="clinicName">Nom de la Clinique</Label>
          <Input id="clinicName" {...register("clinicName")} />
          {errors.clinicName && (
            <p className="text-red-500 text-xs">{errors.clinicName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="clinicPhone">Téléphone de la Clinique</Label>
          <Input id="clinicPhone" {...register("clinicPhone")} />
          {errors.clinicPhone && (
            <p className="text-red-500 text-xs">{errors.clinicPhone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="clinicAddress">Adresse de la Clinique</Label>
          <Input id="clinicAddress" {...register("clinicAddress")} />
          {errors.clinicAddress && (
            <p className="text-red-500 text-xs">
              {errors.clinicAddress.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="termsAccepted" {...register("termsAccepted")} />
          <label htmlFor="termsAccepted" className="text-sm">
            J&apos;accepte les conditions d&apos;utilisation
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-red-500 text-xs">{errors.termsAccepted.message}</p>
        )}

        <Button type="submit" className="w-full bg-primary text-white">
          {isSubmitting ? "Enregistrement en cours..." : "Créer ma clinique"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterClinicForm;
