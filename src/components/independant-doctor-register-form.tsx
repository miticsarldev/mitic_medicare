"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { specialities } from "@/constant";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const independentDoctorSchema = z.object({
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
  speciality: z.string().min(1, "Veuillez sélectionner une spécialité"),
  licenseNumber: z.string().min(5, "Le numéro de licence est requis"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les politiques et confidentialité",
  }),
});

type IndependentDoctorFormValues = z.infer<typeof independentDoctorSchema>;

export default function IndependentDoctorRegistration() {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IndependentDoctorFormValues>({
    resolver: zodResolver(independentDoctorSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      password: "",
      speciality: "",
      licenseNumber: "",
      terms: false,
    },
  });

  const onSubmit = async (data: IndependentDoctorFormValues) => {
    console.log(data);
    try {
      const response = await fetch("/api/auth/register-independent-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Échec de l'inscription");

      toast({
        title: "Inscription réussie",
        description: "Votre fiche praticien a été créée avec succès.",
      });

      // After successful registration, you might want to redirect to a dashboard or profile page
      router.push("/auth/validation");
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
    <div className="space-y-4 p-4">
      <h1 className="text-lg sm:text-xl font-semibold text-center">
        Inscription fiche praticien indépendant ou cabinet professionnel
      </h1>
      <p className="text-xs sm:text-sm text-center text-muted-foreground">
        Remplissez ce formulaire pour créer votre fiche praticien indépendant ou
        de votre cabinet professionnel.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="text-sm font-semibold text-accent-foreground border-b mb-2">
          Informations personnelles *
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                {...register("lastName")}
                id="lastName"
                placeholder="Tapez votre nom"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                {...register("firstName")}
                id="firstName"
                placeholder="Tapez votre prénom"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.firstName.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                {...register("email")}
                type="email"
                id="email"
                placeholder="Tapez votre adresse mail"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                {...register("phone")}
                type="tel"
                id="phone"
                placeholder="Tapez votre numéro mobile"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                {...register("password")}
                id="password"
                className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <p className="text-red-500 text-xs mt-0.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <p className="text-sm font-semibold text-accent-foreground border-b my-3">
            Informations sur la specialité et la licence *
          </p>

          <div>
            <Label htmlFor="speciality">Spécialité *</Label>
            <Controller
              name="speciality"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger id="speciality">
                    <SelectValue placeholder="Sélectionnez votre spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((speciality) => (
                      <SelectItem
                        key={speciality.value}
                        value={speciality.value}
                      >
                        {speciality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.speciality && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.speciality.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="licenseNumber">Licence *</Label>
            <Input
              {...register("licenseNumber")}
              type="text"
              id="licenseNumber"
              placeholder="Votre licence"
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.licenseNumber.message}
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
                      la charte de Medi
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
          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-50 font-bold py-2 rounded bg-primary text-white dark:bg-gray-800 dark:text-white hover:bg-primary/90 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Inscription en cours..."
                : "Soumettre ma demande"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
