'use client'

import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, MapPin, Info, Globe, Save, ScrollText } from "lucide-react"

type AdminData = {
    id: string
    name: string
    email: string
    phone: string
    role: string
    profile: {
        address: string
        city: string
        state: string
        zipCode: string
        country: string
        bio: string
        avatarUrl: string | null
        genre: string
    }
    createdAt: string
}

export default function ProfilePage() {
    const [admin, setAdmin] = useState<AdminData | null>(null)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        genre: '',
        bio: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('/api/hospital_admin/profil')
            const data = await res.json()
            if (res.ok) {
                setAdmin(data.admin)
                setForm({
                    name: data.admin.name || '',
                    email: data.admin.email || '',
                    phone: data.admin.phone || '',
                    genre: data.admin.profile.genre || '',
                    bio: data.admin.profile.bio || '',
                    address: data.admin.profile.address || '',
                    city: data.admin.profile.city || '',
                    state: data.admin.profile.state || '',
                    zipCode: data.admin.profile.zipCode || '',
                    country: data.admin.profile.country || '',
                })
            }
        }
        fetchData()
    }, [])

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/hospital_admin/profil/modify', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erreur')

            toast({
                title: "Profil mis à jour ✅",
                description: "Vos informations ont bien été enregistrées.",
            })
        } catch (err) {
            toast({
                title: "Erreur ❌",
                description: "Impossible de mettre à jour le profil.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!admin) return <div className="p-6 text-center">Chargement...</div>

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="w-6 h-6" /> Mon Profil
            </h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles et médicales</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Colonne gauche */}
                <Card className="col-span-1">
                    <CardContent className="flex flex-col items-center text-center py-8">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                            {admin.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h2 className="mt-4 text-xl font-semibold">{admin.name}</h2>
                        <p className="text-sm text-muted-foreground">Membre depuis {new Date(admin.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                        <div className="mt-4 text-sm text-gray-500 space-y-1">
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {admin.phone}</div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {admin.profile.city}, {admin.profile.country}</div>
                            <div className="flex items-center gap-2"><User className="h-4 w-4" /> 38 ans</div>
                        </div>

                    </CardContent>
                </Card>

                {/* Colonne droite */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    {/* Infos personnelles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Info className="w-5 h-5" /> Informations personnelles</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label><User className="inline w-4 h-4 mr-1" /> Nom complet</Label>
                                <Input value={form.name} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div>
                                <Label><Mail className="inline w-4 h-4 mr-1" /> Email</Label>
                                <Input value={form.email} onChange={e => handleChange('email', e.target.value)} disabled/>
                            </div>
                            <div>
                                <Label><Phone className="inline w-4 h-4 mr-1" /> Téléphone</Label>
                                <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} disabled/>
                            </div>
                            <div>
                                <Label>Genre</Label>
                                <Select value={form.genre} onValueChange={value => handleChange('genre', value)}>
                                    <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Homme</SelectItem>
                                        <SelectItem value="FEMALE">Femme</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Adresse */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Adresse</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Adresse</Label>
                                <Input value={form.address} onChange={e => handleChange('address', e.target.value)} />
                            </div>
                            <div>
                                <Label>Ville</Label>
                                <Input value={form.city} onChange={e => handleChange('city', e.target.value)} />
                            </div>
                            <div>
                                <Label>Code postal</Label>
                                <Input value={form.zipCode} onChange={e => handleChange('zipCode', e.target.value)} />
                            </div>
                            <div>
                                <Label>Pays</Label>
                                <Input value={form.country} onChange={e => handleChange('country', e.target.value)} />
                            </div>
                            <div>
                                <Label>État / Région</Label>
                                <Input value={form.state} onChange={e => handleChange('state', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ScrollText className="w-5 h-5" /> Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="Passionné(e) de..." />
                            <p className="text-sm text-muted-foreground mt-1">
                                Vous pouvez mentionner vos intérêts, mode de vie, ou toute information pertinente pour vos médecins.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Enregistrer */}
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Enregistrer</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
