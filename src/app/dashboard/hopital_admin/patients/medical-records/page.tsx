'use client'
import React, { useEffect, useState } from "react"
import {
    TableCaption,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "@/components/ui/table"

const MedicalRecordsTable = () => {
    const [medicalRecords, setMedicalRecords] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState({
        patient: "",
        doctor: ""
    })

    const [currentPage, setCurrentPage] = useState(1)
    const recordsPerPage = 5

    // Récupération des données depuis l'API
    const fetchMedicalRecords = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/hospital_admin/medical-records")
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Erreur lors du chargement")
            setMedicalRecords(data.records || [])
        } catch (err) {
            setError("Une erreur est survenue lors de la récupération des dossiers médicaux.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedicalRecords()
    }, [])

    // Filtres appliqués aux données
    const filteredRecords = medicalRecords.filter(record =>
        record.patient.name.toLowerCase().includes(filters.patient.toLowerCase()) &&
        record.doctor.name.toLowerCase().includes(filters.doctor.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
    const indexOfLastRecord = currentPage * recordsPerPage
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
        setCurrentPage(1)
    }

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1)
    }

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
    }

    if (loading) return <div>Chargement...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Liste des Dossier Medicaux</h1>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-6 rounded-xl shadow">
                {/* patients */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="patient" className="text-sm font-medium text-gray-700">
                        patient
                    </label>
                    <input
                        id="patient"
                        type="text"
                        placeholder="filtrer par patient"
                        value={filters.patient}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Docteurs */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="doctor" className="text-sm font-medium text-gray-700">
                        Docteurs
                    </label>
                    <input
                        id="doctor"
                        type="text"
                        placeholder="filtrer par docteur"
                        value={filters.doctor}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

            </div>

            {/* Tableau */}
            <Table>
                <TableCaption>Dossiers médicaux</TableCaption>
                <TableHeader>
                    <tr>
                        <TableHead>Patient</TableHead>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Diagnostic</TableHead>
                        <TableHead>Traitement</TableHead>
                        <TableHead>Prescriptions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {currentRecords.length > 0 ? (
                        currentRecords.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>{record.patient.name}</TableCell>
                                <TableCell>{record.doctor.name}</TableCell>
                                <TableCell>{record.diagnosis}</TableCell>
                                <TableCell>{record.treatment}</TableCell>
                                <TableCell>
                                    <ul>
                                        {record.prescriptions.map((prescription: any) => (
                                            <li key={prescription.id}>
                                                {prescription.medicationName} ({prescription.dosage})
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted">
                                Aucun dossier médical trouvé.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <span>Page {currentPage} sur {totalPages}</span>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    )
}

export default MedicalRecordsTable
