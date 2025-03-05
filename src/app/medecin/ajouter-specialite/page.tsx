"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AjouterSpecialite() {
  const router = useRouter();
  const [specialite, setSpecialite] = useState({ nom: "", description: "" });
  const [errors, setErrors] = useState({ nom: "", description: "" });

  const validate = () => {
    let isValid = true;
    const newErrors = { nom: "", description: "" };

    if (!specialite.nom.trim()) {
      newErrors.nom = "Le nom de la spécialité est requis.";
      isValid = false;
    }

    if (!specialite.description.trim()) {
      newErrors.description = "Veuillez ajouter une description.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Données soumises:", specialite);
    alert("Spécialité ajoutée avec succès !");
    router.push("/medecin/specialites");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-800 dark:text-white">
            Ajouter une Spécialité Médicale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom de la spécialité */}
            <div>
              <Label htmlFor="nom" className="text-gray-700 dark:text-gray-300">
                Nom de la spécialité
              </Label>
              <Input
                id="nom"
                type="text"
                placeholder="Ex: Cardiologie"
                value={specialite.nom}
                onChange={(e) => setSpecialite({ ...specialite, nom: e.target.value })}
                className="mt-2"
              />
              {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez la spécialité..."
                value={specialite.description}
                onChange={(e) => setSpecialite({ ...specialite, description: e.target.value })}
                className="mt-2"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Boutons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()} className="w-1/3">
                Annuler
              </Button>
              <Button type="submit" className="w-1/3 bg-blue-600 hover:bg-blue-700">
                Ajouter la spécialité
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
