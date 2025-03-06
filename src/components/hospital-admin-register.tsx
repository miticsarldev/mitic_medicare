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
import { Eye, EyeOff, Mail, Phone, Building, MapPin } from "lucide-react";

const hospitalAdminSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'adresse email doit avoir un format valide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  phoneNumber: z
    .string()
    .min(10, "Le numéro de téléphone doit avoir au moins 10 chiffres"),
  hospitalName: z.string().min(2, "Le nom de l'hôpital est requis"),
  hospitalPhone: z
    .string()
    .min(
      8,
      "Le numéro de téléphone de l'hôpital doit avoir au moins 8 chiffres"
    ),
  hospitalAddress: z.string().min(5, "L'adresse de l'hôpital est requise"),
  hospitalCity: z.string().min(2, "La ville est requise"),
  hospitalPostalCode: z.string().min(5, "Le code postal est requis"),
  hospitalCountry: z.string().min(2, "Le pays est requis"),
  termsAccepted: z.boolean().refine((val) => val === true, {
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
    formState: { errors, isSubmitting },
  } = useForm<HospitalAdminFormValues>({
    resolver: zodResolver(hospitalAdminSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: HospitalAdminFormValues) => {
    try {
      const response = await fetch("/api/auth/register-hospital-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
          hospitalName: data.hospitalName,
          hospitalPhone: data.hospitalPhone,
          hospitalAddress: data.hospitalAddress,
          hospitalCity: data.hospitalCity,
          hospitalPostalCode: data.hospitalPostalCode,
          hospitalCountry: data.hospitalCountry,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Échec de l'inscription");

      toast({
        title: "Inscription réussie",
        description:
          "Votre compte administrateur d'hôpital a été créé avec succès.",
      });

      // After successful registration, you might want to redirect to a dashboard or login page
      router.push("/auth");
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Échec de l'inscription",
        description:
          "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-xl font-bold text-center text-[#107ACA]">
        Inscription d&apos;un Administrateur au compte d&apos;Hôpital
      </h1>
      <p className="text-muted-foreground text-center text-sm">
        Remplissez le formulaire ci-dessous pour vous inscrire en tant
        qu&apos;administrateur pour votre hôpital.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="text-sm font-medium border-b text-center">
          Les informations personnelles de l&apos;administrateur
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
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
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phoneNumber">Votre numéro de téléphone</Label>
            <div className="relative">
              <Input id="phoneNumber" {...register("phoneNumber")} />
              <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message}
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
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="text-sm font-medium border-b text-center">
          Les informations sur le centre de santé.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hospitalName">Nom de l&apos;hôpital</Label>
            <div className="relative">
              <Input id="hospitalName" {...register("hospitalName")} />
              <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.hospitalName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.hospitalName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="hospitalPhone">
              Numéro de téléphone de l&apos;hopital
            </Label>
            <div className="relative">
              <Input id="hospitalPhone" {...register("hospitalPhone")} />
              <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.hospitalPhone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.hospitalPhone.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="hospitalAddress">Adresse de l&apos;hôpital</Label>
          <div className="relative">
            <Input id="hospitalAddress" {...register("hospitalAddress")} />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.hospitalAddress && (
            <p className="text-red-500 text-xs mt-1">
              {errors.hospitalAddress.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hospitalCity">Ville de l&apos;hôpital</Label>
            <Input id="hospitalCity" {...register("hospitalCity")} />
            {errors.hospitalCity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.hospitalCity.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="hospitalPostalCode">
              Code postal de l&apos;hôpital
            </Label>
            <Input
              id="hospitalPostalCode"
              {...register("hospitalPostalCode")}
            />
            {errors.hospitalPostalCode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.hospitalPostalCode.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="hospitalCountry">Pays de l&apos;hôpital</Label>
            <Input id="hospitalCountry" {...register("hospitalCountry")} />
            {errors.hospitalCountry && (
              <p className="text-red-500 text-xs mt-1">
                {errors.hospitalCountry.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="termsAccepted" {...register("termsAccepted")} />
          <label htmlFor="termsAccepted" className="text-sm font-medium">
            J&apos;accepte les conditions d&apos;utilisation
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-red-500 text-xs mt-1">
            {errors.termsAccepted.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#107ACA] hover:bg-[#0e6cb3]"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Inscription en cours..." : "S&apos;inscrire"}
        </Button>
      </form>
    </div>
  );
};

export default HospitalAdminRegisterForm;
