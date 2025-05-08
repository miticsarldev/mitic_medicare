"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiveSearch } from "@/components/live-search";
import type { SearchFilters } from "@/app/actions/ui-actions";

interface HeroSectionProps {
  specializations: string[];
  cities: string[];
}

export function HeroSection({ specializations, cities }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<SearchFilters["type"]>("doctor");
  const [mounted, setMounted] = useState(false);

  // Form state
  const [specialization, setSpecialization] = useState("");
  const [doctorCity, setDoctorCity] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (value: SearchFilters["type"]) => {
    setActiveTab(value);
  };

  if (!mounted) return null;

  return (
    <div className="relative bg-gradient-to-b from-background via-background to-blue-50/50 dark:from-background dark:via-background/95 dark:to-blue-950/20 min-h-[calc(100vh-4rem)]">
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-20 h-20 bg-primary/20 rounded-full blur-xl" />

      <div className="mx-auto px-4 relative z-10 pb-3 md:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 md:py-10 overflow-hidden">
          <motion.div
            className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 md:space-y-8 md:pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  Plateforme de santé au Mali
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-5xl font-bold tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="text-primary">Accédez aux soins</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  de qualité facilement
                </span>
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Trouvez des médecins qualifiés, prenez rendez-vous et gérez
                votre dossier médical.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Link href="#findoctors">
                <Button
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90 flex items-center justify-center transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:translate-y-[-2px]"
                >
                  <User className="h-5 w-5" />
                  Trouver un médecin
                </Button>
              </Link>
              <Link href="/dashboard/patient/appointments/book">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 flex items-center justify-center transition-all duration-300"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span className="text-muted-foreground">
                Vous êtes un professionnel de santé ?
              </span>
              <Link
                href="/auth"
                className="text-primary hover:text-primary/80 font-medium flex items-center group"
              >
                Rejoignez-nous
                <ChevronRight className="inline-block h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Médecins vérifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">
                  Hôpitaux partenaires
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">
                  Dossier médical sécurisé
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative w-full max-w-md">
              {/* Background circles */}
              <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 blur-md" />
              <div className="absolute inset-4 rounded-full bg-primary/5 dark:bg-primary/10" />

              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-primary/20 to-transparent p-2">
                <Image
                  className="rounded-2xl object-cover w-full h-auto z-10 relative"
                  src="/african-woman-doctor.webp"
                  alt="Médecin au Mali"
                  width={600}
                  height={600}
                  priority
                />
              </div>

              {/* Floating cards */}
              <motion.div
                className="absolute z-20 -top-6 sm:-left-6 bg-background dark:bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Médecins spécialistes</p>
                    <p className="text-xs text-muted-foreground">
                      Trouvez le bon spécialiste
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute z-20 -bottom-6 sm:-right-6 right-0 bg-background dark:bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Rendez-vous faciles</p>
                    <p className="text-xs text-muted-foreground">
                      Planifiez en quelques clics
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Search card */}
        <motion.div
          className="relative z-20 py-4 sm:py-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Card className="border shadow-xl bg-background/95 backdrop-blur-md dark:bg-background/80 overflow-visible">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10" />
            <CardContent className="p-4 sm:p-6 relative z-10 overflow-visible">
              {/* Mobile select */}
              <div className="sm:hidden mb-2">
                <Select
                  value={activeTab}
                  onValueChange={(value) =>
                    handleTabChange(value as SearchFilters["type"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Médecin</SelectItem>
                    <SelectItem value="hospital">Hôpital</SelectItem>
                    <SelectItem value="department">Département</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop tabs */}
              <div className="hidden sm:block">
                <Tabs
                  defaultValue="doctor"
                  value={activeTab}
                  onValueChange={(value) =>
                    handleTabChange(value as SearchFilters["type"])
                  }
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-6 bg-accent">
                    <TabsTrigger
                      value="doctor"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Médecin
                    </TabsTrigger>
                    <TabsTrigger
                      value="hospital"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Hôpital
                    </TabsTrigger>
                    <TabsTrigger
                      value="department"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Département
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    <div className="grid sm:gap-2 md:gap-4 md:grid-cols-3">
                      {activeTab === "doctor" && (
                        <>
                          <div className="order-3 md:order-1 md:col-span-1">
                            <LiveSearch
                              type="doctor"
                              placeholder="Nom du médecin"
                              specialization={specialization}
                              city={doctorCity}
                            />
                          </div>
                          <div className="order-1 md:order-2">
                            <Select
                              value={specialization}
                              onValueChange={setSpecialization}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Spécialité" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  Toutes les spécialités
                                </SelectItem>
                                {specializations
                                  ?.filter(Boolean)
                                  .map((spec) => (
                                    <SelectItem key={spec} value={spec}>
                                      {spec}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="order-2 md:order-3">
                            <Select
                              value={doctorCity}
                              onValueChange={setDoctorCity}
                            >
                              <SelectTrigger className="pl-9">
                                <SelectValue placeholder="Ville" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  Toutes les villes
                                </SelectItem>
                                {cities?.filter(Boolean).map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {activeTab === "hospital" && (
                        <>
                          <div className="order-2 md:order-1 md:col-span-2">
                            <LiveSearch
                              type="hospital"
                              placeholder="Nom de l'hôpital"
                              className="md:col-span-2"
                              city={hospitalCity}
                            />
                          </div>
                          <div className="order-1 md:order-2">
                            <Select
                              value={hospitalCity}
                              onValueChange={setHospitalCity}
                            >
                              <SelectTrigger className="pl-9">
                                <SelectValue placeholder="Ville" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  Toutes les villes
                                </SelectItem>
                                {cities?.filter(Boolean).map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {activeTab === "department" && (
                        <LiveSearch
                          type="department"
                          placeholder="Nom du département"
                          className="md:col-span-3"
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Mobile form fields */}
              <div className="sm:hidden">
                <div className="grid gap-2">
                  {activeTab === "doctor" && (
                    <>
                      <Select
                        value={specialization}
                        onValueChange={setSpecialization}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Toutes les spécialités
                          </SelectItem>
                          {specializations?.filter(Boolean).map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={doctorCity} onValueChange={setDoctorCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ville" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les villes</SelectItem>
                          {cities?.filter(Boolean).map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <LiveSearch
                        type="doctor"
                        placeholder="Nom du médecin"
                        specialization={specialization}
                        city={doctorCity}
                      />
                    </>
                  )}

                  {activeTab === "hospital" && (
                    <>
                      <Select
                        value={hospitalCity}
                        onValueChange={setHospitalCity}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ville" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les villes</SelectItem>
                          {cities?.filter(Boolean).map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <LiveSearch
                        type="hospital"
                        placeholder="Nom de l'hôpital"
                        city={hospitalCity}
                      />
                    </>
                  )}

                  {activeTab === "department" && (
                    <LiveSearch
                      type="department"
                      placeholder="Nom du département"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
