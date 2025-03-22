"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CalendarDays, MapPin, Save, Upload } from "lucide-react";

export default function Page() { 
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Paramètres enregistrés !");
    }, 1500);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">
          Paramètres du Médecin
        </h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/doctor">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Paramètres</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-medium">Configuration Générale</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les paramètres de votre profil et de votre cabinet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Réinitialiser</Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="cabinet" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Cabinet</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Calendrier</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations de profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-name">Nom complet</Label>
                <Input id="doctor-name" defaultValue="Dr. Jean Dupont" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speciality">Spécialité</Label>
                <Input id="speciality" defaultValue="Cardiologie" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  defaultValue="Cardiologue expérimenté avec plus de 15 ans de pratique."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Photo de profil</Label>
                <div className="flex items-center justify-center h-40 rounded-md border border-dashed">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      Déposer un fichier ou
                    </span>
                    <Button variant="link" size="sm">
                      parcourir
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG ou SVG. Max 2MB.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Cabinet */}
        <TabsContent value="cabinet" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du Cabinet</CardTitle>
              <CardDescription>
                Configurez les informations de votre cabinet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cabinet-name">Nom du cabinet</Label>
                <Input id="cabinet-name" defaultValue="Cabinet Médical Dupont" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue="12 rue de la Paix, Paris" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" defaultValue="+33 1 23 45 67 89" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="contact@cabinetdupont.com" />
              </div>
            </CardContent>
          </Card>
        </TabsContent> 
        {/* Onglet Calendrier */}
        <TabsContent value="calendar" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Calendrier</CardTitle>
              <CardDescription>
                Configurez vos préférences de calendrier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-duration">Durée des rendez-vous (minutes)</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="appointment-duration">
                    <SelectValue placeholder="Sélectionnez une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilité</Label>
                <Textarea
                  id="availability"
                  defaultValue="Lundi-Vendredi : 9h-18h"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buffer-time">Temps tampon entre les rendez-vous (minutes)</Label>
                <Select defaultValue="10">
                  <SelectTrigger id="buffer-time">
                    <SelectValue placeholder="Sélectionnez un temps tampon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="days-off">Jours de congé</Label>
                <Input
                  id="days-off"
                  placeholder="Ex: 2024-12-25, 2024-01-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calendar-integration">Intégration du calendrier</Label>
                <Select>
                  <SelectTrigger id="calendar-integration">
                    <SelectValue placeholder="Sélectionnez un service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Outlook Calendar</SelectItem>
                    <SelectItem value="apple">Apple Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}