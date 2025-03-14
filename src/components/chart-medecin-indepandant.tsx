"use client";

import { MoreHorizontal, Download, FileText, Settings } from "lucide-react";
import { AreaChart, Area, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Données des rendez-vous et des revenus
const appointmentsData = [
  { month: "Janvier", confirmes: 15, annules: 5, nonLieu: 2, revenue: 2500 },
  { month: "Février", confirmes: 20, annules: 8, nonLieu: 1, revenue: 3200 },
  { month: "Mars", confirmes: 18, annules: 4, nonLieu: 3, revenue: 2800 },
  { month: "Avril", confirmes: 22, annules: 6, nonLieu: 2, revenue: 3500 },
  { month: "Mai", confirmes: 19, annules: 7, nonLieu: 3, revenue: 4000 },
  { month: "Juin", confirmes: 25, annules: 5, nonLieu: 2, revenue: 3700 },
];

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
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Graphique des rendez-vous */}
      <ChartCard title="Rendez-vous Passés" description="Répartition des rendez-vous confirmés, annulés et non-lieu">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={appointmentsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} rendez-vous`, ""]} labelFormatter={(label) => `Mois: ${label}`} />
            <Legend />
            <Bar dataKey="confirmes" name="Confirmés" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            <Bar dataKey="annules" name="Annulés" fill="#FF5252" radius={[4, 4, 0, 0]} />
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
