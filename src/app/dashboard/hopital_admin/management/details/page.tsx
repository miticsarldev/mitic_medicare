"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Hospital = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  website?: string
  description?: string
  logoUrl?: string
  isVerified: boolean
  status: string
  createdAt: string
  updatedAt: string
  _count: {
    doctors: number
    departments: number
    appointments: number
    medicalRecords: number
    reviews: number
  }
}

export default function HospitalInfo() {
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Hospital>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await fetch("/api/hospital_admin/hospital")
        const data = await res.json()
        setHospital(data.hospital)
        setFormData(data.hospital)
      } catch (error) {
        console.error("Erreur récupération hôpital:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHospital()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/hospital_admin/hospital/modify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Erreur lors de la mise à jour")

      //recharger la page après la mise à jour
      window.location.reload()
      setEditing(false)
    } catch (error) {
      console.error(error)
      alert("Une erreur est survenue.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Skeleton className="w-full h-40 rounded-xl" />
  }

  if (!hospital) {
    return <p className="text-red-500">Aucun hôpital trouvé.</p>
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">

      {/* Informations principales */}
      <Card className="border shadow-md rounded-2xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {hospital.logoUrl && (
              <img
                src={hospital.logoUrl}
                alt={hospital.name}
                className="w-16 h-16 object-cover rounded-full border"
              />
            )}
            <div>
              {editing ? (
                <Input name="name" value={formData.name || ""} onChange={handleChange} />
              ) : (
                <CardTitle className="text-xl font-bold">{hospital.name}</CardTitle>
              )}
              <p className="text-sm text-muted-foreground">
                {editing ? (
                  <div className="flex flex-col gap-1">
                    <Input name="city" value={formData.city || ""} onChange={handleChange} placeholder="Ville" />
                    <Input name="country" value={formData.country || ""} onChange={handleChange} placeholder="Pays" />
                  </div>
                ) : (
                  `${hospital.city}, ${hospital.country}`
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={hospital.isVerified ? "default" : "outline"}>
              {hospital.isVerified ? "Vérifié" : "Non vérifié"}
            </Badge>
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              {editing ? "Annuler" : "Modifier"}
            </Button>
            {editing && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Coordonnées */}
      <Card className="border shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Email :</strong>{" "}
              {editing ? (
                <Input name="email" value={formData.email || ""} onChange={handleChange} />
              ) : (
                hospital.email
              )}
            </p>
            <p><strong>Téléphone :</strong>{" "}
              {editing ? (
                <Input name="phone" value={formData.phone || ""} onChange={handleChange} />
              ) : (
                hospital.phone
              )}
            </p>
            {editing ? (
              <p><strong>Site Web :</strong>{" "}
                <Input name="website" value={formData.website || ""} onChange={handleChange} />
              </p>
            ) : hospital.website && (
              <p>
                <strong>Site Web :</strong>{" "}
                <a href={hospital.website} target="_blank" className="text-blue-600 underline">
                  {hospital.website}
                </a>
              </p>
            )}
          </div>
          <div>
            <p><strong>Adresse :</strong>{" "}
              {editing ? (
                <Input name="address" value={formData.address || ""} onChange={handleChange} />
              ) : (
                hospital.address
              )}
            </p>
            <p><strong>Code postal :</strong>{" "}
              {editing ? (
                <Input name="zipCode" value={formData.zipCode || ""} onChange={handleChange} />
              ) : (
                hospital.zipCode
              )}
            </p>
            <p><strong>État :</strong>{" "}
              {editing ? (
                <Input name="state" value={formData.state || ""} onChange={handleChange} />
              ) : (
                hospital.state
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <Textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="text-muted-foreground"
            />
          ) : (
            <p className="text-muted-foreground">{hospital.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card className="border shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{hospital._count.doctors}</p>
              <p className="text-sm text-muted-foreground">Médecins</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{hospital._count.departments}</p>
              <p className="text-sm text-muted-foreground">Départements</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{hospital._count.appointments}</p>
              <p className="text-sm text-muted-foreground">Rendez-vous</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{hospital._count.medicalRecords}</p>
              <p className="text-sm text-muted-foreground">Dossiers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{hospital._count.reviews}</p>
              <p className="text-sm text-muted-foreground">Avis</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
