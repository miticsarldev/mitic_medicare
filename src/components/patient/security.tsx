"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertTriangle, Eye, EyeOff, Key, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signOut } from "next-auth/react";
import { changePassword, deleteAccount } from "@/app/dashboard/patient/actions";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      form.reset();
      signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de modifier votre mot de passe. Vérifiez que votre mot de passe actuel est correct.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast({
        title: "Erreur",
        description:
          "Veuillez saisir SUPPRIMER pour confirmer la suppression de votre compte.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteAccount();
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
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre compte.",
        variant: "destructive",
      });
    }
  };

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
        <div className="md:col-span-6 lg:col-span-8 space-y-6">
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
        </div>

        <div className="md:col-span-6 lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles pour votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          toutes vos données, y compris votre historique médical
                          et vos rendez-vous.
                        </AlertDescription>
                      </Alert>
                      <p className="text-sm">
                        Veuillez taper{" "}
                        <span className="font-bold">SUPPRIMER</span> pour
                        confirmer.
                      </p>
                      <Input
                        placeholder="SUPPRIMER"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                      />
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
