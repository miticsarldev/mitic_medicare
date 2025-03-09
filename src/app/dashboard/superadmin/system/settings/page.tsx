"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Cloud,
  Database,
  Globe,
  HardDrive,
  Info,
  Languages,
  Moon,
  Save,
  Server,
  Settings,
  Shield,
  Sun,
  Upload,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("fr");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [apiRateLimit, setApiRateLimit] = useState("100");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [databaseSize, setDatabaseSize] = useState(42);

  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">
          Paramètres Système
        </h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/superadmin">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/superadmin/system">
                Système
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
            Gérez les paramètres globaux de la plateforme
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Général</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>Stockage</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>Avancé</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations du Site</CardTitle>
                <CardDescription>
                  Configurez les informations de base de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nom du site</Label>
                  <Input id="site-name" defaultValue="MediConnect" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">URL du site</Label>
                  <Input
                    id="site-url"
                    defaultValue="https://mediconnect.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email administrateur</Label>
                  <Input
                    id="admin-email"
                    defaultValue="admin@mediconnect.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Description du site</Label>
                  <Textarea
                    id="site-description"
                    defaultValue="Plateforme de mise en relation entre patients et professionnels de santé"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localisation & Langue</CardTitle>
                <CardDescription>
                  Configurez les paramètres régionaux et linguistiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-language">Langue par défaut</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="default-language">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select defaultValue="europe-paris">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-paris">
                        Europe/Paris (UTC+01:00)
                      </SelectItem>
                      <SelectItem value="europe-london">
                        Europe/London (UTC+00:00)
                      </SelectItem>
                      <SelectItem value="america-new_york">
                        America/New_York (UTC-05:00)
                      </SelectItem>
                      <SelectItem value="asia-tokyo">
                        Asia/Tokyo (UTC+09:00)
                      </SelectItem>
                      <SelectItem value="australia-sydney">
                        Australia/Sydney (UTC+10:00)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Format de date</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Sélectionnez un format de date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Sélectionnez une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="usd">Dollar US ($)</SelectItem>
                      <SelectItem value="gbp">Livre Sterling (£)</SelectItem>
                      <SelectItem value="jpy">Yen Japonais (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mode Maintenance</CardTitle>
              <CardDescription>
                Activez le mode maintenance pour effectuer des mises à jour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">
                    Activer le mode maintenance
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Lorsqu&apos;il est activé, seuls les administrateurs peuvent
                    accéder au site
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              {maintenanceMode && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="maintenance-message">
                    Message de maintenance
                  </Label>
                  <Textarea
                    id="maintenance-message"
                    defaultValue="Notre site est actuellement en maintenance. Nous serons de retour très bientôt. Merci de votre patience."
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center gap-4 mt-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="maintenance-start">Date de début</Label>
                      <Input id="maintenance-start" type="datetime-local" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="maintenance-end">
                        Date de fin (estimée)
                      </Label>
                      <Input id="maintenance-end" type="datetime-local" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline-block mr-1" />
                Le mode maintenance affiche une page d&apos;attente aux
                utilisateurs non-administrateurs
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Apparence */}
        <TabsContent value="appearance" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thème</CardTitle>
                <CardDescription>
                  Personnalisez l&apos;apparence de l&apos;interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mode d&apos;affichage</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                        theme === "light"
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Clair</span>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                        theme === "dark"
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Sombre</span>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                        theme === "system"
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setTheme("system")}
                    >
                      <Settings className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Système</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      "#0ea5e9",
                      "#8b5cf6",
                      "#ec4899",
                      "#f97316",
                      "#10b981",
                      "#64748b",
                    ].map((color) => (
                      <div
                        key={color}
                        className="h-10 rounded-md cursor-pointer border hover:opacity-90 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        {color === "#0ea5e9" && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="font-family">Police de caractères</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Sélectionnez une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                      <SelectItem value="open-sans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personnalisation</CardTitle>
                <CardDescription>
                  Personnalisez l&apos;identité visuelle de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo</Label>
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
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center justify-center h-20 rounded-md border border-dashed">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <Button variant="link" size="sm">
                        Parcourir
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        ICO, PNG. Max 1MB.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-background">
                    Image de fond (page de connexion)
                  </Label>
                  <div className="flex items-center justify-center h-20 rounded-md border border-dashed">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <Button variant="link" size="sm">
                        Parcourir
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG. Max 5MB.
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mise en page</CardTitle>
              <CardDescription>
                Configurez la disposition des éléments de l&apos;interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sidebar-position">
                    Position de la barre latérale
                  </Label>
                  <Select defaultValue="left">
                    <SelectTrigger id="sidebar-position">
                      <SelectValue placeholder="Sélectionnez une position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Gauche</SelectItem>
                      <SelectItem value="right">Droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-width">Largeur du contenu</Label>
                  <Select defaultValue="fixed">
                    <SelectTrigger id="content-width">
                      <SelectValue placeholder="Sélectionnez une largeur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixe</SelectItem>
                      <SelectItem value="fluid">Fluide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="navbar-style">
                    Style de la barre de navigation
                  </Label>
                  <Select defaultValue="sticky">
                    <SelectTrigger id="navbar-style">
                      <SelectValue placeholder="Sélectionnez un style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sticky">Fixe en haut</SelectItem>
                      <SelectItem value="static">Statique</SelectItem>
                      <SelectItem value="hidden">Masquée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-style">Style du pied de page</Label>
                  <Select defaultValue="simple">
                    <SelectTrigger id="footer-style">
                      <SelectValue placeholder="Sélectionnez un style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="detailed">Détaillé</SelectItem>
                      <SelectItem value="hidden">Masqué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Mode compact</Label>
                  <p className="text-sm text-muted-foreground">
                    Réduit l&apos;espacement entre les éléments pour afficher
                    plus de contenu
                  </p>
                </div>
                <Switch id="compact-mode" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Active les animations et transitions dans l&apos;interface
                  </p>
                </div>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Authentification</CardTitle>
                <CardDescription>
                  Configurez les paramètres d&apos;authentification et de
                  sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">
                    Expiration de session (minutes)
                  </Label>
                  <Select
                    value={sessionTimeout}
                    onValueChange={setSessionTimeout}
                  >
                    <SelectTrigger id="session-timeout">
                      <SelectValue placeholder="Sélectionnez une durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                      <SelectItem value="240">4 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">
                    Tentatives de connexion max
                  </Label>
                  <Select
                    value={maxLoginAttempts}
                    onValueChange={setMaxLoginAttempts}
                  >
                    <SelectTrigger id="max-login-attempts">
                      <SelectValue placeholder="Sélectionnez un nombre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 tentatives</SelectItem>
                      <SelectItem value="5">5 tentatives</SelectItem>
                      <SelectItem value="10">10 tentatives</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor-auth">
                      Authentification à deux facteurs (2FA)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger la 2FA pour tous les administrateurs
                    </p>
                  </div>
                  <Switch id="two-factor-auth" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="password-expiry">
                      Expiration des mots de passe
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Forcer le changement de mot de passe tous les 90 jours
                    </p>
                  </div>
                  <Switch id="password-expiry" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Politique de mot de passe</CardTitle>
                <CardDescription>
                  Définissez les exigences pour les mots de passe utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-min-length">Longueur minimale</Label>
                  <Select defaultValue="8">
                    <SelectTrigger id="password-min-length">
                      <SelectValue placeholder="Sélectionnez une longueur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 caractères</SelectItem>
                      <SelectItem value="8">8 caractères</SelectItem>
                      <SelectItem value="10">10 caractères</SelectItem>
                      <SelectItem value="12">12 caractères</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-uppercase">
                      Majuscules requises
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger au moins une lettre majuscule
                    </p>
                  </div>
                  <Switch id="require-uppercase" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-numbers">Chiffres requis</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger au moins un chiffre
                    </p>
                  </div>
                  <Switch id="require-numbers" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-symbols">Symboles requis</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger au moins un caractère spécial
                    </p>
                  </div>
                  <Switch id="require-symbols" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="prevent-reuse">
                      Empêcher la réutilisation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Empêcher la réutilisation des 5 derniers mots de passe
                    </p>
                  </div>
                  <Switch id="prevent-reuse" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sécurité avancée</CardTitle>
              <CardDescription>
                Configurez des paramètres de sécurité supplémentaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ip-whitelist">
                    Liste blanche d&apos;adresses IP
                  </Label>
                  <Textarea
                    id="ip-whitelist"
                    placeholder="Entrez les adresses IP autorisées, une par ligne"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Laissez vide pour autoriser toutes les adresses IP
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cors-origins">Origines CORS autorisées</Label>
                  <Textarea
                    id="cors-origins"
                    placeholder="Entrez les domaines autorisés, un par ligne"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Par exemple: https://example.com, https://api.example.com
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="force-https">Forcer HTTPS</Label>
                  <p className="text-sm text-muted-foreground">
                    Rediriger automatiquement les requêtes HTTP vers HTTPS
                  </p>
                </div>
                <Switch id="force-https" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="content-security-policy">
                    Politique de sécurité du contenu (CSP)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Activer les en-têtes CSP pour prévenir les attaques XSS
                  </p>
                </div>
                <Switch id="content-security-policy" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rate-limiting">Limitation de débit</Label>
                  <p className="text-sm text-muted-foreground">
                    Limiter le nombre de requêtes par IP pour prévenir les
                    attaques par force brute
                  </p>
                </div>
                <Switch id="rate-limiting" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">
                  Limite de requêtes API (par minute)
                </Label>
                <Select value={apiRateLimit} onValueChange={setApiRateLimit}>
                  <SelectTrigger id="api-rate-limit">
                    <SelectValue placeholder="Sélectionnez une limite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 requêtes</SelectItem>
                    <SelectItem value="100">100 requêtes</SelectItem>
                    <SelectItem value="300">300 requêtes</SelectItem>
                    <SelectItem value="600">600 requêtes</SelectItem>
                    <SelectItem value="1000">1000 requêtes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                <Shield className="h-4 w-4 inline-block mr-1" />
                Ces paramètres avancés peuvent affecter les performances et
                l&apos;accessibilité du site
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notifications par email</CardTitle>
                <CardDescription>
                  Configurez les paramètres des notifications par email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Notifications par email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activer l&apos;envoi de notifications par email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                {emailNotifications && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email-sender">
                        Adresse d&apos;expéditeur
                      </Label>
                      <Input
                        id="email-sender"
                        defaultValue="noreply@mediconnect.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-sender-name">
                        Nom d&apos;expéditeur
                      </Label>
                      <Input
                        id="email-sender-name"
                        defaultValue="MediConnect"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notifications à envoyer</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="notify-new-users" defaultChecked />
                          <label
                            htmlFor="notify-new-users"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Nouveaux utilisateurs
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notify-new-appointments"
                            defaultChecked
                          />
                          <label
                            htmlFor="notify-new-appointments"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Nouveaux rendez-vous
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="notify-system-alerts" defaultChecked />
                          <label
                            htmlFor="notify-system-alerts"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Alertes système
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notify-security-alerts"
                            defaultChecked
                          />
                          <label
                            htmlFor="notify-security-alerts"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Alertes de sécurité
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration SMTP</CardTitle>
                <CardDescription>
                  Configurez les paramètres du serveur d&apos;envoi
                  d&apos;emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Serveur SMTP</Label>
                  <Input id="smtp-host" defaultValue="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port SMTP</Label>
                  <Input id="smtp-port" defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">
                    Nom d&apos;utilisateur SMTP
                  </Label>
                  <Input id="smtp-username" defaultValue="smtp-user" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Mot de passe SMTP</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    defaultValue="••••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-encryption">Chiffrement</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger id="smtp-encryption">
                      <SelectValue placeholder="Sélectionnez un type de chiffrement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">Aucun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  Tester la configuration SMTP
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Modèles d&apos;emails</CardTitle>
              <CardDescription>
                Personnalisez les modèles d&apos;emails envoyés par le système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-template">Sélectionnez un modèle</Label>
                <Select defaultValue="welcome">
                  <SelectTrigger id="email-template">
                    <SelectValue placeholder="Sélectionnez un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Email de bienvenue</SelectItem>
                    <SelectItem value="password-reset">
                      Réinitialisation de mot de passe
                    </SelectItem>
                    <SelectItem value="appointment-confirmation">
                      Confirmation de rendez-vous
                    </SelectItem>
                    <SelectItem value="appointment-reminder">
                      Rappel de rendez-vous
                    </SelectItem>
                    <SelectItem value="account-verification">
                      Vérification de compte
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Sujet</Label>
                <Input
                  id="email-subject"
                  defaultValue="Bienvenue sur MediConnect"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-content">Contenu</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button variant="outline" size="sm">
                      <Languages className="h-4 w-4 mr-2" />
                      Traductions
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="email-content"
                  className="min-h-[200px] font-mono text-sm"
                  defaultValue={`<!DOCTYPE html>
<html>
<head>
  <title>Bienvenue sur MediConnect</title>
</head>
<body>
  <h1>Bienvenue sur MediConnect, {{name}}!</h1>
  <p>Nous sommes ravis de vous accueillir sur notre plateforme.</p>
  <p>Pour commencer, veuillez confirmer votre compte en cliquant sur le bouton ci-dessous:</p>
  <a href="{{verificationLink}}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 4px;">Confirmer mon compte</a>
  <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
  <p>Cordialement,<br>L'équipe MediConnect</p>
</body>
</html>`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {` Utilisez les variables {{ name }}, {{ verificationLink }},
                  etc. pour personnaliser le contenu`}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <Button variant="outline">
                Réinitialiser au modèle par défaut
              </Button>
              <Button>Enregistrer le modèle</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Stockage */}
        <TabsContent value="storage" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stockage de fichiers</CardTitle>
                <CardDescription>
                  Configurez les paramètres de stockage des fichiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storage-provider">
                    Fournisseur de stockage
                  </Label>
                  <Select defaultValue="local">
                    <SelectTrigger id="storage-provider">
                      <SelectValue placeholder="Sélectionnez un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Stockage local</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-path">Chemin d&apos;upload</Label>
                  <Input id="upload-path" defaultValue="/uploads" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-upload-size">
                    Taille maximale d&apos;upload (MB)
                  </Label>
                  <Select defaultValue="10">
                    <SelectTrigger id="max-upload-size">
                      <SelectValue placeholder="Sélectionnez une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 MB</SelectItem>
                      <SelectItem value="5">5 MB</SelectItem>
                      <SelectItem value="10">10 MB</SelectItem>
                      <SelectItem value="20">20 MB</SelectItem>
                      <SelectItem value="50">50 MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-file-types">
                    Types de fichiers autorisés
                  </Label>
                  <Input
                    id="allowed-file-types"
                    defaultValue=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Séparés par des virgules
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation du stockage</CardTitle>
                <CardDescription>
                  Consultez l&apos;utilisation actuelle de l&apos;espace de
                  stockage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Espace total utilisé</Label>
                    <span className="text-sm font-medium">3.2 GB / 5 GB</span>
                  </div>
                  <Progress value={64} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Images</span>
                    </div>
                    <span>1.8 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Documents</span>
                    </div>
                    <span>0.9 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Vidéos</span>
                    </div>
                    <span>0.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Autres</span>
                    </div>
                    <span>0.1 GB</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Tendance d&apos;utilisation</Label>
                  <div className="h-[150px] w-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Graphique d&apos;utilisation
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <HardDrive className="mr-2 h-4 w-4" />
                  Gérer le stockage
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde automatique</CardTitle>
              <CardDescription>
                Configurez les paramètres de sauvegarde automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">Sauvegarde automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer les sauvegardes automatiques du système
                  </p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>
              {autoBackup && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">
                        Fréquence de sauvegarde
                      </Label>
                      <Select
                        value={backupFrequency}
                        onValueChange={setBackupFrequency}
                      >
                        <SelectTrigger id="backup-frequency">
                          <SelectValue placeholder="Sélectionnez une fréquence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">
                            Toutes les heures
                          </SelectItem>
                          <SelectItem value="daily">Quotidienne</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-retention">
                        Conservation des sauvegardes
                      </Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="backup-retention">
                          <SelectValue placeholder="Sélectionnez une durée" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 jours</SelectItem>
                          <SelectItem value="14">14 jours</SelectItem>
                          <SelectItem value="30">30 jours</SelectItem>
                          <SelectItem value="90">90 jours</SelectItem>
                          <SelectItem value="365">1 an</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-time">Heure de sauvegarde</Label>
                      <Select defaultValue="02:00">
                        <SelectTrigger id="backup-time">
                          <SelectValue placeholder="Sélectionnez une heure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00:00">00:00</SelectItem>
                          <SelectItem value="02:00">02:00</SelectItem>
                          <SelectItem value="04:00">04:00</SelectItem>
                          <SelectItem value="22:00">22:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-destination">
                        Destination de sauvegarde
                      </Label>
                      <Select defaultValue="local">
                        <SelectTrigger id="backup-destination">
                          <SelectValue placeholder="Sélectionnez une destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Stockage local</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="gcs">
                            Google Cloud Storage
                          </SelectItem>
                          <SelectItem value="ftp">Serveur FTP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="backup-database" defaultChecked />
                      <label
                        htmlFor="backup-database"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sauvegarder la base de données
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="backup-files" defaultChecked />
                      <label
                        htmlFor="backup-files"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sauvegarder les fichiers
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="backup-config" defaultChecked />
                      <label
                        htmlFor="backup-config"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sauvegarder les fichiers de configuration
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="backup-encrypt" defaultChecked />
                      <label
                        htmlFor="backup-encrypt"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Chiffrer les sauvegardes
                      </label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <Button variant="outline">
                <Cloud className="mr-2 h-4 w-4" />
                Lancer une sauvegarde manuelle
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Avancé */}
        <TabsContent value="advanced" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de la base de données</CardTitle>
                <CardDescription>
                  Paramètres avancés de la base de données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="db-connection">
                    Connexion à la base de données
                  </Label>
                  <Select defaultValue="mysql">
                    <SelectTrigger id="db-connection">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="db-host">Hôte</Label>
                  <Input id="db-host" defaultValue="localhost" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="db-port">Port</Label>
                    <Input id="db-port" defaultValue="3306" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-name">Nom de la base</Label>
                    <Input id="db-name" defaultValue="mediconnect" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="db-user">Utilisateur</Label>
                    <Input id="db-user" defaultValue="dbuser" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-password">Mot de passe</Label>
                    <Input
                      id="db-password"
                      type="password"
                      defaultValue="••••••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Utilisation de la base de données</Label>
                    <span className="text-sm font-medium">
                      {databaseSize} MB
                    </span>
                  </div>
                  <Progress value={databaseSize} max={100} className="h-2" />
                </div>
                <Button variant="outline" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Tester la connexion
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache & Performance</CardTitle>
                <CardDescription>
                  Configurez les paramètres de cache et d&apos;optimisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cache-driver">Pilote de cache</Label>
                  <Select defaultValue="redis">
                    <SelectTrigger id="cache-driver">
                      <SelectValue placeholder="Sélectionnez un pilote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file">Fichier</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                      <SelectItem value="memcached">Memcached</SelectItem>
                      <SelectItem value="database">Base de données</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cache-prefix">Préfixe de cache</Label>
                  <Input id="cache-prefix" defaultValue="mediconnect_" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">
                    Durée de vie du cache (minutes)
                  </Label>
                  <Select defaultValue="60">
                    <SelectTrigger id="cache-ttl">
                      <SelectValue placeholder="Sélectionnez une durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="1440">1 jour</SelectItem>
                      <SelectItem value="10080">1 semaine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-compression">Compression HTTP</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la compression GZIP des réponses HTTP
                    </p>
                  </div>
                  <Switch id="enable-compression" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-minification">Minification</Label>
                    <p className="text-sm text-muted-foreground">
                      Minifier automatiquement les fichiers CSS et JavaScript
                    </p>
                  </div>
                  <Switch id="enable-minification" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-browser-cache">
                      Cache navigateur
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Optimiser les en-têtes de cache pour les navigateurs
                    </p>
                  </div>
                  <Switch id="enable-browser-cache" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Journalisation & Débogage</CardTitle>
              <CardDescription>
                Configurez les paramètres de journalisation et de débogage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="log-level">Niveau de journalisation</Label>
                  <Select defaultValue="error">
                    <SelectTrigger id="log-level">
                      <SelectValue placeholder="Sélectionnez un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-channel">Canal de journalisation</Label>
                  <Select defaultValue="file">
                    <SelectTrigger id="log-channel">
                      <SelectValue placeholder="Sélectionnez un canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file">Fichier</SelectItem>
                      <SelectItem value="database">Base de données</SelectItem>
                      <SelectItem value="syslog">Syslog</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-max-files">
                    Nombre maximum de fichiers de log
                  </Label>
                  <Select defaultValue="14">
                    <SelectTrigger id="log-max-files">
                      <SelectValue placeholder="Sélectionnez un nombre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 fichiers</SelectItem>
                      <SelectItem value="14">14 fichiers</SelectItem>
                      <SelectItem value="30">30 fichiers</SelectItem>
                      <SelectItem value="60">60 fichiers</SelectItem>
                      <SelectItem value="90">90 fichiers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-path">Chemin des logs</Label>
                  <Input id="log-path" defaultValue="/var/log/mediconnect" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode">Mode débogage</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode débogage (ne pas utiliser en production)
                  </p>
                </div>
                <Switch id="debug-mode" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="display-errors">Afficher les erreurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les erreurs détaillées aux utilisateurs
                  </p>
                </div>
                <Switch id="display-errors" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  X,
                  <Label htmlFor="error-reporting">
                    Signalement d&apos;erreurs
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer automatiquement les rapports d&apos;erreurs aux
                    administrateurs
                  </p>
                </div>
                <Switch id="error-reporting" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Dernières entrées de log</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <pre className="text-xs font-mono">
                    <code>
                      [2025-03-09 07:15:23] production.INFO: Utilisateur
                      connecté ID:1234 IP:192.168.1.1{"\n"}
                      [2025-03-09 07:14:12] production.INFO: Nouvelle
                      inscription utilisateur ID:5678{"\n"}
                      [2025-03-09 07:12:45] production.ERROR: Échec de connexion
                      à la base de données{"\n"}
                      [2025-03-09 07:10:33] production.INFO: Sauvegarde
                      automatique terminée avec succès{"\n"}
                      [2025-03-09 07:00:01] production.INFO: Tâche planifiée
                      démarrée: nettoyage_sessions{"\n"}
                      [2025-03-09 06:58:22] production.WARNING: Utilisation
                      élevée de la mémoire: 85%{"\n"}
                      [2025-03-09 06:55:17] production.INFO: API appelée:
                      /api/users GET{"\n"}
                      [2025-03-09 06:52:09] production.INFO: Rendez-vous créé
                      ID:9876{"\n"}
                      [2025-03-09 06:50:44] production.ERROR: Exception non
                      gérée dans le module de paiement{"\n"}
                      [2025-03-09 06:48:30] production.INFO: Mise à jour du
                      système terminée{"\n"}
                    </code>
                  </pre>
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline-block mr-1" />
                Les modifications des paramètres de journalisation peuvent
                nécessiter un redémarrage du serveur
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
