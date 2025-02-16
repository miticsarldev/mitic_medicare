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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("medecin");

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
                Une bonne santé est un état de bien-être mental, physique et
                social et ne signifie pas seulement l&apos;absence de maladies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button
                size="lg"
                className="gap-2 bg-[#107ACA] flex items-center justify-center hover:bg-[#0A5A8A] transition-all duration-300"
              >
                <Calendar className="h-5 w-5" />
                Prendre rendez-vous
              </Button>
              <Link className="gap-2 flex items-center justify-center" href="#">
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
                href="/connexion"
                className="text-primary hover:underline font-medium"
              >
                Connexion
                <ChevronRight className="inline-block h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="absolute top-0 right-28 w-1/3 h-full rounded-full">
            <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/30 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-primary/20 dark:bg-primary/40" />
            <Image
              className="relative top-0 rounded-full object-cover h-auto w-full"
              src="/doctors.png"
              alt="Doctors"
              width={400}
              height={400}
            />
          </div>

          <div className="absolute top-4 right-4 md:top-8 md:right-8">
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
        <div className="py-10 px-10">
          <Card className="border-none shadow-lg bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs
                defaultValue="medecin"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="medecin">Médecin</TabsTrigger>
                  <TabsTrigger value="pharmacie">Pharmacie</TabsTrigger>
                  <TabsTrigger value="medicaments">Médicaments</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-4 md:grid-cols-5">
                <Input
                  placeholder="Nom du professionnel de santé"
                  className="md:col-span-1"
                />
                <Input placeholder="Spécialité" className="md:col-span-1" />
                <Input
                  type="email"
                  placeholder="Mail"
                  className="md:col-span-1"
                />
                <Input placeholder="Ville" className="md:col-span-1" />
                <Button className="w-full mt-4" size="lg">
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
