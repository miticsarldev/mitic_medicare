"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { File, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const medicalRecords = [
    { id: 1, patientName: "Moussa Diakité", date: "2024-03-15", diagnostic: "Grippe", medications: "Paracétamol, Vitamine C", notes: "Record présentant des symptômes de fièvre et de toux." },
    { id: 2, patientName: "Awa Traoré", date: "2024-03-14", diagnostic: "Hypertension", medications: "Lisinopril", notes: "Tension artérielle élevée. Suivi recommandé." },
    { id: 3, patientName: "Ibrahim Coulibaly", date: "2024-03-13", diagnostic: "Diabète", medications: "Metformine", notes: "Glycémie élevée. Recommandations diététiques fournies." },
    { id: 4, patientName: "Fatoumata Koné", date: "2024-03-12", diagnostic: "Migraine", medications: "Ibuprofène", notes: "Maux de tête sévères. Recommandation de repos." },
    { id: 5, patientName: "Sékou Sangaré", date: "2024-03-11", diagnostic: "Allergie", medications: "Cétirizine", notes: "Éruption cutanée et démangeaisons. Éviter les allergènes connus." },
    { id: 6, patientName: "Aminata Doumbia", date: "2024-03-10", diagnostic: "Arthrite", medications: "Naproxène", notes: "Douleurs articulaires. Recommandation de physiothérapie." },
    { id: 7, patientName: "Oumar Touré", date: "2024-03-09", diagnostic: "Asthme", medications: "Albutérol", notes: "Difficulté à respirer. Utilisation d'un inhalateur recommandée." },
    { id: 8, patientName: "Kadidia Sidibé", date: "2024-03-08", diagnostic: "Anémie", medications: "Fer", notes: "Fatigue et faiblesse. Supplément de fer prescrit." },
    { id: 9, patientName: "Drissa Mariko", date: "2024-03-07", diagnostic: "Sinusite", medications: "Amoxicilline", notes: "Congestion nasale et maux de tête. Antibiotiques prescrits." },
    { id: 10, patientName: "Mariam Diallo", date: "2024-03-06", diagnostic: "Gastrite", medications: "Oméprazole", notes: "Douleurs abdominales. Médicament antiacide prescrit." },
];

export default function Page() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecord, setSelectedRecord] = useState<(typeof medicalRecords)[0] | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
        setIsDetailOpen(true);
    };

    const filteredDossiers = medicalRecords.filter((dossier) =>
        dossier.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dossiers Médicaux des Patients</h2>
                    <p className="text-muted-foreground">Consultez les dossiers medicales de vos patients</p>
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
                                    placeholder="Rechercher un dossier..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDossiers.map((record) => (
                            <div
                                key={record.id}
                                className="p-4 border rounded-md cursor-pointer hover:shadow-md transition-shadow flex items-center"
                                onClick={() => handleRecordClick(record)}
                            >
                                <File className="mr-2 h-6 w-6" />
                                <h3 className="text-lg font-semibold">{record.patientName}</h3>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Record Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-4xl">
                    {selectedRecord && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {selectedRecord.patientName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{selectedRecord.patientName}</span>
                                    </DialogTitle>
                                </div>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">
                                            Informations Medicales
                                        </h3>
                                        <div className="rounded-lg border p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Date :
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {selectedRecord.date}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Diagnostic :
                                                </span>
                                                <span className="text-sm">{selectedRecord.diagnostic}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Médicaments :
                                                </span>
                                                <span className="text-sm">{selectedRecord.medications}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Notes :
                                                </span>
                                                <span className="text-sm">
                                                    <div className="overflow-y-auto max-w-[300px]">
                                                        {selectedRecord.notes}
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Statistiques</h3>
                                        <div className="rounded-lg border p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Rendez-vous
                                                </span>
                                                <span className="text-sm font-medium">
                                                    01
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Documents médicaux
                                                </span>
                                                <span className="text-sm font-medium">
                                                    01
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}