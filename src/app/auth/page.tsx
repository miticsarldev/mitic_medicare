"use client";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import Image from "next/image";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />
        {/* Main Content */}
        <main className="container px-4 py-8 md:py-6 flex flex-col md:flex-row items-stretch">
          {/* Image Section */}
          <div className="hidden md:flex w-1/2 relative">
            <Image
              src="/doctors.png"
              alt="Doctors"
              width={400} 
              height={200}
              objectFit="cover"
              className="rounded-l-lg absolute top-[-60px]"
            />
          </div>
          
          {/* Form Section */}
          <div className="w-full md:w-1/2 max-w-md mx-auto space-y-6">
            <h1 className="text-xl md:text-2xl font-semibold text-center px-4">
              Vous avez déjà utilisé <span className="text-primary">Medi<span className="text-[#107ACA]">Care</span></span> ?
            </h1>
  
            <div className="bg-card dark:bg-card/50 rounded-lg shadow-lg p-6 backdrop-blur-sm">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
  
                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <h2 className="text-lg md:text-xl font-medium">Veuillez saisir vos informations</h2>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input type="email" placeholder="Adresse email" className="w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div> 
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="text-[#107ACA] border-[#107ACA] focus:ring-[#107ACA]" />
                    <label htmlFor="remember" className="text-sm font-medium">Se souvenir de moi</label>
                  </div>
                  <Button className="w-full bg-[#107ACA]" size="lg">Se connecter</Button>
                  <div className="text-center">
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      Vous avez perdu votre mot de passe ?
                    </Link>
                  </div>
                </TabsContent>
  
                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <Link href="/auth/doctor" >
                    <Button variant="outline" className="w-full">Vous êtes un professionnel de santé ?</Button>
                  </Link>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background dark:bg-card/50 px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>
                  <h2 className="text-lg md:text-xl font-medium">Merci de saisir vos informations</h2>
                  <div className="flex justify-center">
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Nom" />
                    <Input placeholder="Prénom" />
                  </div>
                  <div className="relative">
                    <Input placeholder="Numéro" className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input type="email" placeholder="Adresse email" className="w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div> 
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm font-medium">Accepter les politiques et confidentialité</label>
                  </div>
                  <Button className="w-full bg-[#107ACA]" size="lg">Soumettre</Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
  
}
