import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-100/50 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />
        {/* Main Content */}
        <main className="container px-4 py-8 md:py-12">
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-xl md:text-2xl font-semibold text-center px-4">
              Vous avez déja utilisé{" "}
              <span className="text-primary">MediCare</span> ?
            </h1>

            <div className="bg-card dark:bg-card/50 rounded-lg shadow-lg p-6 backdrop-blur-sm">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Insription</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-4">
                    <h2 className="text-lg md:text-xl font-medium">
                      Veuillez saisir vos informations
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input type="email" placeholder="Adresse email" />
                      </div>
                      <div className="space-y-2">
                        <Input type="password" placeholder="Mot de passe" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Se souvenir de moi
                        </label>
                      </div>
                      <Button className="w-full" size="lg">
                        Se connecter
                      </Button>
                      <div className="text-center">
                        <Link
                          href="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Vous avez perdu votre mot de passe ?
                        </Link>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Vous êtes un professionnel de santé ?
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background dark:bg-card/50 px-2 text-muted-foreground">
                          où
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-lg md:text-xl font-medium">
                        Merci de saisir vos informations
                      </h2>

                      <RadioGroup defaultValue="femme" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="femme" id="femme" />
                          <Label htmlFor="femme">Femme</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="homme" id="homme" />
                          <Label htmlFor="homme">Homme</Label>
                        </div>
                      </RadioGroup>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input placeholder="Nom" />
                        <Input placeholder="Prénom" />
                      </div>
                      <Input placeholder="Numéro" />
                      <Input type="email" placeholder="Adresse email" />
                      <Input type="password" placeholder="Mot de passe" />

                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Accepter les politiques et confidentialiter de notre
                          plateforme
                        </label>
                      </div>

                      <Button className="w-full" size="lg">
                        Soumettre
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
