"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Stethoscope,
  FileText,
  ClipboardList,
  Download,
  Search,
  X,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  size: string
}

interface Prescription {
  id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  startDate: string
  endDate: string
  notes?: string
}

interface MedicalRecord {
  id: string
  diagnosis: string
  treatment: string
  createdAt: string
  updatedAt: string
  notes: string
  patient: { id: string; name: string; dob: string; gender: string }
  doctor: { id: string; name: string; specialization: string; department: string }
  attachments: Attachment[]
  prescriptions: Prescription[]
}

interface ApiResponse {
  records: MedicalRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function MedicalRecordsDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ patient: "", doctor: "" })
  const [page, setPage] = useState(1)
  const perPage = 6
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [activeTab, setActiveTab] = useState("diagnosis")

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(filters.patient && { patient: filters.patient }),
        ...(filters.doctor && { doctor: filters.doctor })
      }).toString()

      const res = await fetch(`/api/hospital_admin/medical-records?${query}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch medical records")
      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [page, filters.patient, filters.doctor])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handlePreviousPage = () => setPage(p => Math.max(p - 1, 1))
  const handleNextPage = () => setPage(p => Math.min(p + 1, data?.pagination.totalPages || 1))

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Date non disponible"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn(`Date invalide: ${dateString}`)
        return "Date invalide"
      }
      return format(date, "PPP", { locale: fr })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return "Format de date invalide"
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <FileText className="w-4 h-4 text-blue-500" />
    if (fileType.includes("pdf")) return <FileText className="w-4 h-4 text-red-500" />
    if (fileType.includes("word")) return <FileText className="w-4 h-4 text-blue-600" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <span>Gestion des Dossiers Médicaux</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Consultez et gérez les dossiers médicaux des patients
          </p>
        </div>
        <Button className="gap-2" variant="outline" onClick={() => fetchRecords()}>
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
              <Search className="w-4 h-4" />
              Patient
            </label>
            <Input
              placeholder="Rechercher par patient..."
              value={filters.patient}
              onChange={e => {
                setFilters(f => ({ ...f, patient: e.target.value }))
                setPage(1)
              }}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
              <Stethoscope className="w-4 h-4" />
              Médecin
            </label>
            <Input
              placeholder="Rechercher par médecin..."
              value={filters.doctor}
              onChange={e => {
                setFilters(f => ({ ...f, doctor: e.target.value }))
                setPage(1)
              }}
              className="bg-white"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ patient: "", doctor: "" })}
              className="w-full gap-1"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      <Separator className="my-4" />

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: perPage }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 bg-white">
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-full mt-2 rounded-md" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-white">
          <CardContent className="py-6 text-center text-red-600">
            <AlertCircle className="mx-auto h-6 w-6 mb-2" />
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchRecords}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.records.map(record => (
              <Card key={record.id} className="bg-white hover:shadow-md transition-shadow border border-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>{record.patient.name}</span>
                    </CardTitle>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(record.createdAt)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Dr. {record.doctor.name}</span>
                    <span className="text-xs text-gray-500">({record.doctor.specialization})</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="line-clamp-2">{record.diagnosis}</p>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{record.attachments.length} pièce(s) jointe(s)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      <span>{record.prescriptions.length} prescription(s)</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-1"
                    onClick={() => {
                      setSelectedRecord(record)
                      setActiveTab("diagnosis")
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Consulter le dossier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination.totalPages && data.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={data.pagination.page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      onClick={data.pagination.hasPreviousPage ? handlePreviousPage : undefined}
                    />
                  </PaginationItem>

                  {data.pagination.page > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (data.pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (data.pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (data.pagination.page >= data.pagination.totalPages - 2) {
                      pageNum = data.pagination.totalPages - 4 + i
                    } else {
                      pageNum = data.pagination.page - 2 + i
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={pageNum === data.pagination.page}
                          onClick={() => setPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {data.pagination.page < data.pagination.totalPages - 2 && data.pagination.totalPages > 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={data.pagination.hasNextPage ? handleNextPage : undefined}
                      className={data.pagination.hasNextPage ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Record Details Modal */}
          <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50 border-r p-4 hidden md:block">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      <span>Dossier Médical</span>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Information Patient
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium">{selectedRecord?.patient.name}</p>
                          <p className="text-gray-500 text-xs">
                            {selectedRecord?.patient.gender === "MALE" ? "Homme" : "Femme"}, {formatDate(selectedRecord?.patient.dob || "")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Médecin Traitant
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{selectedRecord?.doctor.name}</p>
                        <p className="text-gray-500 text-xs">{selectedRecord?.doctor.specialization}</p>
                        <p className="text-gray-500 text-xs">{selectedRecord?.doctor.department}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Détails du Dossier
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Créé le:</span>
                          <span>{formatDate(selectedRecord?.createdAt || "")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Mis à jour:</span>
                          <span>{formatDate(selectedRecord?.updatedAt || "")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 max-h-[80vh] overflow-y-auto">
                  {selectedRecord && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                      <TabsList className="grid grid-cols-4 gap-2 bg-gray-50">
                        <TabsTrigger value="diagnosis" className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>Diagnostic</span>
                        </TabsTrigger>
                        <TabsTrigger value="treatment" className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          <span>Traitement</span>
                        </TabsTrigger>
                        <TabsTrigger value="attachments" className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>Pièces jointes ({selectedRecord.attachments.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="prescriptions" className="flex items-center gap-1">
                          <ClipboardList className="w-4 h-4" />
                          <span>Prescriptions ({selectedRecord.prescriptions.length})</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="diagnosis" className="mt-0">
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg">Diagnostic Principal</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              {selectedRecord.diagnosis.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        <Separator className="my-4" />
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg">Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedRecord.notes ? (
                              <div className="prose prose-sm max-w-none">
                                {selectedRecord.notes.split('\n').map((paragraph, i) => (
                                  <p key={i}>{paragraph}</p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Aucune note disponible</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="treatment" className="mt-0">
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg">Plan de Traitement</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              {selectedRecord.treatment.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="attachments" className="mt-0 space-y-4">
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg">Documents Associés</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedRecord.attachments.length > 0 ? (
                              <div className="space-y-3">
                                {selectedRecord.attachments.map(attachment => (
                                  <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                      {getFileIcon(attachment.fileType)}
                                      <div>
                                        <p className="font-medium">{attachment.fileName}</p>
                                        <p className="text-xs text-gray-500">{attachment.size} • {attachment.fileType}</p>
                                      </div>
                                    </div>
                                    <a
                                      href={attachment.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      <Download className="w-4 h-4" />
                                      Télécharger
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Aucun document joint</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="prescriptions" className="mt-0 space-y-4">
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg">Ordonnances</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedRecord.prescriptions.length > 0 ? (
                              <div className="space-y-4">
                                {selectedRecord.prescriptions.map(prescription => (
                                  <div key={prescription.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                          <ClipboardList className="w-5 h-5 text-blue-600" />
                                          {prescription.medicationName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{prescription.dosage}</p>
                                      </div>
                                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {formatDate(prescription.startDate)} - {formatDate(prescription.endDate)}
                                      </div>
                                    </div>

                                    <Separator className="my-3" />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-500">Fréquence</p>
                                        <p className="font-medium">{prescription.frequency}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Durée</p>
                                        <p className="font-medium">{prescription.duration}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Statut</p>
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                          Active
                                        </Badge>
                                      </div>
                                    </div>

                                    {prescription.notes && (
                                      <>
                                        <Separator className="my-3" />
                                        <div>
                                          <p className="text-gray-500 text-sm">Notes:</p>
                                          <p className="text-sm">{prescription.notes}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Aucune prescription disponible</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}