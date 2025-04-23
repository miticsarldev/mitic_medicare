import { useState } from "react"
import {
    Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
    MoreVertical, MapPin, Star, Phone, MessageCircle, CheckCircle,
    Clock,
    Briefcase,
    BookOpen,
    DollarSign,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export interface Doctor {
    id: string
    name: string
    specialization: string
    averageRating: number
    patientsCount: number
    phone: string
    availableForChat?: boolean
    address?: string
    isVerified?: boolean
    department?: {
        id: string
        name: string
    }
    education?: string
    experience?: string
    consultationFee?: string
    schedule?: {
        day: string
        slots: string[]
    }[]
}

interface DoctorCardProps {
    doctor: Doctor
    onChangeDepartment?: () => void // prop pour appeler le modal parent
}

export function DoctorCard({ doctor, onChangeDepartment }: DoctorCardProps) {
    const [showDetails, setShowDetails] = useState(false)

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                            {doctor.name[0]}
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">{doctor.name}</CardTitle>
                            <Badge variant="outline" className="mr-2 font-normal text-xs">
                                {doctor.specialization}
                            </Badge>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="text-muted-foreground">
                            <MoreVertical className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setShowDetails(true)}>
                                Voir détails
                            </DropdownMenuItem>
                            {onChangeDepartment && (
                                <DropdownMenuItem onClick={onChangeDepartment}>
                                    Changer département
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="text-sm grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="truncate">{doctor.address}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{doctor.phone}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{doctor.averageRating}</span>
                        <span className="ml-1 text-xs">({doctor.patientsCount})</span>
                    </div>

                    {doctor.availableForChat ? (
                        <div className="flex items-center gap-1 text-primary">
                            <MessageCircle className="w-4 h-4" /> Chat dispo
                        </div>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-1 col-span-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                alert(`Docteur ${doctor.name} ${doctor.isVerified ? 'désactivé' : 'activé'}`)
                            }}
                            className={`text-xs px-2 py-0.5 rounded-md border ${doctor.isVerified
                                ? 'text-green-600 border-green-600 hover:bg-green-50'
                                : 'text-muted-foreground border-muted hover:bg-muted/30'
                                }`}
                        >
                            {doctor.isVerified ? 'Désactiver' : 'Activer'}
                        </button>

                        {doctor.isVerified && (
                            <div className="flex items-center gap-1 text-green-600 text-xs ml-2">
                                <CheckCircle className="w-4 h-4" />
                                Vérifié
                            </div>
                        )}
                    </div>
                </CardContent>

            </Card>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-md p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <DialogTitle className="text-xl font-bold leading-snug">
                                {doctor.name}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {doctor.specialization}
                            </DialogDescription>
                        </div>

                        <Link
                            href={`/dashboard/hopital_admin/doctors/${doctor.id}`}
                            className="text-sm px-3 py-1 rounded-md border text-primary border-primary hover:bg-primary/10 transition-colors"
                        >
                            Voir profil
                        </Link>

                    </div>

                    <Tabs defaultValue="info" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
                            <TabsTrigger
                                value="info"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-full text-sm"
                            >
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4" /> Infos
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="schedule"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-full text-sm"
                            >
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> Horaires
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-primary" />
                                <span className="leading-tight"><strong>Téléphone:</strong> {doctor.phone}</span>
                            </div>
                            {doctor.department && (
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                                    <span className="leading-tight"><strong>Département:</strong> {doctor.department.name}</span>
                                </div>
                            )}
                            {doctor.education && (
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                                    <span className="leading-tight"><strong>Formation:</strong> {doctor.education}</span>
                                </div>
                            )}
                            {doctor.experience && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    <span className="leading-tight"><strong>Expérience:</strong> {doctor.experience}</span>
                                </div>
                            )}
                            {doctor.consultationFee && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                                    <span className="leading-tight"><strong>Frais:</strong> {doctor.consultationFee}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="leading-tight"><strong>Note:</strong> {doctor.averageRating} ({doctor.patientsCount})</span>
                            </div>
                            {doctor.availableForChat && (
                                <div className="flex items-center gap-2 text-primary">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="leading-tight">Disponible pour chat</span>
                                </div>
                            )}
                            {doctor.isVerified && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="leading-tight">Vérifié</span>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="schedule" className="space-y-2 text-sm">
                            {doctor.schedule && doctor.schedule.length > 0 ? (
                                doctor.schedule.map((day) => (
                                    <div key={day.day} className="flex items-start gap-2">
                                        <Clock className="w-5 h-5 text-muted-foreground mt-1" />
                                        <div>
                                            <span className="font-semibold leading-tight">{day.day}:</span>
                                            <div className="text-muted-foreground text-xs leading-snug">{day.slots.join(", ")}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground">Aucun horaire disponible.</div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    )
}
