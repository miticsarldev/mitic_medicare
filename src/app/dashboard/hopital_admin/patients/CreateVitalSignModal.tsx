'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'

type vitalSign = {
    id: string;
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    notes?: string;
    recordedAt: Date;
    createdAt: Date;
}

interface CreateVitalSignModalProps {
    patientId: string
    addVitalSign: (vitalSign: vitalSign) => void
}

export function CreateVitalSignModal({ patientId, addVitalSign }: CreateVitalSignModalProps) {
    const [open, setOpen] = useState(false)
    const [temperature, setTemperature] = useState<number | undefined>()
    const [heartRate, setHeartRate] = useState<number | undefined>()
    const [bloodPressureSystolic, setBloodPressureSystolic] = useState<number | undefined>()
    const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<number | undefined>()
    const [respiratoryRate, setRespiratoryRate] = useState<number | undefined>()
    const [oxygenSaturation, setOxygenSaturation] = useState<number | undefined>()
    const [weight, setWeight] = useState<number | undefined>()
    const [height, setHeight] = useState<number | undefined>()
    const [notes, setNotes] = useState('')
    const [recordedAt, setRecordedAt] = useState<string>(new Date().toISOString().split('T')[0]) // Format de date 'YYYY-MM-DD'
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (loading) return;

        try {
            setLoading(true); // Start loading

            //formatage en ISO-8601 avec heure
            const recordedAtISO = `${recordedAt}T00:00:00Z`;

            const response = await fetch('/api/hospital_admin/vital-sign/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    temperature,
                    heartRate,
                    bloodPressureSystolic,
                    bloodPressureDiastolic,
                    respiratoryRate,
                    oxygenSaturation,
                    weight,
                    height,
                    notes,
                    recordedAt: recordedAtISO,
                }),
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la création du relevé.')
            }

            const data = await response.json()
            addVitalSign(data.vitalSigns)

            toast({
                title: "Historique créé avec succès ✅",
                description: "Vos informations ont bien été enregistrées.",
            })
            setOpen(false) 
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la création du relevé.",
            })
            console.error('Erreur lors de la création du relevé :', error)
        } finally {
            setLoading(false); // Stop loading
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Ajouter un relevé</Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Ajouter un relevé vital</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="text-sm font-medium">Date du relevé</label>
                        <input
                            type="date"
                            value={recordedAt}
                            onChange={(e) => setRecordedAt(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Température (°C)" value={temperature || ''} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
                        <Input type="number" placeholder="Fréquence cardiaque (bpm)" value={heartRate || ''} onChange={(e) => setHeartRate(parseInt(e.target.value))} />
                        <Input type="number" placeholder="Pression systolique" value={bloodPressureSystolic || ''} onChange={(e) => setBloodPressureSystolic(parseInt(e.target.value))} />
                        <Input type="number" placeholder="Pression diastolique" value={bloodPressureDiastolic || ''} onChange={(e) => setBloodPressureDiastolic(parseInt(e.target.value))} />
                        <Input type="number" placeholder="Fréquence respiratoire (/min)" value={respiratoryRate || ''} onChange={(e) => setRespiratoryRate(parseInt(e.target.value))} />
                        <Input type="number" placeholder="Saturation O₂ (%)" value={oxygenSaturation || ''} onChange={(e) => setOxygenSaturation(parseInt(e.target.value))} />
                        <Input type="number" placeholder="Poids (kg)" value={weight || ''} onChange={(e) => setWeight(parseFloat(e.target.value))} />
                        <Input type="number" placeholder="Taille (cm)" value={height || ''} onChange={(e) => setHeight(parseFloat(e.target.value))} />
                    </div>

                    <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
