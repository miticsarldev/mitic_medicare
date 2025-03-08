"use client";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubscriptionDetailsPage() {
  // Sample subscription data
  const subscription = {
    plan: "premium",
    status: "active",
    startDate: "15 janvier 2025",
    endDate: "15 janvier 2026",
    nextBillingDate: "15 janvier 2026",
    paymentMethod: "Visa se terminant par 4242",
    price: "9,99€ / mois",
    features: [
      "Rendez-vous prioritaires",
      "Consultations vidéo illimitées",
      "Accès aux spécialistes premium",
      "Rappels de médicaments",
      "Support client 24/7",
      "Historique médical complet",
    ],
  };

  // Sample billing history
  const billingHistory = [
    {
      id: "INV-001",
      date: "15 janvier 2025",
      amount: "9,99€",
      status: "Payé",
    },
    {
      id: "INV-002",
      date: "15 décembre 2024",
      amount: "9,99€",
      status: "Payé",
    },
    {
      id: "INV-003",
      date: "15 novembre 2024",
      amount: "9,99€",
      status: "Payé",
    },
  ];

  // Sample usage statistics
  const usageStats = {
    appointments: {
      used: 3,
      total: 5,
      percentage: 60,
    },
    videoConsultations: {
      used: 2,
      total: "Illimité",
      percentage: 0,
    },
    specialistAccess: {
      used: 1,
      total: 3,
      percentage: 33,
    },
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et vos paiements
          </p>
        </div>
        <Link href="/dashboard/patient/subscriptions/upgrade">
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Mettre à niveau
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Détails de l&apos;abonnement</CardTitle>
              <Badge className="capitalize bg-green-100 text-green-800 hover:bg-green-100">
                {subscription.status}
              </Badge>
            </div>
            <CardDescription>
              Votre abonnement actuel et ses avantages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg capitalize">
                    {subscription.plan}
                  </h3>
                  <p className="text-muted-foreground">{subscription.price}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-2 items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date de début</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.startDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date de fin</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prochain paiement</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.nextBillingDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Méthode de paiement</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <h3 className="font-semibold mb-2">Fonctionnalités incluses</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Modifier le paiement
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                Annuler l&apos;abonnement
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Votre abonnement se renouvellera automatiquement le{" "}
              {subscription.nextBillingDate}. Vous pouvez annuler à tout moment.
            </p>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utilisation</CardTitle>
              <CardDescription>Votre utilisation ce mois-ci</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Rendez-vous</span>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.appointments.used} /{" "}
                    {usageStats.appointments.total}
                  </span>
                </div>
                <Progress
                  value={usageStats.appointments.percentage}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Consultations vidéo</span>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.videoConsultations.used} /{" "}
                    {usageStats.videoConsultations.total}
                  </span>
                </div>
                <Progress value={100} className="h-2 bg-green-100" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Accès spécialistes</span>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.specialistAccess.used} /{" "}
                    {usageStats.specialistAccess.total}
                  </span>
                </div>
                <Progress
                  value={usageStats.specialistAccess.percentage}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique de facturation</CardTitle>
              <CardDescription>Vos paiements récents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell className="text-right">
                        {invoice.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Voir toutes les factures
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
