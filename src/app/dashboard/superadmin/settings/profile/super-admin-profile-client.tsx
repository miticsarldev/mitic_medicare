/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  ChevronsUpDown,
  Loader2,
  MapPin,
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
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@prisma/client";
import {
  getUserAdminProfile,
  updateUserAdmin,
} from "@/app/actions/superadmin-user-actions";
import { countries } from "@/constant";

const roles: UserRole[] = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "INDEPENDENT_DOCTOR",
  "HOSPITAL_DOCTOR",
  "PATIENT",
];

const FormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().nullable(), // DB requires phone, but we won't overwrite if omitted
  role: z.enum([
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "INDEPENDENT_DOCTOR",
    "HOSPITAL_DOCTOR",
    "PATIENT",
  ]),
  dateOfBirth: z.string().optional().nullable(), // yyyy-mm-dd
  bio: z.string().max(500).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  genre: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  avatarUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().optional().nullable()
  ),
});
type FormValues = z.infer<typeof FormSchema>;

export default function SuperAdminProfileClient() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [countryOpen, setCountryOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "SUPER_ADMIN",
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

  const watchAll = form.watch();

  React.useEffect(() => {
    (async () => {
      try {
        const data = await getUserAdminProfile();
        form.reset({
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          role: data.user.role,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (vals: FormValues) => {
    console.log("Saving", vals);
    try {
      await updateUserAdmin({
        ...vals,
        dateOfBirth: vals.dateOfBirth || null,
      });
      toast({ title: "Profil mis à jour" });
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: String(e.message || e),
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingSkeleton />;

  const initials = (watchAll.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <form
        onSubmit={form.handleSubmit(save, (errors) => {
          console.error("Invalid form", errors);
          // Optional: surface a toast
          toast({
            title: "Champs invalides",
            description: "Vérifiez les informations surlignées.",
            variant: "destructive",
          });
        })}
      >
        {/* Header / identity card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background">
                  <AvatarImage
                    src={
                      avatarPreview || "/placeholder.svg?height=112&width=112"
                    }
                    alt="Avatar"
                  />
                  <AvatarFallback className="text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-2 shadow cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // TODO: upload -> url
                      // const url = await upload(file)
                      // form.setValue("avatarUrl", url, { shouldDirty: true })
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatarPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {watchAll.name || "Nom complet"}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {watchAll.email}
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {watchAll.role}
                  </span>

                  {watchAll.city && watchAll.country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {watchAll.city},{" "}
                      {countries.find((c) => c.value === watchAll.country)
                        ?.label ?? watchAll.country}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  onClick={form.handleSubmit(save)}
                  disabled={form.formState.isSubmitting}
                  className="w-full md:w-auto"
                  type="submit"
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
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Account */}
          <Card className="md:col-span-6">
            <CardHeader>
              <CardTitle>Compte</CardTitle>
              <CardDescription>Identité, rôle et statut</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Rôle</Label>
                    <Controller
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                      )}
                    />
                  </div>
                  <div>
                    <Label>Genre</Label>
                    <Controller
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(v) => field.onChange(v || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Homme</SelectItem>
                            <SelectItem value="FEMALE">Femme</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={form.handleSubmit(save)}
                disabled={form.formState.isSubmitting}
                type="submit"
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

          {/* Profile */}
          <Card className="md:col-span-6">
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Adresse, pays, biographie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                          !watchAll.country && "text-muted-foreground"
                        )}
                      >
                        {watchAll.country
                          ? countries.find((c) => c.value === watchAll.country)
                              ?.label || watchAll.country
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
                                  form.setValue("country", v, {
                                    shouldDirty: true,
                                  });
                                  setCountryOpen(false);
                                }}
                              >
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
            <CardFooter className="justify-end">
              <Button
                onClick={form.handleSubmit(save)}
                disabled={form.formState.isSubmitting}
                type="submit"
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
      </form>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-6 md:grid-cols-12">
        <Skeleton className="h-[420px] md:col-span-6" />
        <Skeleton className="h-[420px] md:col-span-6" />
      </div>
    </div>
  );
}
