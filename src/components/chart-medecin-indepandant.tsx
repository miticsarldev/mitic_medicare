"use client";

import { MoreHorizontal, Download, FileText, Settings } from "lucide-react";
import { AreaChart, Area, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const appointmentsData = [
  { month: "Janvier", status: "confirmer", revenue: 2500 },
  { month: "Janvier", status: "annuler", revenue: 2500 },
  { month: "Janvier", status: "nonLieu", revenue: 2500 },
  { month: "Février", status: "confirmer", revenue: 3200 },
  { month: "Février", status: "annuler", revenue: 3200 },
  { month: "Février", status: "nonLieu", revenue: 3200 },
  { month: "Mars", status: "confirmer", revenue: 2800 },
  { month: "Mars", status: "annuler", revenue: 2800 },
  { month: "Mars", status: "nonLieu", revenue: 2800 },
  { month: "Avril", status: "confirmer", revenue: 3500 },
  { month: "Avril", status: "annuler", revenue: 3500 },
  { month: "Avril", status: "nonLieu", revenue: 3500 },
  { month: "Mai", status: "confirmer", revenue: 4000 },
  { month: "Mai", status: "annuler", revenue: 4000 },
  { month: "Mai", status: "nonLieu", revenue: 4000 },
  { month: "Juin", status: "confirmer", revenue: 3700 },
  { month: "Juin", status: "annuler", revenue: 3700 },
  { month: "Juin", status: "nonLieu", revenue: 3700 },
];

// Fonction pour compter les statuts par mois
const aggregateData = () => {
  const result = {};
  appointmentsData.forEach(({ month, status }) => {
    if (!result[month]) {
      result[month] = { month, confirmer: 0, annuler: 0, nonLieu: 0 };
    }
    result[month][status]++;
  });
  return Object.values(result);
};

// Composant réutilisable pour le menu d'options
const OptionsMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>
        <Download className="mr-2 h-4 w-4" /> Télécharger PNG
      </DropdownMenuItem>
      <DropdownMenuItem>
        <FileText className="mr-2 h-4 w-4" /> Exporter CSV
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" /> Paramètres
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Composant de la carte graphique
const ChartCard = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <OptionsMenu />
    </CardHeader>
    <CardContent className="h-[300px]">{children}</CardContent>
  </Card>
);

// Composant principal
export function AppointmentsChart() {
  const processedData = aggregateData();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Graphique des rendez-vous */}
      <ChartCard title="Rendez-vous Passés" description="Répartition des rendez-vous confirmés, annulés et non-lieu">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} rendez-vous`, ""]} labelFormatter={(label) => `Mois: ${label}`} />
            <Legend />
            <Bar dataKey="confirmer" name="Confirmés" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            <Bar dataKey="annuler" name="Annulés" fill="#FF5252" radius={[4, 4, 0, 0]} />
            <Bar dataKey="nonLieu" name="Non-lieu" fill="#FFC107" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Graphique des revenus */}
      <ChartCard title="Revenus du Médecin" description="Montant total généré par mois">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={appointmentsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} €`, "Revenus"]} labelFormatter={(label) => `Mois: ${label}`} />
            <Legend />
            <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
