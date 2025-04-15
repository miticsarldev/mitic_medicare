"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

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

    useEffect(() => {
        const fetchHospital = async () => {
            try {
                const res = await fetch("/api/hospital_admin/hospital")
                const data = await res.json()
                setHospital(data.hospital)
            } catch (error) {
                console.error("Erreur récupération hôpital:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchHospital()
    }, [])

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
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {hospital.logoUrl && (
                            <Image
                                src={hospital.logoUrl}
                                alt={hospital.name}
                                width={64}
                                height={64}
                                className="object-cover rounded-full border"
                            />
                        )}
                        <div>
                            <CardTitle className="text-xl font-bold">{hospital.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {hospital.city}, {hospital.country}
                            </p>
                        </div>
                    </div>
                    <Badge variant={hospital.isVerified ? "default" : "outline"}>
                        {hospital.isVerified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                </CardHeader>
            </Card>

            {/* Coordonnées */}
            <Card className="border shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle>Coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>Email :</strong> {hospital.email}</p>
                        <p><strong>Téléphone :</strong> {hospital.phone}</p>
                        {hospital.website && (
                            <p>
                                <strong>Site Web :</strong>{" "}
                                <a href={hospital.website} target="_blank" className="text-blue-600 underline">
                                    {hospital.website}
                                </a>
                            </p>
                        )}
                    </div>
                    <div>
                        <p><strong>Adresse :</strong> {hospital.address}</p>
                        <p><strong>Code postal :</strong> {hospital.zipCode}</p>
                        <p><strong>État :</strong> {hospital.state}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Description */}
            {hospital.description && (
                <Card className="border shadow-md rounded-2xl">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{hospital.description}</p>
                    </CardContent>
                </Card>
            )}

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
