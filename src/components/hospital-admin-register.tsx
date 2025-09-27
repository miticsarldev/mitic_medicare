"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Mail, Phone, Building, MapPin } from "lucide-react";
import { countries, institutionTypes } from "@/constant";

const hospitalAdminSchema = z.object({
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/,
      "Le nom ne doit contenir que des lettres"
    ),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/,
      "Le prénom ne doit contenir que des lettres"
    ),
  phone: z
    .string()
    .regex(
      /^\+?[0-9]{9,15}$/,
      "Numéro de téléphone invalide. Ex: +223123456789"
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
  institutionName: z.string().min(2, "Le nom de l'hôpital est requis"),
  institutionType: z.enum(["clinic", "hospital"], {
    errorMap: () => ({ message: "Le type d'établissement est requis." }),
  }),
  institutionPhone: z
    .string()
    .regex(
      /^\+?[0-9]{9,15}$/,
      "Le numéro de téléphone de l'hôpital doit avoir au moins 8 chiffres"
    ),
  institutionEmail: z
    .string()
    .email("L'adresse email doit être valide")
    .transform((val) => val.toLowerCase()),
  institutionAddress: z.string().min(5, "L'adresse de l'hôpital est requise"),
  institutionCity: z.string().min(2, "La ville est requise"),
  institutionState: z.string().min(2, "L'état ou la région est requis."),
  institutionZipCode: z.string().min(2, "Le code postal est requis"),
  institutionCountry: z.string().min(2, "Le pays est requis"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
});

type HospitalAdminFormValues = z.infer<typeof hospitalAdminSchema>;

const HospitalAdminRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HospitalAdminFormValues>({
    resolver: zodResolver(hospitalAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      institutionName: "",
      institutionType: undefined,
      institutionPhone: "",
      institutionEmail: "",
      institutionAddress: "",
      institutionCity: "",
      institutionState: "",
      institutionZipCode: "",
      institutionCountry: "",
      terms: false,
    },
  });

  const onSubmit = async (data: HospitalAdminFormValues) => {
    console.log(data);

    try {
      const response = await fetch("/api/auth/register-hospital-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log(response);

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Échec de l'inscription");

      toast({
        title: "Inscription réussie",
        description:
          "Votre compte administrateur d'hôpital a été créé avec succès. Un email de confirmation vous a été envoyé. Veuillez le vérifier pour activer votre compte.",
        duration: 10000,
      });

      router.push("/auth");
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Échec de l'inscription",
        description:
          err instanceof Error
            ? err.message
            : "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-xl font-bold text-center text-[#107ACA]">
        Inscription d&apos;une institution (hôpital et/ou clinique) et son
        Administrateur
      </h1>
      <p className="text-muted-foreground text-center text-xs">
        Remplissez le formulaire ci-dessous pour vous inscrire en tant
        qu&apos;administrateur pour votre hôpital et fournir des informations
        sur votre hôpital ou clinique.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="text-sm font-bold border-b text-center mb-2">
          Les informations personnelles de l&apos;administrateur
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input id="email" type="email" {...register("email")} />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Votre numéro de téléphone</Label>
              <div className="relative">
                <Input id="phone" {...register("phone")} />
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.phone.message}
                </p>
              )}
            </div>
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm font-bold border-b text-center my-4">
          Les informations sur le centre de santé.
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionName">Nom de l&apos;hôpital</Label>
              <div className="relative">
                <Input id="institutionName" {...register("institutionName")} />
                <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionName && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="institutionType">Le type d&apos;hopital</Label>
              <Controller
                control={control}
                name="institutionType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="institutionType">
                      <SelectValue placeholder="Sélectionnez le pays de l'hôpital" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.institutionType && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionType.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionPhone">
                Numéro de téléphone de l&apos;hopital
              </Label>
              <div className="relative">
                <Input
                  id="institutionPhone"
                  {...register("institutionPhone")}
                />
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionPhone && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionPhone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="institutionEmail">Email de l&apos;hopital</Label>
              <div className="relative">
                <Input
                  id="institutionEmail"
                  {...register("institutionEmail")}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionEmail && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionEmail.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionAddress">
                Adresse de l&apos;hôpital
              </Label>
              <div className="relative">
                <Input
                  id="institutionAddress"
                  {...register("institutionAddress")}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionAddress && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionAddress.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="institutionCity">Ville de l&apos;hôpital</Label>
              <div className="relative">
                <Input id="institutionCity" {...register("institutionCity")} />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionCity && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionCity.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionState">Etat de l&apos;hôpital</Label>
              <div className="relative">
                <Input
                  id="institutionState"
                  {...register("institutionState")}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionState && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionState.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="institutionZipCode">
                Code postal de l&apos;hôpital
              </Label>
              <div className="relative">
                <Input
                  id="institutionZipCode"
                  {...register("institutionZipCode")}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.institutionZipCode && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.institutionZipCode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="institutionCountry">Pays de l&apos;hôpital</Label>
            <Controller
              control={control}
              name="institutionCountry"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="institutionCountry">
                    <SelectValue placeholder="Sélectionnez le pays de l'hôpital" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.institutionCountry && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.institutionCountry.message}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label htmlFor="terms" className="text-sm font-medium">
                    J&apos;accepte les <span className="font-bold">CGU</span>{" "}
                    ainsi que{" "}
                    <span className="font-bold">
                      la charte de MITIC
                      <span className="text-[#107ACA]">Care</span>
                    </span>
                  </label>
                </div>
              )}
            />
            {errors.terms && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.terms.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#107ACA] hover:bg-[#0e6cb3] mt-2"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
        </Button>
      </form>
    </div>
  );
};

export default HospitalAdminRegisterForm;
