"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Navbar from "@/components/navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { annee } from "@/constant";

export default function ProfilePage() {
  const [ancienPassword, setAncienPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* NavBar */}
        <Navbar />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Modifier mes informations */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Modifier mes informations
            </h2>
            <div className="mt-4 space-y-4">
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
              <Input
                placeholder="Nom"
                className="w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Input
                placeholder="Prénom"
                className="w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {[...Array(31)].map((_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Mois" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {annee
                      .filter((item) => item.value)
                      .map((annee, i) => (
                        <SelectItem key={i} value={annee.value}>
                          {annee.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {[...Array(100)].map((_, i) => (
                      <SelectItem key={i} value={`${2024 - i}`}>
                        {2024 - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Localité" className="w-full" />
              <Input placeholder="Numéro de téléphone" className="w-full" />
              <Input placeholder="Email" className="w-full" disabled />
              <div className="flex justify-center">
                <Button className="w-50 bg-blue-600 dark:bg-blue-500 text-white font-bold py-2 rounded">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>

          {/* Section Modifier mot de passe */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-md flex flex-col h-full">
            <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Modifier mon mot de passe
            </h2>
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Input
                  type={showPassword1 ? "text" : "password"}
                  placeholder="Ancien le mot de passe"
                  value={ancienPassword}
                  onChange={(e) => setAncienPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword1 ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword2 ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword3 ? "text" : "password"}
                  placeholder="Confirmez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword3(!showPassword3)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword3 ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="flex justify-center">
                <Button className="w-50 bg-blue-600 dark:bg-blue-500 text-white font-bold py-2 rounded">
                  Mettre à jour
                </Button>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <div className="flex justify-center">
                <Button className="w-50 text-white bg-red-600 dark:bg-red-500 cursor-pointer font-bold py-2 rounded">
                  Supprimer mon compte
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
