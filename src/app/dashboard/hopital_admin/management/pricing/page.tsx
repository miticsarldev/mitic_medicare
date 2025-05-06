"use client"

import React, { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Payment {
  id: string
  amount: string
  currency: string
  paymentDate: string
  paymentMethod: string
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED"
}

interface Subscription {
  plan: string
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | "EXPIRED"
  startDate: string
  endDate: string
  autoRenew: boolean
  payments: Payment[]
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    ACTIVE: { label: "Actif", variant: "default" as const },
    INACTIVE: { label: "Inactif", variant: "secondary" as const },
    CANCELLED: { label: "Annulé", variant: "destructive" as const },
    EXPIRED: { label: "Expiré", variant: "outline" as const },
    COMPLETED: { label: "Complété", variant: "default" as const },
    PENDING: { label: "En attente", variant: "outline" as const },
    FAILED: { label: "Échoué", variant: "destructive" as const },
    REFUNDED: { label: "Remboursé", variant: "secondary" as const }
  }

  const { label, variant } = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const }

  return <Badge variant={variant}>{label}</Badge>
}

export default function SubscriptionSection() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [renewing, setRenewing] = useState(false)

  const fetchSubscription = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/hospital_admin/subscription")
      if (!res.ok) throw new Error("Échec de la récupération de l'abonnement")
      const data = await res.json()
      setSubscription(data.subscription)
    } catch (err) {
      console.error("Erreur lors de la récupération de l'abonnement:", err)
      setError("Impossible de charger les informations d'abonnement")
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des informations d'abonnement",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const totalPaid = useMemo(() => {
    return subscription?.payments.reduce((sum, p) => {
      return p.status === "COMPLETED" ? sum + parseFloat(p.amount) : sum
    }, 0) || 0
  }, [subscription])

  const handleRenewal = async () => {
    setRenewing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Succès",
        description: "Votre abonnement a été renouvelé avec succès",
      })
      fetchSubscription()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Le renouvellement de l'abonnement a échoué",
        variant: "destructive"
      })
        console.error("Erreur lors du renouvellement de l'abonnement:", err)
    } finally {
      setRenewing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <Button variant="outline" onClick={fetchSubscription}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-muted-foreground text-lg">Aucun abonnement actif trouvé</p>
        <Button variant="outline" onClick={fetchSubscription}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Rafraîchir
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Gestion de l&apos;abonnement</h2>
        <Button 
          onClick={handleRenewal} 
          disabled={renewing || subscription.status !== "ACTIVE"}
          className="min-w-[200px]"
        >
          {renewing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            "Renouveler l'abonnement"
          )}
        </Button>
      </div>

      {/* Détails de l'abonnement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails de l&apos;abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plan souscrit</p>
              <p className="font-medium text-foreground">{subscription.plan}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Statut</p>
              <StatusBadge status={subscription.status} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date de début</p>
              <p className="text-foreground">
                {format(new Date(subscription.startDate), "PPP", { locale: fr })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date de fin</p>
              <p className="text-foreground">
                {format(new Date(subscription.endDate), "PPP", { locale: fr })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Renouvellement automatique</p>
              <p className="text-foreground">
                {subscription.autoRenew ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Activé
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive border-destructive">
                    Désactivé
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Montant</TableHead>
                <TableHead>Devise</TableHead>
                <TableHead>Méthode de paiement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscription.payments.length > 0 ? (
                <>
                  {subscription.payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {parseFloat(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{payment.currency}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>
                        {format(new Date(payment.paymentDate), "PPP", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={4} className="text-right">
                      Total payé :
                    </TableCell>
                    <TableCell className="font-bold text-green-600 dark:text-green-400">
                      {totalPaid.toFixed(2)} {subscription.payments[0]?.currency ?? "XOF"}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun paiement enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}