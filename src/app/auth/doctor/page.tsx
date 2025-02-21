"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Button } from "@/components/ui/button"; 
import { Checkbox } from "@/components/ui/checkbox";
import { countries, governorates, specialties } from "@/constant";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import Image from "next/image"; 
import { SelectValue } from "@radix-ui/react-select";
import Link from "next/link";
import { ServicesSection } from "@/components/security-section";
 


export default function DoctorRegistration() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGouvernorat, setSelectedGouvernorat] = useState("");
  const [selectedSpecialite, setSelectedSpecialite] = useState("");
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
    <div className="min-h-screen from-background to-blue-200 dark:from-background dark:to-blue-950/50">
        <div className="max-w-screen-xl mx-auto">
            <Navbar />
            <div className="max-w-screen-xl mx-auto md:flex md:justify-between space-y-10">
                {/* Form Section */}
                <div className="md:w-1/2 space-y-4 px-4 py-8">
                    <h1 className="text-2xl font-semibold">Inscription fiche praticien</h1>
                    <p className="text-gray-600 dark:text-white">Remplissez ce formulaire pour créer votre fiche praticien</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div> 
                            <label>Pays *</label>
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un pays" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                    <SelectItem key={country.value} value={country.value}>
                                        {country.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select> 
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Gouvernorat *</label>
                                <Select value={selectedGouvernorat} onValueChange={setSelectedGouvernorat}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un governorat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {governorates.map((governorate) => (
                                    <SelectItem key={governorate.value} value={governorate.value}>
                                        {governorate.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label>Spécialité *</label>
                                <Select value={selectedSpecialite} onValueChange={setSelectedSpecialite}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un governorat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialties.map((specialty) => (
                                    <SelectItem key={specialty.value} value={specialty.value}>
                                        {specialty.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div> 
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
                            J&apos;accepte les <span className="font-bold">CGU</span> ainsi que <span className="font-bold">la charte de Medi<span  className="text-[#107ACA]">Care</span></span>
                        </p>
                        </div> 
                        <div className="flex justify-center">
                            <Button type="submit" className="w-50 font-bold py-2 rounded bg-primary text-white dark:bg-gray-800 dark:text-white hover:bg-primary/90 dark:hover:bg-gray-700">
                                Soumettre ma demande
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Image Section */}
                <div className="hidden md:block md:w-1/2 text-center flex justify-end">
                    <div className="flex justify-end px-4">
                        <Link href="/auth/profile">
                            <Image 
                                src="/doc.webp" 
                                alt="baniere" 
                                className="rounded-lg shadow-lg w-[550px]" 
                                width={350}
                                height={90} 
                            />
                        </Link>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">Renseignez votre plaque digitale</h2>
                    <p className="text-gray-600 ml-4">Un profil personnalisé, accessible depuis la plateforme Medi<span className="text-[#107ACA]">Care</span> et depuis Google, pour être trouvé facilement</p>
                </div>
            </div>
            {/* Services Section */}
            <ServicesSection />
        </div>
    </div>
  );
}
