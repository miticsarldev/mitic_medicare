"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Doctor = {
    id: string;
    name: string;
    specialization: string;
    isVerified: boolean;
    availableForChat: boolean;
    averageRating: number;
    patientsCount: number;
    department?: string;
};

export default function DoctorsList() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const page = parseInt(searchParams.get("page") || "1");
    const specialization = searchParams.get("specialization") || "";
    const isVerified = searchParams.get("isVerified") || "";
    const isAvailable = searchParams.get("isAvailable") || "";

    const fetchDoctors = async () => {
        setLoading(true);
        const query = new URLSearchParams({
            page: page.toString(),
            limit: "10",
            ...(specialization && { specialization }),
            ...(isVerified && { isVerified }),
            ...(isAvailable && { isAvailable }),
        }).toString();

        const res = await fetch(`/api/hospital_admin/doctors?${query}`);
        const data = await res.json();

        if (res.ok) {
            setDoctors(data.doctors);
            setTotalPages(data.totalPages);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
    }, [searchParams.toString()]);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const changePage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold mb-4">Liste des Médecins</h1>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-6 rounded-xl shadow">
                {/* Spécialisation */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="specialization" className="text-sm font-medium text-gray-700">
                        Spécialisation
                    </label>
                    <input
                        id="specialization"
                        type="text"
                        placeholder="Ex : Cardiologue"
                        value={specialization}
                        onChange={(e) => updateFilters("specialization", e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Vérification */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="isVerified" className="text-sm font-medium text-gray-700">
                        Vérification
                    </label>
                    <select
                        id="isVerified"
                        value={isVerified}
                        onChange={(e) => updateFilters("isVerified", e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Toutes</option>
                        <option value="true">Vérifié</option>
                        <option value="false">Non vérifié</option>
                    </select>
                </div>

                {/* Disponibilité */}
                <div className="flex flex-col space-y-1">
                    <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                        Disponibilité
                    </label>
                    <select
                        id="isAvailable"
                        value={isAvailable}
                        onChange={(e) => updateFilters("isAvailable", e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Toutes</option>
                        <option value="true">Disponible</option>
                        <option value="false">Indisponible</option>
                    </select>
                </div>
            </div>


            {/* Liste */}
            {loading ? (
                <p className="text-center">Chargement...</p>
            ) : doctors.length === 0 ? (
                <p className="text-center">Aucun médecin trouvé.</p>
            ) : (
                <div className="grid gap-4">
                    {doctors.map((doc) => (
                        <div key={doc.id} className="border p-4 rounded-lg shadow-sm bg-white">
                            <h2 className="text-xl font-semibold">{doc.name}</h2>
                            <p className="text-gray-600">{doc.specialization} – {doc.department || "Aucun département"}</p>
                            <p className="text-sm text-gray-500">
                                Note moyenne : {doc.averageRating.toFixed(1)} ★ | Patients : {doc.patientsCount}
                            </p>
                            <p className="text-sm">
                                {doc.isVerified ? "✅ Vérifié" : "❌ Non vérifié"} | {doc.availableForChat ? "💬 Disponible" : "⛔ Indisponible"}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => changePage(i + 1)}
                            className={`px-4 py-2 rounded ${page === i + 1
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
