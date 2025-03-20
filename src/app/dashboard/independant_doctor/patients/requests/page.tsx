"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const specialRequests = [
    { id: 1, patientName: "Moussa Diakité", description: "Demande de rendez-vous en urgence", date: "2024-03-16", status: "en attente" },
    { id: 2, patientName: "Awa Traoré", description: "Demande de renouvellement d'ordonnance", date: "2024-03-15", status: "en cours" },
    { id: 3, patientName: "Ibrahim Coulibaly", description: "Demande d'informations sur les résultats d'analyse", date: "2024-03-14", status: "terminé" },
];

export default function Page() {
    const [searchQuery, setSearchQuery] = useState("");


    const getStatusColor = (status) => {
        switch (status) {
            case "en attente":
                return "bg-yellow-100 text-yellow-800";
            case "en cours":
                return "bg-blue-100 text-blue-800";
            case "terminé":
                return "bg-green-100 text-green-800";
            default:
                return "";
        }
    };

    const filteredPatients = specialRequests.filter((patient) =>
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Demandes Spéciales des Patients
                    </h2>
                    <p className="text-muted-foreground">
                        Liste des patients qui veulent une demande speciales
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center space-x-2 justify-center">
                            <div className="relative flex-1 md:max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Rechercher une demande..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom du patient</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>{request.patientName}</TableCell>
                                        <TableCell>{request.description}</TableCell>
                                        <TableCell>{request.date}</TableCell>
                                        <TableCell>
                                            <div className={`rounded-full px-2 py-1 w-20 text-xs font-semibold ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left p-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                                                        Accepter
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                                                        Refuser
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                                                        Contacter
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}