"use client";

import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/modal";
import { Plus, Edit, Trash } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { hospitalsData } from "@/data/hospital-data"; 
import { Hospital } from "@/types";

export default function HospitalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(null);

  const handleEditHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mt-4 mb-6">Gestion des Hôpitaux</h1>
      <div className="flex items-center justify-between mb-6">
        <Input placeholder="Rechercher un hôpital..." className="w-full max-w-md" />
        <Button onClick={() => setIsModalOpen(true)} variant="outline">
          <Plus className="mr-2" /> Ajouter un hôpital
        </Button>
      </div>
      <Table className="mt-6 w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-4 px-6 text-left font-medium">Nom</th>
            <th className="py-4 px-6 text-left font-medium">Adresse</th>
            <th className="py-4 px-6 text-left font-medium">Téléphone</th>
            <th className="py-4 px-6 text-left font-medium">Email</th>
            <th className="py-4 px-6 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hospitalsData.map((hospital) => (
            <tr
              key={hospital.id}
              className="hover:bg-gray-50 border-b border-gray-200 transition-colors"
            >
              <td className="py-4 px-6">{hospital.name}</td>
              <td className="py-4 px-6">{hospital.address}</td>
              <td className="py-4 px-6">{hospital.phone}</td>
              <td className="py-4 px-6">{hospital.email}</td>
              <td className="py-4 px-6 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditHospital(hospital)}
                >
                  <Edit className="mr-1" size={14} /> Éditer
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-1" size={14} /> Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal pour ajouter/éditer un hôpital */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedHospital ? "Éditer un hôpital" : "Ajouter un hôpital"}
      >
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Nom"
              defaultValue={selectedHospital?.name}
            />
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder="Adresse"
              defaultValue={selectedHospital?.address}
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              placeholder="Téléphone"
              defaultValue={selectedHospital?.phone}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Email"
              defaultValue={selectedHospital?.email}
            />
          </div>
          <Button type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </Modal>
    </div>
  );
}
