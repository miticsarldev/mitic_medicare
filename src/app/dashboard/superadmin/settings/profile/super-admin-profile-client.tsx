"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Camera,
  Check,
  ChevronsUpDown,
  Loader2,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserAdminProfile,
  updateUserAdmin,
} from "@/app/actions/superadmin-user-actions";

// If you already have a countries constant, import it.
// Otherwise, quick inline fallback list:
const countries = [
  { label: "Mali", value: "ML" },
  { label: "Côte d’Ivoire", value: "CI" },
  { label: "Sénégal", value: "SN" },
  { label: "France", value: "FR" },
  { label: "USA", value: "US" },
];

const roles: UserRole[] = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "INDEPENDENT_DOCTOR",
  "HOSPITAL_DOCTOR",
  "PATIENT",
];

const FormSchema = z.object({
  // user
  id: z.string(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().nullable(),
  role: z.enum([
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "INDEPENDENT_DOCTOR",
    "HOSPITAL_DOCTOR",
    "PATIENT",
  ]),
  isApproved: z.boolean(),
  isActive: z.boolean(),
  dateOfBirth: z.string().optional().nullable(),
  // profile
  bio: z.string().max(500).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  genre: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function SuperAdminProfileClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      phone: "",
      role: "SUPER_ADMIN",
      isApproved: false,
      isActive: true,
      dateOfBirth: "",
      bio: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      genre: null,
      avatarUrl: "",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserAdminProfile();
        form.reset({
          id: data.user.id,
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          role: data.user.role,
          isApproved: data.user.isApproved,
          dateOfBirth: data.user.dateOfBirth
            ? new Date(data.user.dateOfBirth).toISOString().slice(0, 10)
            : "",
          bio: data.profile.bio ?? "",
          address: data.profile.address ?? "",
          city: data.profile.city ?? "",
          state: data.profile.state ?? "",
          zipCode: data.profile.zipCode ?? "",
          country: data.profile.country ?? "",
          genre: data.profile.genre ?? null,
          avatarUrl: data.profile.avatarUrl ?? "",
        });
        setAvatarPreview(data.profile.avatarUrl || null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast({
          title: "Erreur",
          description: String(e.message || e),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  const values = form.getValues();

  const save = async (vals: FormValues) => {
    try {
      await updateUserAdmin({
        ...vals,
        dateOfBirth: vals.dateOfBirth || null,
      });
      toast({ title: "Profil mis à jour" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: String(e.message || e),
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon profil (Super Admin)</h1>
          <p className="text-muted-foreground">
            Gérez votre identité, vos coordonnées et votre visibilité.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* LEFT: Avatar + quick info */}
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Identité</CardTitle>
            <CardDescription>Photo & coordonnées</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage
                  src={avatarPreview || "/placeholder.svg?height=128&width=128"}
                  alt="Avatar"
                />
                <AvatarFallback className="text-4xl">
                  {values.name
                    ? values.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              {/* Hook to your uploader; set avatarUrl after upload */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6" />
                <span className="sr-only">Changer la photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // TODO: upload file -> get URL
                    // const url = await upload(file)
                    // form.setValue("avatarUrl", url)
                    // preview:
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      setAvatarPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <Separator className="my-4" />
            <div className="w-full space-y-2 text-sm">
              {values.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{values.phone}</span>
                </div>
              )}
              {values.city && values.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {values.city},{" "}
                    {countries.find((c) => c.value === values.country)?.label ??
                      values.country}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Rôle : {values.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Forms */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compte</CardTitle>
              <CardDescription>Identité, rôle et statut.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nom complet</Label>
                  <Input
                    placeholder="Nom et prénom"
                    {...form.register("name")}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    placeholder="email@exemple.com"
                    {...form.register("email")}
                    disabled
                  />
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Select
                    value={form.getValues("role")}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onValueChange={(v) => form.setValue("role", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={form.handleSubmit(save)}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Adresse, pays, biographie, genre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Adresse</Label>
                  <Input placeholder="Adresse" {...form.register("address")} />
                </div>
                <div>
                  <Label>Ville</Label>
                  <Input placeholder="Ville" {...form.register("city")} />
                </div>
                <div>
                  <Label>Région</Label>
                  <Input placeholder="Région" {...form.register("state")} />
                </div>
                <div>
                  <Label>Code postal</Label>
                  <Input
                    placeholder="Code postal"
                    {...form.register("zipCode")}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Pays</Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !form.getValues("country") && "text-muted-foreground"
                        )}
                      >
                        {form.getValues("country")
                          ? countries.find(
                              (c) => c.value === form.getValues("country")
                            )?.label || form.getValues("country")
                          : "Sélectionnez un pays"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher un pays..." />
                        <CommandList>
                          <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((c) => (
                              <CommandItem
                                key={c.value}
                                value={c.value}
                                onSelect={(v) => {
                                  form.setValue("country", v);
                                  setCountryOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    c.value === form.getValues("country")
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {c.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    placeholder="Quelques mots sur vous..."
                    className="resize-none"
                    {...form.register("bio")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={form.handleSubmit(save)}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-4 w-32 mt-2" />
            <Skeleton className="h-px w-full my-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
