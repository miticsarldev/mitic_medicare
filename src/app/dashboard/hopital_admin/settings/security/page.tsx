"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Key,
  Loader2,
  LogOut,
  Shield,
  User,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Le mot de passe actuel doit contenir au moins 8 caractères.",
    }),
    newPassword: z.string().min(8, {
      message: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    }),
    confirmPassword: z.string().min(8, {
      message:
        "La confirmation du mot de passe doit contenir au moins 8 caractères.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  // Default values for the form
  const defaultValues: Partial<PasswordFormValues> = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: PasswordFormValues) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      form.reset();
    }, 1000);

    console.log(data);
  }

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast({
      title: checked
        ? "Authentification à deux facteurs activée"
        : "Authentification à deux facteurs désactivée",
      description: checked
        ? "Votre compte est maintenant plus sécurisé."
        : "Votre compte est maintenant moins sécurisé.",
      variant: checked ? "default" : "destructive",
    });
  };

  const handleEmailNotificationsToggle = (checked: boolean) => {
    setEmailNotificationsEnabled(checked);
    toast({
      title: checked
        ? "Notifications par email activées"
        : "Notifications par email désactivées",
      description: "Vos préférences de notification ont été mises à jour.",
    });
  };

  const handleSmsNotificationsToggle = (checked: boolean) => {
    setSmsNotificationsEnabled(checked);
    toast({
      title: checked
        ? "Notifications par SMS activées"
        : "Notifications par SMS désactivées",
      description: "Vos préférences de notification ont été mises à jour.",
    });
  };

  const handleDeleteAccount = () => {
    // Delete account logic would go here
    toast({
      title: "Compte supprimé",
      description:
        "Votre compte a été supprimé avec succès. Vous allez être redirigé vers la page d'accueil.",
      variant: "destructive",
    });
    setDeleteAccountDialogOpen(false);

    // Redirect to home page
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  // Recent activities
  const recentActivities = [
    {
      id: "1",
      type: "login",
      device: "iPhone 13",
      location: "Paris, France",
      ip: "192.168.1.1",
      date: "Aujourd'hui, 10:45",
      current: true,
    },
    {
      id: "2",
      type: "password_change",
      device: "MacBook Pro",
      location: "Paris, France",
      ip: "192.168.1.1",
      date: "Hier, 18:30",
      current: false,
    },
    {
      id: "3",
      type: "login",
      device: "Chrome sur Windows",
      location: "Lyon, France",
      ip: "192.168.1.2",
      date: "15 mars 2025, 14:20",
      current: false,
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sécurité & Confidentialité</h1>
          <p className="text-muted-foreground">
            Gérez la sécurité de votre compte et vos préférences de
            confidentialité
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Changer de mot de passe
              </CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe pour sécuriser votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe actuel</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Votre mot de passe actuel"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showCurrentPassword
                                  ? "Masquer le mot de passe"
                                  : "Afficher le mot de passe"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Votre nouveau mot de passe"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showNewPassword
                                  ? "Masquer le mot de passe"
                                  : "Afficher le mot de passe"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Utilisez un mot de passe fort avec au moins 8
                          caractères, incluant des lettres, des chiffres et des
                          caractères spéciaux.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirmez votre nouveau mot de passe"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showConfirmPassword
                                  ? "Masquer le mot de passe"
                                  : "Afficher le mot de passe"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le mot de passe"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentification à deux facteurs
              </CardTitle>
              <CardDescription>
                Ajoutez une couche de sécurité supplémentaire à votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">
                    Authentification à deux facteurs
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recevez un code de vérification par SMS lors de la
                    connexion.
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>

              {twoFactorEnabled && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>
                    Authentification à deux facteurs activée
                  </AlertTitle>
                  <AlertDescription>
                    Votre compte est protégé par une authentification à deux
                    facteurs. Un code de vérification sera envoyé à votre
                    téléphone lors de la connexion.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Activité récente
              </CardTitle>
              <CardDescription>
                Consultez les activités récentes sur votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {activity.type === "login"
                            ? "Connexion"
                            : "Changement de mot de passe"}
                        </span>
                        {activity.current && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            Session actuelle
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.device} • {activity.location}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        IP: {activity.ip} • {activity.date}
                      </div>
                    </div>
                    {!activity.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        Déconnecter
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir toutes les activités
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Gérez vos préférences de notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Notifications par email
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Recevez des notifications par email.
                  </div>
                </div>
                <Switch
                  checked={emailNotificationsEnabled}
                  onCheckedChange={handleEmailNotificationsToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Notifications par SMS
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Recevez des notifications par SMS.
                  </div>
                </div>
                <Switch
                  checked={smsNotificationsEnabled}
                  onCheckedChange={handleSmsNotificationsToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles pour votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  Déconnexion de toutes les sessions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Déconnectez-vous de toutes les sessions actives sur tous vos
                  appareils.
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnecter toutes les sessions
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-destructive">
                  Supprimer le compte
                </h3>
                <p className="text-xs text-muted-foreground">
                  Supprimez définitivement votre compte et toutes vos données.
                  Cette action est irréversible.
                </p>
                <Dialog
                  open={deleteAccountDialogOpen}
                  onOpenChange={setDeleteAccountDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full" size="sm">
                      Supprimer mon compte
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Supprimer votre compte
                      </DialogTitle>
                      <DialogDescription>
                        Cette action est irréversible. Toutes vos données seront
                        définitivement supprimées.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Attention</AlertTitle>
                        <AlertDescription>
                          La suppression de votre compte entraînera la perte de
                          toutes vos données, y compris votre historique
                          médical, vos rendez-vous et vos abonnements.
                        </AlertDescription>
                      </Alert>
                      <p className="text-sm">
                        Veuillez taper{" "}
                        <span className="font-bold">SUPPRIMER</span> pour
                        confirmer.
                      </p>
                      <Input placeholder="SUPPRIMER" />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteAccountDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        Supprimer définitivement
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
