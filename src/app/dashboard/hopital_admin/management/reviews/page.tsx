"use client"

import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"



interface Review {
    id: string
    title: string
    content: string
    rating: number
    status: string
    isAnonymous: boolean
    createdAt: string
    author: {
        id: string
        name: string
    }
    response: {
        content: string
        createdAt: string
        isOfficial: boolean
    }
}

export default function ReviewAdminCardView() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [responseText, setResponseText] = useState<{ [key: string]: string }>({})

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5 // Number of reviews per page

    useEffect(() => {
        const fetchReviews = async () => {
            const res = await fetch("/api/hospital_admin/reviews")
            const data = await res.json()
            setReviews(data.reviews || []) // Assurer que reviews est toujours un tableau
            setLoading(false)
        }
        fetchReviews()
    }, [])

    const handleRespond = async (reviewId: string) => {
        const content = responseText[reviewId];
        if (!content) return;

        try {
            const res = await fetch(`/api/hospital_admin/reviews/respond/${reviewId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content,
                    isOfficial: true,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erreur API :", errorData);
                return;
            }

            setResponseText(prev => ({ ...prev, [reviewId]: "" }));
            window.location.reload();
        } catch (error) {
            console.error("Erreur lors de l'envoi de la réponse :", error);
        }
    };


    const handleModerate = async (reviewId: string, status: string) => {
        try {
            const res = await fetch(`/api/hospital_admin/reviews/${reviewId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Erreur :", data.error);
                alert("Erreur : " + data.error);
                return;
            }

            window.location.reload();
        } catch (error) {
            console.error("Erreur de requête :", error);
            alert("Erreur de réseau");
        }
    };


    // Pagination logic: Slice the reviews array to show only the current page
    const indexOfLastReview = currentPage * itemsPerPage
    const indexOfFirstReview = indexOfLastReview - itemsPerPage
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)

    // Change page function
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    if (loading) return <p>Chargement des avis...</p>

    if (reviews.length === 0) return <p>Aucun avis trouvé.</p>

    return (
        <div className="space-y-4" >
            {
                currentReviews.length === 0 ? (
                    <p>Aucun avis à afficher pour cette page.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" >
                        {
                            currentReviews.map((review) => (
                                <Card key={review.id} className="space-y-2 p-4 shadow-md" >
                                    <CardContent className="space-y-2" >
                                        <div className="flex justify-between items-center" >
                                            <h3 className="text-lg font-semibold" > {review.title} </h3>
                                            < Badge > {review.status} </Badge>
                                        </div>
                                        < p className="text-sm text-muted-foreground" >
                                            {review.isAnonymous ? "Anonyme" : review.author.name} – {format(new Date(review.createdAt), "dd/MM/yyyy")
                                            }
                                        </p>
                                        < p className="text-sm" > {review.content} </p>
                                        < p className="text-yellow-600 font-bold" > Note : {review.rating} ⭐</p>

                                        {
                                            review.response?.content && (
                                                <div className="bg-gray-100 p-2 rounded">
                                                    <p className="text-sm italic"> Réponse officielle: </p>
                                                    < p className="text-sm" > {review.response.content} </p>
                                                    < p className="text-xs text-muted-foreground" >
                                                        {format(new Date(review.response.createdAt), "dd/MM/yyyy")
                                                        }
                                                    </p>
                                                </div>
                                            )}


                                        {
                                            review.status === "PENDING" && (
                                                <div className="flex gap-2" >
                                                    <Button variant="outline" onClick={() => handleModerate(review.id, "REJECTED")
                                                    }> Rejeter </Button>
                                                    < Button onClick={() => handleModerate(review.id, "APPROVED")}> Approuver </Button>
                                                </div>
                                            )}

                                        <div className="space-y-2" >
                                            <Textarea
                                                placeholder="Répondre à cet avis..."
                                                value={responseText[review.id] || ""}
                                                onChange={(e) => setResponseText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                            />
                                            < Button onClick={() => handleRespond(review.id)}> Envoyer la réponse </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}

            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-4" >
                {
                    Array.from({ length: Math.ceil(reviews.length / itemsPerPage) }, (_, index) => (
                        <Button key={index} onClick={() => paginate(index + 1)} variant={currentPage === index + 1 ? "default" : "outline"}>
                            {index + 1}
                        </Button>
                    ))}
            </div>
        </div>
    )
}
