"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building, Eye, EyeOff, Mail, Phone, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

const registerSchema = z.object({
  gender: z.enum(["female", "male"], {
    required_error: "Veuillez sélectionner votre genre",
  }),
  lastName: z.string().min(1, "Le nom est requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  phoneNumber: z
    .string()
    .min(10, "Le numéro de téléphone doit avoir au moins 10 chiffres"),
  email: z.string().email("L&apos;adresse email doit avoir un format valide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les politiques et confidentialité",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "female",
      lastName: "",
      firstName: "",
      phoneNumber: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          role: "patient",
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Échec de l'inscription");

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });

      router.push("/auth");
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Échec de l&apos;inscription",
        description:
          "Une erreur s&apos;est produite lors de l&apos;inscription. Veuillez réessayer.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Vous êtes un professionnel de santé ?
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90%] sm:max-w-screen-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              Choisissez votre type de compte professionnel
            </DialogTitle>
            <DialogDescription className="text-center text-lg mb-6">
              Sélectionnez le type de compte qui correspond à votre situation
              professionnelle.
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Grid */}
          <div className="grid gap-4 sm:grid-cols-2 grid-cols-1 py-2">
            {/* Médecin Indépendant */}
            <Link
              href="/auth/register-independant-doctor"
              className="w-full h-auto text-left flex flex-col items-start p-4 space-y-2 max-w-full border border-border rounded-lg cursor-pointer transition-all 
                  bg-background hover:bg-muted shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <UserPlus className="text-muted-foreground size-6 sm:size-10" />
                <h3 className="text-sm sm:text-lg font-semibold truncate">
                  Médecin indépendant
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Créez votre profil personnel, gérez vos rendez-vous et vos
                patients.
              </p>
              <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
                Idéal pour les praticiens exerçant en cabinet individuel ou en
                libéral. Vous aurez un contrôle total sur votre agenda et vos
                informations professionnelles.
              </p>
            </Link>

            {/* Hôpital - Administrateur */}
            <Link
              href="/auth/register-hopital-admin"
              className="w-full h-auto text-left flex flex-col items-start p-4 space-y-2 max-w-full border border-border rounded-lg cursor-pointer transition-all 
                  bg-background hover:bg-muted shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <Building className="text-muted-foreground size-6 sm:size-10" />
                <h3 className="text-sm sm:text-lg font-semibold truncate">
                  Un hôpital: Administrateur
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gérez votre établissement, ajoutez des médecins et supervisez
                les services.
              </p>
              <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
                Pour les gestionnaires d&apos;établissements de santé. Vous
                pourrez ajouter et gérer des médecins, coordonner les services
                et avoir une vue d&apos;ensemble sur les activités de votre
                établissement.
              </p>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background dark:bg-card/50 px-2 text-muted-foreground">
            ou
          </span>
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-medium">
        Merci de saisir vos informations
      </h2>

      <div className="flex justify-center">
        <RadioGroup
          defaultValue="femme"
          className="flex gap-4"
          {...register("gender")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="femme" id="femme" />
            <Label htmlFor="femme">Femme</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="homme" id="homme" />
            <Label htmlFor="homme">Homme</Label>
          </div>
        </RadioGroup>
      </div>
      {errors.gender && (
        <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input placeholder="Nom" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
        <div>
          <Input placeholder="Prénom" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <Input
          placeholder="Numéro"
          {...register("phoneNumber")}
          className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      <div className="relative">
        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="email"
          placeholder="Adresse email"
          {...register("email")}
          className="w-full pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Mot de passe"
          {...register("password")}
          className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" {...register("terms")} />
        <label htmlFor="terms" className="text-sm font-medium">
          Accepter les politiques et confidentialité
        </label>
      </div>
      {errors.terms && (
        <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-[#107ACA]"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Inscription en cours..." : "Soumettre"}
      </Button>
    </form>
  );
};

export default RegisterForm;
