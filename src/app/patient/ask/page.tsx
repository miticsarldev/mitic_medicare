"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { specialties } from "@/constant";
import { Switch } from "@/components/ui/switch";
import { UserCircle, CheckCircle } from "lucide-react";
import Navbar from "@/components/navbar"; 

const isAuthenticated = false; 

export default function AskQuestionForm() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [step, setStep] = useState(1);
  const [showTreatment, setShowTreatment] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    treatment: "",
    medicalHistory: "",
    height: "",
    weight: "",
    hideName: false,
    name: "",
    email: "",
    phone: "",
    files: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(2);
  const handlePrevious = () => setStep(1);

  const handleFileChange = (e) => {
    setFormData({ ...formData, files: e.target.files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Question envoyer", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b bg-gradient-to-b from-background to-blue-100/50 dark:from-background dark:to-blue-950/50 text-gray-900 dark:text-gray-100">
        <div className="max-w-screen-xl mx-auto">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 flex flex-col items-center py-3">
              <div className="w-full max-w-md mb-6">
                  <h2 className="text-xl text-center font-bold mb-4">Posez votre question</h2>
                  <div className="flex justify-center items-center mt-2 space-x-4">
                    <div className={`flex items-center space-x-2 ${step >= 1 ? "text-blue-600" : "text-gray-400 dark:text-gray-500"}`}>
                      <CheckCircle className="w-5 h-5" />
                      <span>Question</span>
                    </div>
                    <Progress value={step === 2 ? 100 : 50} className="w-24" />
                    <div className={`flex items-center space-x-2 ${step === 2 ? "text-gray-400 dark:text-gray-500" : "text-gray-400"}`}>
                      <UserCircle className="w-5 h-5" />
                      <span>Validation</span>
                    </div>
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <form className="space-y-3" onSubmit={handleSubmit}>
                  {step === 1 && (
                    <>
                      <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="dark:bg-gray-700 dark:text-gray-300">
                              <SelectValue placeholder="Sélectionnez un pays" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-700 dark:text-gray-300">
                              {specialties.map((category) => (
                              <SelectItem key={category.value} value={category.value} className="dark:hover:bg-gray-600">
                                  {category.label}
                              </SelectItem>
                              ))}
                          </SelectContent>
                      </Select> 

                      <label className="block mt-4 text-sm font-medium text-gray-700">Question</label>
                      <Input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" placeholder="Titre de la question" />

                      <label className="block mt-4 text-sm font-medium text-gray-700">Description</label>
                      <Textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" placeholder="Décrivez votre problème..." />

                      <div className="flex items-center justify-between mt-4">
                        <label className="text-sm font-medium text-gray-700">Traitement en cours</label>
                        <Switch checked={showTreatment} onCheckedChange={setShowTreatment} className="dark:bg-gray-700 dark:text-gray-300" />
                      </div>
                      {showTreatment && (
                        <Textarea name="treatment" value={formData.treatment} onChange={handleChange} className="w-full p-2 border rounded-md mt-2 dark:bg-gray-700 dark:text-gray-300" placeholder="Décrivez votre traitement actuel..." />
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <label className="text-sm font-medium text-gray-700">Antécédents médicaux</label>
                        <Switch checked={showMedicalHistory} onCheckedChange={setShowMedicalHistory} className="dark:bg-gray-700 dark:text-gray-300" />
                      </div>
                      {showMedicalHistory && (
                        <Textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} className="w-full p-2 border rounded-md mt-2 dark:bg-gray-700 dark:text-gray-300" placeholder="Décrivez vos antécédents médicaux..." />
                      )}
                      
                      <div className="flex mt-4 space-x-2">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
                          <Input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" placeholder="Ex: 170" />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
                          <Input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" placeholder="Ex: 65" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <label className="text-sm font-medium text-gray-700">Masquer mon nom</label>
                        <Switch checked={formData.hideName} onCheckedChange={(value) => setFormData({ ...formData, hideName: value })} className="dark:bg-gray-700 dark:text-gray-300" />
                      </div>

                      <label htmlFor="fileUpload" className="block mt-4 text-sm font-medium text-gray-700">Sélectionner un fichier</label>
                      <Input id="fileUpload" type="file" name="files" onChange={handleFileChange} multiple className="dark:bg-gray-700 dark:text-gray-300" />
                      
                      <div className="flex justify-between mt-6">
                        <Button onClick={handleNext} className="bg-blue-600 text-white w-full">Suivant</Button>
                      </div> 
                    </>
                  )}

                  {!isAuthenticated && step === 2 && (
                    <>
                      <label className="block text-sm font-medium text-gray-700">Nom et prénom</label>
                      <Input type="text" name="name" placeholder="Votre nom" className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" value={formData.name} onChange={handleChange} />

                      <label className="block mt-4 text-sm font-medium text-gray-700">E-mail</label>
                      <Input type="email" name="email" placeholder="Votre email" className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" value={formData.email} onChange={handleChange} />

                      <label className="block mt-4 text-sm font-medium text-gray-700">Téléphone</label>
                      <Input type="tel" name="phone" placeholder="Votre numéro" className="w-full p-2 border rounded-md mt-1 dark:bg-gray-700 dark:text-gray-300" value={formData.phone} onChange={handleChange} />

                      <div className="flex justify-between mt-6">
                        <Button onClick={handlePrevious} variant="outline">Précédent</Button>
                        <Button type="submit" className="bg-blue-600 text-white">Envoyer</Button>
                      </div>
                    </>
                  )} 

                  {isAuthenticated && step === 2 && (
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">Votre question est prête à être envoyée !</p>
                      <Button type="submit" className="mt-4 bg-blue-600 text-white">Envoyer</Button>
                    </div>
                  )}
                </form>
              </div>
            </main>
        </div>
    </div>
  );
}
