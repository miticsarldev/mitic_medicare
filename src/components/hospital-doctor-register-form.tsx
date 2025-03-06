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
import { specialties } from "@/constant";
import Navbar from "@/components/navbar";

const hospitalDoctorSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  surname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("L'adresse email doit avoir un format valide"),
  phone: z
    .string()
    .min(8, "Le numéro de téléphone doit avoir au moins 8 chiffres"),
  specialty: z.string().min(1, "Veuillez sélectionner une spécialité"),
  licenseNumber: z.string().min(1, "Le numéro de licence est requis"),
  department: z.string().min(1, "Le département est requis"),
  startDate: z.string().min(1, "La date de début est requise"),
  isFullTime: z.boolean(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
});

type HospitalDoctorFormValues = z.infer<typeof hospitalDoctorSchema>;

export default function HospitalDoctorRegistration() {
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HospitalDoctorFormValues>({
    resolver: zodResolver(hospitalDoctorSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      specialty: "",
      licenseNumber: "",
      department: "",
      startDate: "",
      isFullTime: true,
      acceptedTerms: false,
    },
  });

  const onSubmit = async (data: HospitalDoctorFormValues) => {
    try {
      // Here you would typically call an API to register the hospital doctor
      // For this example, we'll just simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(data);

      toast({
        title: "Inscription réussie",
        description: "Le médecin a été ajouté avec succès à l'hôpital.",
      });

      // After successful registration, you might want to redirect to a dashboard or doctor list page
      router.push("/admin/doctors");
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Ajouter un médecin à l&apos;hôpital
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom *</Label>
              <Input {...register("name")} placeholder="Nom du médecin" />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Prénom *</Label>
              <Input {...register("surname")} placeholder="Prénom du médecin" />
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
                placeholder="Email du médecin"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label>Téléphone *</Label>
              <Input
                {...register("phone")}
                type="tel"
                placeholder="Numéro de téléphone"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Numéro de licence *</Label>
              <Input
                {...register("licenseNumber")}
                placeholder="Numéro de licence médicale"
              />
              {errors.licenseNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.licenseNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label>Département *</Label>
              <Input
                {...register("department")}
                placeholder="Département de l'hôpital"
              />
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Date de début *</Label>
            <Input {...register("startDate")} type="date" />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox {...register("isFullTime")} id="isFullTime" />
            <label htmlFor="isFullTime" className="text-sm font-medium">
              Temps plein
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox {...register("acceptedTerms")} id="acceptedTerms" />
            <label htmlFor="acceptedTerms" className="text-sm">
              J&apos;accepte les conditions d&apos;utilisation de l&apos;hôpital
            </label>
          </div>
          {errors.acceptedTerms && (
            <p className="text-red-500 text-sm mt-1">
              {errors.acceptedTerms.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter le médecin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
