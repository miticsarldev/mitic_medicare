"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Play,
  ChevronRight,
  CheckCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("medecin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case "medecin":
        return (
          <>
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nom du professionnel" className="pl-9" />
            </div>
            <div className="relative md:col-span-1">
              <Input placeholder="Spécialité" className="md:col-span-1" />
            </div>
            <div className="relative md:col-span-1">
              <Input
                type="email"
                placeholder="Email du Médécin"
                className="md:col-span-1"
              />
            </div>
            <div className="relative md:col-span-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ville" className="pl-9" />
            </div>
          </>
        );

      case "pharmacie":
        return (
          <>
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nom de la pharmacie" className="pl-9" />
            </div>
            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ville" className="pl-9" />
            </div>
          </>
        );

      case "medicaments":
        return (
          <>
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nom du médicament" className="pl-9" />
            </div>
          </>
        );

      case "questions":
        return (
          <>
            <div className="relative md:col-span-4">
              <Input placeholder="Sujet de la question" />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background via-background to-blue-50/50 dark:from-background dark:via-background/95 dark:to-blue-950/20 min-h-[calc(100vh-4rem)]">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-20 h-20 bg-primary/20 rounded-full blur-xl" />

      <div className="mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 md:py-10">
          {/* Left content */}
          <motion.div
            className="space-y-8 pt-8"
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
                  Plateforme de santé #1 en Afrique
                </Badge>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="text-primary">Nous nous soucions</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  de votre santé
                </span>
              </motion.h1>

              <motion.p
                className="text-base md:text-lg text-muted-foreground max-w-[600px] leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Une bonne santé est un état de bien-être mental, physique et
                social et ne signifie pas seulement l&apos;absence de maladies.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Link href="/appointments">
                <Button
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90 flex items-center justify-center transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:translate-y-[-2px]"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Button>
              </Link>
              <Link className="group gap-3 flex items-center" href="#">
                <motion.div
                  className="flex items-center bg-transparent rounded-full p-1 border border-primary"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="p-2 rounded-full bg-primary group-hover:bg-primary/90 transition-colors">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </motion.div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  Regarder des vidéos
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span className="text-muted-foreground">
                Devenir membre de notre communauté hospitalière?
              </span>
              <Link
                href="/patient/forum"
                className="text-primary hover:text-primary/80 font-medium flex items-center group"
              >
                Connexion
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
                <span className="text-sm font-medium">Médecins certifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Rendez-vous 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Suivi personnalisé</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - Image and floating cards */}
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
                  alt="Doctors"
                  width={600}
                  height={600}
                  priority
                />
              </div>

              {/* Floating cards */}
              <motion.div
                className="absolute z-20 -top-6 -left-6 bg-background dark:bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Médecins qualifiés</p>
                    <p className="text-xs text-muted-foreground">
                      +200 spécialistes
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute z-20 -bottom-6 -right-6 bg-background dark:bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Assistance 24/7</p>
                    <p className="text-xs text-muted-foreground">
                      Support médical
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Search card */}
        <motion.div
          className="relative z-20 mb-16"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Card className="border shadow-xl bg-background/95 backdrop-blur-md dark:bg-background/80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10" />
            <CardContent className="p-6 relative">
              {/* Mobile select */}
              <div className="sm:hidden mb-6">
                <select
                  onChange={(e) => handleTabChange(e.target.value)}
                  value={activeTab}
                  className="w-full p-3 rounded-lg border border-input bg-background"
                >
                  <option value="medecin">Médecin</option>
                  <option value="pharmacie">Pharmacie</option>
                  <option value="medicaments">Médicaments</option>
                  <option value="questions">Questions</option>
                </select>
              </div>

              {/* Desktop tabs */}
              <div className="hidden sm:block">
                <Tabs
                  defaultValue="medecin"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 mb-6 bg-accent">
                    <TabsTrigger
                      value="medecin"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Médecin
                    </TabsTrigger>
                    <TabsTrigger
                      value="pharmacie"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Pharmacie
                    </TabsTrigger>
                    <TabsTrigger
                      value="medicaments"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Médicaments
                    </TabsTrigger>
                    <TabsTrigger
                      value="questions"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Questions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    <div className="grid gap-4 md:grid-cols-5">
                      {renderFormFields()}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
                        size="lg"
                      >
                        <Search className="mr-2 h-4 w-4" /> Chercher
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Mobile form fields */}
              <div className="sm:hidden">
                <div className="grid gap-4 md:grid-cols-5">
                  {renderFormFields()}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Search className="mr-2 h-4 w-4" /> Chercher
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
