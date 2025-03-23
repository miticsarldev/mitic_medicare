"use client"; 
import { format } from "date-fns"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";

const appointments = [
  {
    id: "1",
    patientName: "Jean Dupont",
    reason: "Consultation de suivi",
    date: new Date(2025, 2, 15, 10, 30),
    status: "PENDING",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    patientName: "Marie Curie",
    reason: "Examen annuel",
    date: new Date(2025, 1, 10, 14, 0),
    status: "COMPLETED",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    patientName: "Louis Pasteur",
    reason: "Bilan de santé",
    date: new Date(2025, 0, 22, 9, 15),
    status: "COMPLETED",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function AppointmentsPage() {
  const pendingAppointments = appointments.filter((a) => a.status === "PENDING");
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="space-y-6 p-4">
      {/* Section Rendez-vous en attente */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle>Liste de vos Rendez-vous</CardTitle>
            <CardDescription>Une apeçue sur tout vos rendez-vous</CardDescription>
          </div> 
        </CardHeader> 

        {/* Tabs pour les rendez-vous */}
        <Tabs defaultValue="effectuer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="effectuer">Rendez-vous effectués ({completedAppointments.length})</TabsTrigger>
            <TabsTrigger value="attente">Rendez-vous en attente ({pendingAppointments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="effectuer" className="space-y-4">
            {completedAppointments.map((rdv) => (
                <Card key={rdv.id}>
                <CardContent className="flex justify-between p-4">
                    <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={rdv.avatar} alt={rdv.patientName} />
                        <AvatarFallback>{rdv.patientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{rdv.patientName}</p>
                        <p className="text-xs text-muted-foreground">{rdv.reason}</p>
                    </div>
                    </div>
                    <div>
                    <p className="text-sm">{format(rdv.date, "dd/MM/yyyy")}</p>
                    </div>
                </CardContent>
                </Card>
            ))}
            </TabsContent>
            <TabsContent value="attente" className="space-y-4"> 
                {pendingAppointments.map((rdv) => (
                <Card key={rdv.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={rdv.avatar} alt={rdv.patientName} />
                        <AvatarFallback>{rdv.patientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{rdv.patientName}</p>
                        <p className="text-xs text-muted-foreground">{rdv.reason}</p>
                    </div>
                    </div>
                    <div className="flex items-center space-x-4">
                    <p className="text-sm">{format(rdv.date, "dd/MM/yyyy")}</p>
                    <Button size="sm" variant="outline">
                        <Check className="mr-1 h-4 w-4" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" className="border-destructive text-destructive">
                        <X className="mr-1 h-4 w-4" /> Refuser
                    </Button>
                    </div>
                </Card>
                ))}  
            </TabsContent>
        </Tabs>
      </Card>

    </div>
  );
}
