"use client";

import { Skeleton } from "@/components/ui/skeleton";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  //   CalendarIcon,
  Camera,
  Check,
  ChevronsUpDown,
  Droplets,
  Heart,
  //   Info,
  Loader2,
  TreesIcon as Lungs,
  MapPin,
  Phone,
  Save,
  Thermometer,
  User,
  Weight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getPatientProfile,
  updatePatientProfile,
  updatePatientVitals,
} from "@/app/dashboard/patient/actions";
import { countries } from "@/constant";
import { BloodType } from "@prisma/client";
// import { Calendar } from "../ui/calendar";
// import { fr } from "date-fns/locale";
// import { format } from "date-fns";
// import {
//   TooltipProvider,
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;

  allergies?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  avatarUrl?: string;
  createdAt?: string;
}

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Le numéro de téléphone doit contenir au moins 10 chiffres.",
    })
    .optional(),
  bio: z
    .string()
    .max(500, {
      message: "La bio ne peut pas dépasser 500 caractères.",
    })
    .optional(),
  dateOfBirth: z.string().optional(),

  allergies: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

const vitalsFormSchema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodPressureSystolic: z.string().optional(),
  bloodPressureDiastolic: z.string().optional(),
  heartRate: z.string().optional(),
  respiratoryRate: z.string().optional(),
  temperature: z.string().optional(),
  oxygenSaturation: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type VitalsFormValues = z.infer<typeof vitalsFormSchema>;


export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVitalsLoading, setIsVitalsLoading] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vitalsData, setVitalsData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      dateOfBirth: "",
      
      allergies: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      gender: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
    },
    mode: "onChange",
  });

  // Vitals form
  const vitalsForm = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsFormSchema),
    defaultValues: {
      height: "",
      weight: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
      oxygenSaturation: "",
    },
    mode: "onChange",
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const data = await getPatientProfile();
        setProfileData({
          ...data.profile,
          dateOfBirth: data.profile.dateOfBirth
            ? new Date(data.profile.dateOfBirth).toISOString().split("T")[0]
            : undefined,
          createdAt: data.profile.createdAt
            ? new Date(data.profile.createdAt).toISOString()
            : undefined,
        });
        setVitalsData(data.vitals);

        // Set avatar preview if available
        if (data.profile.avatarUrl) {
          setAvatarPreview(data.profile.avatarUrl);
        }

        // Reset form with fetched data
        profileForm.reset({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          bio: data.profile.bio || "",
          dateOfBirth: data.profile.dateOfBirth
            ? new Date(data.profile.dateOfBirth).toISOString().split("T")[0]
            : "",
          
          allergies: data.profile.allergies || "",
          address: data.profile.address || "",
          city: data.profile.city || "",
          state: data.profile.state || "",
          zipCode: data.profile.zipCode || "",
          country: data.profile.country || "",
          gender: data.profile.gender || "",
          emergencyContactName: data.profile.emergencyContactName || "",
          emergencyContactPhone: data.profile.emergencyContactPhone || "",
          emergencyContactRelation: data.profile.emergencyContactRelation || "",
        });

        vitalsForm.reset({
          height: data.vitals?.height?.toString() || "",
          weight: data.vitals?.weight?.toString() || "",
          bloodPressureSystolic:
            data.vitals?.bloodPressureSystolic?.toString() || "",
          bloodPressureDiastolic:
            data.vitals?.bloodPressureDiastolic?.toString() || "",
          heartRate: data.vitals?.heartRate?.toString() || "",
          respiratoryRate: data.vitals?.respiratoryRate?.toString() || "",
          temperature: data.vitals?.temperature?.toString() || "",
          oxygenSaturation: data.vitals?.oxygenSaturation?.toString() || "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du profil.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [toast, profileForm, vitalsForm]);

  // Profile form

  async function onSubmitProfile(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Append profile data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Append avatar if changed
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updatePatientProfile(formData);

      toast({
        title: "Profil mis à jour",
        description:
          "Vos informations personnelles ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitVitals(data: VitalsFormValues) {
    setIsVitalsLoading(true);
    try {
      await updatePatientVitals(data);

      toast({
        title: "Signes vitaux mis à jour",
        description: "Vos signes vitaux ont été mis à jour avec succès.",
      });

      // Update local vitals data
      setVitalsData({
        ...vitalsData,
        ...data,
      });
    } catch (error) {
      console.error("Error updating vitals:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les signes vitaux.",
        variant: "destructive",
      });
    } finally {
      setIsVitalsLoading(false);
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get vital sign status
  const getVitalStatus = (type: string, value: number) => {
    if (!value) return "normal";

    switch (type) {
      case "bloodPressure":
        const systolic = vitalsData?.bloodPressureSystolic || 0;
        const diastolic = vitalsData?.bloodPressureDiastolic || 0;
        if (systolic > 140 || diastolic > 90) return "high";
        if (systolic < 90 || diastolic < 60) return "low";
        return "normal";
      case "heartRate":
        if (value > 100) return "high";
        if (value < 60) return "low";
        return "normal";
      case "respiratoryRate":
        if (value > 20) return "high";
        if (value < 12) return "low";
        return "normal";
      case "temperature":
        if (value > 37.5) return "high";
        if (value < 36) return "low";
        return "normal";
      case "oxygenSaturation":
        if (value < 95) return "low";
        return "normal";
      default:
        return "normal";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-red-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-green-500";
    }
  };

  // Get progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-red-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  if (isLoadingProfile) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et médicales
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
            <CardDescription>
              Cette photo sera affichée sur votre profil et visible par vos
              médecins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage
                  src={avatarPreview || "/placeholder.svg?height=128&width=128"}
                  alt="Photo de profil"
                />
                <AvatarFallback className="text-4xl">
                  {profileData?.name
                    ? profileData.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6" />
                <span className="sr-only">Changer la photo</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">
                {profileData?.name || "Utilisateur"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Membre depuis{" "}
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString(
                      "fr-FR",
                      { month: "long", year: "numeric" }
                    )
                  : ""}
              </p>
            </div>
            <Separator className="my-4" />
            <div className="w-full space-y-2">
              {profileData?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData?.city && profileData?.country && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {profileData.city},{" "}
                    {countries.find((c) => c.value === profileData.country)
                      ?.label || profileData.country}
                  </span>
                </div>
              )}
              {profileData?.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{calculateAge(profileData.dateOfBirth)} ans</span>
                </div>
              )}
            </div>

            {/* Vital Signs Card */}
            <Card className="w-full mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Signes Vitaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vitalsData?.bloodPressureSystolic &&
                  vitalsData?.bloodPressureDiastolic && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Tension artérielle
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${getStatusColor(getVitalStatus("bloodPressure", 0))}`}
                        >
                          {vitalsData.bloodPressureSystolic}/
                          {vitalsData.bloodPressureDiastolic} mmHg
                        </span>
                      </div>
                      <Progress
                        value={100}
                        className={`h-1.5 ${getProgressColor(
                          getVitalStatus("bloodPressure", 0)
                        )}`}
                      />
                    </div>
                  )}

                {vitalsData?.heartRate && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Fréquence cardiaque
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getStatusColor(getVitalStatus("heartRate", vitalsData.heartRate))}`}
                      >
                        {vitalsData.heartRate} bpm
                      </span>
                    </div>
                    <Progress
                      value={100}
                      className={`h-1.5 ${getProgressColor(
                        getVitalStatus("heartRate", vitalsData.heartRate)
                      )}`}
                    />
                  </div>
                )}

                {vitalsData?.oxygenSaturation && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Saturation en oxygène
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getStatusColor(getVitalStatus("oxygenSaturation", vitalsData.oxygenSaturation))}`}
                      >
                        {vitalsData.oxygenSaturation}%
                      </span>
                    </div>
                    <Progress
                      value={vitalsData.oxygenSaturation}
                      className={`h-1.5 ${getProgressColor(
                        getVitalStatus(
                          "oxygenSaturation",
                          vitalsData.oxygenSaturation
                        )
                      )}`}
                    />
                  </div>
                )}

                {vitalsData?.temperature && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Température</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${getStatusColor(getVitalStatus("temperature", vitalsData.temperature))}`}
                      >
                        {vitalsData.temperature}°C
                      </span>
                    </div>
                    <Progress
                      value={100}
                      className={`h-1.5 ${getProgressColor(
                        getVitalStatus("temperature", vitalsData.temperature)
                      )}`}
                    />
                  </div>
                )}

                {!vitalsData?.bloodPressureSystolic &&
                  !vitalsData?.heartRate &&
                  !vitalsData?.oxygenSaturation &&
                  !vitalsData?.temperature && (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Aucun signe vital enregistré
                    </div>
                  )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              {/* <TabsTrigger value="vitals">Signes Vitaux</TabsTrigger> */}
            </TabsList>

            <TabsContent value="profile">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations personnelles.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre email"
                                  {...field}
                                  disabled
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre numéro de téléphone"
                                  {...field}
                                  disabled
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de naissance</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* <FormField
                          control={profileForm.control}
                          name="dateOfBirth"
                          render={({ field }) => {
                            // Ensure selected value is a Date
                            const selectedDate = field.value
                              ? new Date(field.value)
                              : undefined;

                            const today = new Date();
                            const minDate = new Date(
                              today.getFullYear() - 14,
                              today.getMonth(),
                              today.getDate()
                            );

                            const defaultMonth = selectedDate ?? minDate;

                            return (
                              <FormItem className="flex flex-col">
                                <div className="flex items-center justify-between">
                                  <FormLabel>Date de naissance</FormLabel>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent side="left">
                                        L&apos;utilisateur doit avoir au moins
                                        14 ans.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !selectedDate &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {selectedDate ? (
                                          format(selectedDate, "dd MMMM yyyy", {
                                            locale: fr,
                                          })
                                        ) : (
                                          <span>Sélectionner une date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0 max-w-sm"
                                    align="start"
                                    sideOffset={8}
                                    side="bottom"
                                    collisionPadding={8}
                                    avoidCollisions
                                    style={{ zIndex: 50 }}
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={selectedDate}
                                      onSelect={(selected) => {
                                        field.onChange(selected);
                                        setOpen(false);
                                      }}
                                      locale={fr}
                                      initialFocus
                                      disabled={(date) => date > minDate}
                                      defaultMonth={defaultMonth}
                                      captionLayout="dropdown" // 👈 Adds dropdowns
                                      fromYear={today.getFullYear() - 100} // 👈 Allow up to 100 years back
                                      toYear={today.getFullYear() - 14} // 👈 Only allow dates up to 14 years ago
                                      classNames={{
                                        caption_dropdowns:
                                          "flex justify-between gap-2 px-2",

                                        dropdown:
                                          "rounded-md border border-input bg-background py-1.5 px-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                      }}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        /> */}
                        <FormField
                          control={profileForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genre</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez votre genre" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MALE">Homme</SelectItem>
                                  <SelectItem value="FEMALE">Femme</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Parlez-nous un peu de vous..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Vous pouvez mentionner vos intérêts, mode de vie,
                              ou toute information pertinente pour vos médecins.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Adresse</CardTitle>
                      <CardDescription>
                        Votre adresse sera utilisée pour les services à domicile
                        et les urgences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre adresse" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ville</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre ville" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Région</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre région" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code postal</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre code postal"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pays</FormLabel>
                              <Popover
                                open={openCountry}
                                onOpenChange={setOpenCountry}
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? countries.find(
                                            (country) =>
                                              country.value === field.value
                                          )?.label
                                        : "Sélectionnez un pays"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Rechercher un pays..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        Aucun pays trouvé.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {countries.map((country) => (
                                          <CommandItem
                                            key={country.value}
                                            value={country.value}
                                            onSelect={(value) => {
                                              profileForm.setValue(
                                                "country",
                                                value
                                              );
                                              setOpenCountry(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                country.value === field.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {country.label}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les modifications
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </TabsContent>

            {/* <TabsContent value="vitals">
              <Form {...vitalsForm}>
                <form
                  onSubmit={vitalsForm.handleSubmit(onSubmitVitals)}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Signes Vitaux</CardTitle>
                      <CardDescription>
                        Mettez à jour vos signes vitaux pour un meilleur suivi
                        médical.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <FormField
                          control={vitalsForm.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Taille (cm)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    placeholder="170"
                                    {...field}
                                  />
                                  <div className="ml-2">
                                    <Weight className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vitalsForm.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Poids (kg)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    placeholder="70"
                                    {...field}
                                  />
                                  <div className="ml-2">
                                    <Weight className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormLabel>Tension artérielle (mmHg)</FormLabel>
                          <div className="flex gap-2">
                            <FormField
                              control={vitalsForm.control}
                              name="bloodPressureSystolic"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="120"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <span className="flex items-center">/</span>
                            <FormField
                              control={vitalsForm.control}
                              name="bloodPressureDiastolic"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="80"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="ml-2 flex items-center">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={vitalsForm.control}
                          name="heartRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fréquence cardiaque (bpm)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    placeholder="75"
                                    {...field}
                                  />
                                  <div className="ml-2">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vitalsForm.control}
                          name="respiratoryRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fréquence respiratoire</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    placeholder="16"
                                    {...field}
                                  />
                                  <div className="ml-2">
                                    <Lungs className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vitalsForm.control}
                          name="temperature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Température (°C)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="36.8"
                                    {...field}
                                  />
                                  <div className="ml-2">
                                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={vitalsForm.control}
                          name="oxygenSaturation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Saturation en oxygène (%)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    placeholder="98"
                                    {...field}
                                  />
                                  <div className="ml-2">
                                    <Droplets className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button type="submit" disabled={isVitalsLoading}>
                        {isVitalsLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les signes vitaux
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Loading component for internal use
function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
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
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
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
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
