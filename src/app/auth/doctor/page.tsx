"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/selected";
import { Button } from "@/components/ui/button"; 
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image"; 

const countries = [
    { value: "Mali", label: "Mali" },
    { value: "Burkina-Faso", label: "Burkina-Faso" },
    { value: "Niger", label: "Niger" },
];
const governorates = [
  { value: "Bamako", label: "Bamako" },
  { value: "Waga", label: "Waga" },
  { value: "Niamey", label: "Niamey" },
];

const specialties = [
  { value: "cardiologue", label: "Cardiologue" },
  { value: "dermatologue", label: "Dermatologue" },
  { value: "generaliste", label: "Médecin Généraliste" },
];


export default function DoctorRegistration() {
  const [formData, setFormData] = useState({
    country: "",
    governorate: "",
    specialty: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    acceptedTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
        <div className="max-w-screen-xl mx-auto">
            <Navbar />
            <div className="max-w-screen-xl mx-auto md:flex md:justify-between space-y-10">
                {/* Form Section */}
                <div className="md:w-1/2 space-y-4 px-4 py-8">
                    <h1 className="text-2xl font-semibold">Inscription fiche praticien</h1>
                    <p className="text-gray-600">Remplissez ce formulaire pour créer votre fiche praticien</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div> 
                            <Select name="country" label="Pays *" options={countries} value={formData.country} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Select name="governorate" label="Gouvernorat *" options={governorates} value={formData.governorate} onChange={handleChange} />
                            <Select name="specialty" label="Spécialité *" options={specialties} value={formData.specialty} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nom *</Label>
                                <Input name="name" placeholder="Tapez votre nom" onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Prénom *</Label>
                                <Input name="surname" placeholder="Tapez votre prénom" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Adresse mail *</Label>
                                <Input name="email" type="email" placeholder="Tapez votre adresse mail" onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Téléphone Mobile *</Label>
                                <Input name="phone" type="tel" placeholder="Tapez votre numéro mobile" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Checkbox name="acceptedTerms" onChange={handleChange} />
                        <p className="text-sm">
                            J&apos;accepte les <span className="font-bold">CGU</span> ainsi que <span className="font-bold">la charte de Med</span>
                        </p>
                        </div>
                        <Button type="submit" className="w-full  text-white font-bold py-2 rounded">
                            Soumettre ma demande
                        </Button>
                    </form>
                </div>

                {/* Image Section */}
                <div className="hidden md:block md:w-1/2 text-center flex justify-end">
                    <div className="flex justify-end px-4">
                        <Image 
                            src="/doc.webp" 
                            alt="baniere" 
                            className="rounded-lg shadow-lg w-[550px]" 
                            width={350}
                            height={90} 
                        />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">Renseignez votre plaque digitale</h2>
                    <p className="text-gray-600">Un profil personnalisé, accessible depuis la plateforme Med et depuis Google, pour être trouvé facilement</p>
                </div>
            </div>
        </div>
    </div>
  );
}
