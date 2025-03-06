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
import { countries, governorates, specialties } from "@/constant";

const independentDoctorSchema = z.object({
  country: z.string().min(1, "Veuillez sélectionner un pays"),
  governorate: z.string().min(1, "Veuillez sélectionner un gouvernorat"),
  specialty: z.string().min(1, "Veuillez sélectionner une spécialité"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  surname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("L'adresse email doit avoir un format valide"),
  phone: z
    .string()
    .min(8, "Le numéro de téléphone doit avoir au moins 8 chiffres"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les CGU et la charte de MediCare",
  }),
});

type IndependentDoctorFormValues = z.infer<typeof independentDoctorSchema>;

export default function IndependentDoctorRegistration() {
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IndependentDoctorFormValues>({
    resolver: zodResolver(independentDoctorSchema),
    defaultValues: {
      country: "",
      governorate: "",
      specialty: "",
      name: "",
      surname: "",
      email: "",
      phone: "",
      acceptedTerms: false,
    },
  });

  const onSubmit = async (data: IndependentDoctorFormValues) => {
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
      router.push("/auth/profile");
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
    <div className="space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">
        Inscription fiche praticien indépendant
      </h1>
      <p className="text-gray-600 dark:text-white">
        Remplissez ce formulaire pour créer votre fiche praticien indépendant
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Pays *</Label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
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
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Gouvernorat *</Label>
            <Controller
              name="governorate"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un gouvernorat" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((governorate) => (
                      <SelectItem
                        key={governorate.value}
                        value={governorate.value}
                      >
                        {governorate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.governorate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.governorate.message}
              </p>
            )}
          </div>
          <div>
            <Label>Spécialité *</Label>
            <Controller
              name="specialty"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.specialty && (
              <p className="text-red-500 text-sm mt-1">
                {errors.specialty.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nom *</Label>
            <Input {...register("name")} placeholder="Tapez votre nom" />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>Prénom *</Label>
            <Input {...register("surname")} placeholder="Tapez votre prénom" />
            {errors.surname && (
              <p className="text-red-500 text-sm mt-1">
                {errors.surname.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Adresse mail *</Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="Tapez votre adresse mail"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label>Téléphone Mobile *</Label>
            <Input
              {...register("phone")}
              type="tel"
              placeholder="Tapez votre numéro mobile"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox {...register("acceptedTerms")} id="acceptedTerms" />
          <label htmlFor="acceptedTerms" className="text-sm">
            J&apos;accepte les <span className="font-bold">CGU</span> ainsi que{" "}
            <span className="font-bold">
              la charte de Medi
              <span className="text-[#107ACA]">Care</span>
            </span>
          </label>
        </div>
        {errors.acceptedTerms && (
          <p className="text-red-500 text-sm mt-1">
            {errors.acceptedTerms.message}
          </p>
        )}

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-50 font-bold py-2 rounded bg-primary text-white dark:bg-gray-800 dark:text-white hover:bg-primary/90 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inscription en cours..." : "Soumettre ma demande"}
          </Button>
        </div>
      </form>
    </div>
  );
}
