"use client"

import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Payment {
    id: string
    amount: string
    currency: string
    paymentDate: string
    paymentMethod: string
    status: string
}

interface Subscription {
    plan: string
    status: string
    startDate: string
    endDate: string
    autoRenew: boolean
    payments: Payment[]
}

export default function SubscriptionSection() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSubscription = async () => {
            const res = await fetch("/api/hospital_admin/subscription")
            const data = await res.json()
            setSubscription(data.subscription)
            setLoading(false)
        }
        fetchSubscription()
    }, [])

    const totalPaid = subscription?.payments.reduce((sum, p) => {
        return p.status === "COMPLETED" ? sum + parseFloat(p.amount) : sum
    }, 0) || 0

    const handleRenewal = () => {
        // Placeholder: Ajoute ici ton appel API
        alert("Renouvellement lancé...")
    }

    if (loading) return <p>Chargement...</p>
    if (!subscription) return <p>Aucun abonnement trouvé.</p>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Détails de l’abonnement</h2>
                <Button onClick={handleRenewal}>Renouveler l’abonnement</Button>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 grid md:grid-cols-2 gap-4 border border-gray-100">
                <div>
                    <p className="text-gray-500 text-sm">Plan</p>
                    <p className="font-medium text-lg">{subscription.plan}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Statut</p>
                    <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>
                        {subscription.status}
                    </Badge>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Date de début</p>
                    <p>{format(new Date(subscription.startDate), "dd/MM/yyyy")}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Date de fin</p>
                    <p>{format(new Date(subscription.endDate), "dd/MM/yyyy")}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Renouvellement automatique</p>
                    <p>{subscription.autoRenew ? "Oui" : "Non"}</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-medium text-gray-800 mb-2">Historique des paiements</h3>
                <div className="bg-white shadow-md rounded-2xl border border-gray-100">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Montant</TableHead>
                                <TableHead>Devise</TableHead>
                                <TableHead>Méthode</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscription.payments.length > 0 ? (
                                <>
                                    {subscription.payments.map(payment => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{payment.amount}</TableCell>
                                            <TableCell>{payment.currency}</TableCell>
                                            <TableCell>{payment.paymentMethod}</TableCell>
                                            <TableCell>{format(new Date(payment.paymentDate), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        payment.status === "COMPLETED"
                                                            ? "default"
                                                            : payment.status === "FAILED"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-gray-50 font-medium">
                                        <TableCell colSpan={5} className="text-right pr-6">
                                            Total payé :{" "}
                                            <span className="font-bold text-green-600">
                                                {totalPaid.toFixed(2)} {subscription.payments[0]?.currency ?? "XOF"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                        Aucun paiement enregistré.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
