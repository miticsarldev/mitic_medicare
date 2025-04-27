import { useState } from "react"
import {
    Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
    MoreVertical, MapPin, Star, Phone, MessageCircle, CheckCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface Doctor {
    name: string
    specialization: string
    averageRating: number
    patientsCount: number
    phone: string
    availableForChat?: boolean
    address?: string
    isVerified?: boolean
    department?: string
    education?: string
    experience?: string
    consultationFee?: string
}

interface DoctorCardProps {
    doctor: Doctor
}

export function DoctorCard({ doctor }: DoctorCardProps) {
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="text-sm space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="truncate">{doctor.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{doctor.averageRating}</span>
                        <span className="ml-1 text-xs">({doctor.patientsCount} patients)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{doctor.phone}</span>
                    </div>
                    {doctor.availableForChat && (
                        <div className="flex items-center gap-1 text-primary text-sm">
                            <MessageCircle className="w-4 h-4" /> Chat dispo
                        </div>
                    )}
                    {doctor.isVerified && (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" /> Vérifié
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{doctor.name}</DialogTitle>
                        <DialogDescription className="text-sm">
                            {doctor.specialization}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        <div><strong>Téléphone:</strong> {doctor.phone}</div>
                        {doctor.department && <div><strong>Département:</strong> {doctor.department}</div>}
                        {doctor.education && <div><strong>Formation:</strong> {doctor.education}</div>}
                        {doctor.experience && <div><strong>Expérience:</strong> {doctor.experience}</div>}
                        {doctor.consultationFee && <div><strong>Frais:</strong> {doctor.consultationFee}</div>}
                        <div><strong>Note:</strong> {doctor.averageRating} ({doctor.patientsCount} patients)</div>
                        {doctor.availableForChat && (
                            <div><MessageCircle className="inline w-4 h-4" /> Disponible pour chat</div>
                        )}
                        {doctor.isVerified && (
                            <div><CheckCircle className="inline w-4 h-4 text-green-600" /> Vérifié</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
