"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("medecin");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case "medecin":
        return (
          <>
            <Input placeholder="Nom du professionnel de santé" className="md:col-span-1" />
            <Input placeholder="Spécialité" className="md:col-span-1" />
            <Input type="email" placeholder="Mail" className="md:col-span-1" />
            <Input placeholder="Ville" className="md:col-span-1" />
          </>
        );

      case "pharmacie":
        return (
          <>
            <Input placeholder="Nom de la pharmacie" className="md:col-span-2" />
            <Input placeholder="Ville" className="md:col-span-1" />
            <Input placeholder="Quartier" className="md:col-span-1" />
          </>
        );

      case "medicaments":
        return (
          <>
            <Input placeholder="Nom du médicament" className="md:col-span-4" />
          </>
        );

      case "questions":
        return (
          <>
            <Input placeholder="Sujet de la question" className="md:col-span-2" />
            <Input placeholder="Votre email" type="email" className="md:col-span-2" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
      <div className="flex flex-col">
        <div className="items-center py-20 px-10 relative">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-[#107ACA]">Nous nous soucions</span>
                <br />à propos de votre santé
              </h1>
              <p className="text-base text-muted-foreground max-w-[600px]">
                Une bonne santé est un état de bien-être mental, physique et social et ne signifie pas seulement l&apos;absence de maladies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/appointments">
                <Button size="lg" className="gap-2 bg-[#107ACA] flex items-center justify-center hover:bg-[#0A5A8A] transition-all duration-300">
                  <Calendar className="h-5 w-5" />
                  Prendre rendez-vous
                </Button>
              </Link>
              <Link className="gap-2 flex items-center" href="#">
                <div className="flex items-center bg-transparent rounded-full p-1 border border-[#107ACA]">
                  <div className="p-2 rounded-full bg-[#107ACA]">
                    <Play className="h-5 w-5" />
                  </div>
                </div>
                Regarder des vidéos
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Devenir membre de notre communauté hospitalière?</span>
              <Link
                href="/patient/forum"
                className="text-primary hover:underline font-medium"
              >
                Connexion
                <ChevronRight className="inline-block h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="absolute top-0 right-28 w-1/3 h-full rounded-full">
            <div className="hidden sm:block absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/30 animate-pulse" />
            <div className="hidden sm:block absolute inset-4 rounded-full bg-primary/20 dark:bg-primary/40" />
            <Image
              className="relative top-0 rounded-full object-cover h-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl hidden sm:block"
              src="/doctors.png"
              alt="Doctors"
              width={400}
              height={400}
            />
          </div>

          <div className="absolute top-4 right-4 md:top-8 md:right-8 hidden sm:block">
            <div className="bg-background dark:bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium">Médecins hautement qualifiés</p>
                  <p className="text-sm text-muted-foreground">
                    Traiter avec soin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*les Tabs */}
        <div className="py-10 px-10">
          <Card className="border-none shadow-lg bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Sur Mobile */}
              <div className="sm:hidden mb-6">
                <select
                  onChange={(e) => handleTabChange(e.target.value)}
                  className="w-400 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-background dark:bg-background/80"
                >
                  <option value="medecin">Médecin</option>
                  <option value="pharmacie">Pharmacie</option>
                  <option value="medicaments">Médicaments</option>
                  <option value="questions">Questions</option>
                </select>
              </div>

              {/* Sur Pc */}
              <div className="hidden sm:block">
                <Tabs defaultValue="medecin" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="medecin">Médecin</TabsTrigger>
                    <TabsTrigger value="pharmacie">Pharmacie</TabsTrigger>
                    <TabsTrigger value="medicaments">Médicaments</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Champs dynamiques selon l'onglet sélectionné */}
              <div className="grid gap-4 md:grid-cols-5">
                {renderFormFields()}
                <Button className="w-full" size="lg">
                  <Search className="mr-2 h-4 w-4" /> Chercher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}