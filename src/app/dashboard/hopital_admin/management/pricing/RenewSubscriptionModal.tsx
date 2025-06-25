'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const PLANS = [
    {
        id: "BASIC",
        label: "Basique",
        description: "Jusqu'à 10 médecins, support standard",
        pricePerMonth: 5000 // XOF
    },
    {
        id: "STANDARD",
        label: "Standard",
        description: "Jusqu'à 30 médecins, support prioritaire",
        pricePerMonth: 15000 // XOF
    },
    {
        id: "PREMIUM",
        label: "Premium",
        description: "Jusqu'à 100 médecins, support 24/7",
        pricePerMonth: 30000 // XOF
    },
    {
        id: "ENTERPRISE",
        label: "Entreprise",
        description: "Nombre illimité de médecins, solution personnalisée",
        pricePerMonth: 50000 // XOF
    }
]

export function RenewSubscriptionModal({
    open,
    onOpenChange,
    currentPlan
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPlan: string
}) {
    const [selectedPlan, setSelectedPlan] = useState(currentPlan)
    const [months, setMonths] = useState(1)
    const [submitting, setSubmitting] = useState(false)

    const selectedPlanData = PLANS.find(plan => plan.id === selectedPlan)
    const totalAmount = selectedPlanData ? selectedPlanData.pricePerMonth * months : 0

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const response = await fetch('/api/hospital_admin/subscription/updateSucription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan: selectedPlan,
                    months,
                    amount: totalAmount
                })
            })

            if (!response.ok) throw new Error('Échec du renouvellement')

            toast({
                title: "Succès",
                description: "Votre abonnement a été renouvelé avec succès",
            })
            onOpenChange(false)
            // Rafraîchir les données
            window.location.reload()
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue",
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Renouveler l&apos;abonnement</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Sélection du plan */}
                    <div className="space-y-2">
                        <Label>Choisissez un plan</Label>
                        <RadioGroup
                            value={selectedPlan}
                            onValueChange={setSelectedPlan}
                            className="grid grid-cols-2 gap-4"
                        >
                            {PLANS.map((plan) => (
                                <div key={plan.id}>
                                    <RadioGroupItem
                                        value={plan.id}
                                        id={plan.id}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={plan.id}
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <div className="w-full">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{plan.label}</span>
                                                <Badge variant={plan.id === selectedPlan ? "default" : "outline"}>
                                                    {plan.pricePerMonth.toLocaleString()} XOF/mois
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {plan.description}
                                            </p>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Durée en mois */}
                    <div className="space-y-2">
                        <Label>Durée (mois)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="24"
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                        />
                    </div>

                    {/* Description du plan sélectionné */}
                    {selectedPlanData && (
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <h4 className="font-medium mb-2">Détails du plan {selectedPlanData.label}</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedPlanData.description}
                            </p>
                        </div>
                    )}

                    {/* Montant total */}
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                        <span className="font-medium">Montant total</span>
                        <span className="text-2xl font-bold">
                            {totalAmount.toLocaleString()} XOF
                        </span>
                    </div>

                    {/* Bouton de soumission */}
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Traitement...
                            </>
                        ) : (
                            "Confirmer le renouvellement"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}