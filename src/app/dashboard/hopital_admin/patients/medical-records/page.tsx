"use client"

import React, { useEffect, useState } from "react"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Pagination } from "@/components/ui/pagination"
import {
  User,
  Stethoscope,
  CalendarDays,
  AlertCircle,
  FileText,
  ClipboardList,
} from "lucide-react"

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
}

interface Prescription {
  id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  startDate: string
  endDate: string
}

interface MedicalRecord {
  id: string
  diagnosis: string
  treatment: string
  createdAt: string
  patient: { id: string; name: string }
  doctor: { id: string; name: string; specialization: string }
  attachments: Attachment[]
  prescriptions: Prescription[]
}

export default function MedicalRecordsGrid() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ patient: "", doctor: "" })
  const [page, setPage] = useState(1)
  const perPage = 6
  const [selected, setSelected] = useState<MedicalRecord | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/hospital_admin/medical-records")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Erreur")
        setRecords(data.records || [])
      } catch {
        setError("Impossible de charger les dossiers médicaux.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = records.filter(r =>
    r.patient.name.toLowerCase().includes(filters.patient.toLowerCase()) &&
    r.doctor.name.toLowerCase().includes(filters.doctor.toLowerCase())
  )

  const total = Math.ceil(filtered.length / perPage)
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <AlertCircle className="w-6 h-6" /> Dossiers Médicaux
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium flex items-center gap-1">
            <User className="w-4 h-4" /> Patient
          </label>
          <Input
            placeholder="Filtrer par patient"
            value={filters.patient}
            onChange={e => { setFilters(f => ({ ...f, patient: e.target.value })); setPage(1) }}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium flex items-center gap-1">
            <Stethoscope className="w-4 h-4" /> Docteur
          </label>
          <Input
            placeholder="Filtrer par docteur"
            value={filters.doctor}
            onChange={e => { setFilters(f => ({ ...f, doctor: e.target.value })); setPage(1) }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10">Chargement...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-10">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map(record => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" /> {record.patient.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> {record.doctor.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {record.diagnosis}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> {new Date(record.createdAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 flex items-center gap-1"
                    onClick={() => setSelected(record)}
                  >
                    <FileText className="w-4 h-4" /> Voir détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={page}
                totalPages={total}
                onPageChange={setPage}
                showPageNumbers={true}
                showNextPrevButtons={true}
              />
            </div>
          )}

          {/* Details Modal */}
          <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Détails du dossier
                </DialogTitle>
              </DialogHeader>
              {selected && (
                <Tabs defaultValue="diagnosis" className="mt-4">
                  <TabsList className="grid grid-cols-4 gap-2">
                    <TabsTrigger value="diagnosis">
                      <AlertCircle className="w-4 h-4 mr-1" /> Diagnostic
                    </TabsTrigger>
                    <TabsTrigger value="treatment">
                      <Stethoscope className="w-4 h-4 mr-1" /> Traitement
                    </TabsTrigger>
                    <TabsTrigger value="attachments">
                      <FileText className="w-4 h-4 mr-1" /> Pièces jointes
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions">
                      <ClipboardList className="w-4 h-4 mr-1" /> Prescriptions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="diagnosis" className="mt-4">
                    <p>{selected.diagnosis}</p>
                  </TabsContent>
                  <TabsContent value="treatment" className="mt-4">
                    <p>{selected.treatment}</p>
                  </TabsContent>
                  <TabsContent value="attachments" className="mt-4">
                    <ul className="space-y-2">
                      {selected.attachments.map(att => (
                        <li key={att.id} className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            {att.fileName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="prescriptions" className="mt-4 space-y-4">
                    {selected.prescriptions.map(p => (
                      <div key={p.id} className="border p-3 rounded flex items-start gap-3">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        <div className="text-sm">
                          <p><strong>{p.medicationName}</strong> - {p.dosage}</p>
                          <p>Fréquence: {p.frequency}</p>
                          <p>Durée: {p.duration}</p>
                          <p className="text-xs text-muted-foreground">Du {new Date(p.startDate).toLocaleDateString()} au {new Date(p.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Fermer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
