'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'

//types
type MedicalHistory = {
    id: string;
    title: string;
    condition: string;
    diagnosedDate?: Date;
    status: string;
    details?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
};

interface CreateMedicalHistoryModalProps {
    patientId: string
    addHistorique: (history: MedicalHistory) => void
}

export function CreateMedicalHistoryModal({ patientId, addHistorique }: CreateMedicalHistoryModalProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [condition, setCondition] = useState('')
    const [diagnosedDate, setDiagnosedDate] = useState<string>(new Date().toISOString().split('T')[0]) // Format 'YYYY-MM-DD'
    const [status, setStatus] = useState<string>('ACTIVE')
    const [details, setDetails] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (loading) return; // Prevent multiple submissions

        try {
            setLoading(true); // Start loading

             // Convert the date to ISO-8601 with time
             const diagnosedDateISO = `${diagnosedDate}T00:00:00Z`; 

             const response = await fetch('/api/hospital_admin/medical-history/create', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     patientId,
                     title,
                     condition,
                     diagnosedDate: diagnosedDateISO, 
                     status,
                     details,
                 }),
             })

            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'historique médical.')
            }

            const data = await response.json()
            addHistorique(data.medicalHistorie)

            toast({
                title: "Historique créé avec succès ✅",
                description: "Les informations médicales ont été enregistrées.",
            })
            setOpen(false) 
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la création de l'historique.",
            })
            console.error('Erreur lors de la création de l\'historique :', error)
        } finally {
            setLoading(false); // End loading
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Ajouter un historique médical</Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Ajouter un historique médical</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="text-sm font-medium">Date de diagnostic</label>
                        <input 
                            type="date" 
                            value={diagnosedDate} 
                            onChange={(e) => setDiagnosedDate(e.target.value)} 
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input placeholder="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} />

                    <div>
                        <label className="text-sm font-medium">Statut</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Actif</SelectItem>
                                <SelectItem value="RESOLVED">Résolu</SelectItem>
                                <SelectItem value="CHRONIC">Chronique</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Textarea placeholder="Détails" value={details} onChange={(e) => setDetails(e.target.value)} />

                    <Button 
                        onClick={handleSubmit} 
                        className="w-full" 
                        disabled={loading} 
                    >
                        {loading ? <Loader2 className="animate-spin" />: 'Enregistrer'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
