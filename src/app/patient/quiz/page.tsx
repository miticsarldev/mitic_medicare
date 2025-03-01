"use client";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Search, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { questions } from "@/constant";
import { useState } from "react";

const QuestionItem = ({ question }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [likes, setLikes] = useState({ happy: 0, love: 0, angry: 0 });

    const handleLike = (type) => {
        setLikes((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-blue-600 font-semibold">{question.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{question.description}</p>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                    <Image
                        src={question.image}
                        alt="Doctor"
                        className="w-10 h-10 rounded-full"
                        width={40}
                        height={40}
                    />
                    <div className="ml-2">
                        <p className="font-semibold text-blue-700">{question.doctorName}</p>
                        <p className="text-sm text-gray-500">{question.specialty}</p>
                    </div>
                </div>
                <Button onClick={() => setIsOpen(!isOpen)} className="bg-yellow-500 text-white py-2 px-4 rounded-md flex items-center">
                    {isOpen ? "Masquer" : "Voir la réponse"}
                    {isOpen ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                </Button>
            </div>
            {isOpen && (
                <div className="mt-4 p-3 border-t border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300">
                    <p>{question.answer}</p>
                    <div className="flex space-x-4 mt-3">
                        <button onClick={() => handleLike("happy")} className="flex items-center space-x-1">
                            <span className="text-lg">😊</span>
                            <span className="text-sm">{likes.happy}</span>
                        </button>
                        <button onClick={() => handleLike("love")} className="flex items-center space-x-1">
                            <span className="text-lg">😍</span>
                            <span className="text-sm">{likes.love}</span>
                        </button>
                        <button onClick={() => handleLike("angry")} className="flex items-center space-x-1">
                            <span className="text-lg">😡</span>
                            <span className="text-sm">{likes.angry}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function MedicalQuestionsPage() {
    const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Filtrage des questions affichées en fonction de la page actuelle
  const displayedQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-100/50 dark:from-background dark:to-blue-950/50">
        <div className="max-w-screen-xl mx-auto">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Questions médicales
                    </h1>
                    <div className="relative w-64">
                        <Input
                            type="text"
                            placeholder="Mots clés"
                            className="w-full p-2 pr-12 border rounded-md"
                        />
                        <button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full bg-yellow-500 rounded-md hover:bg-yellow-600">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Section - Ask a Question */}
                <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md  h-48 sticky top-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Apportez une réponse à vos inquiétudes
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Un groupe de médecins spécialisés répondra à vos demandes
                    </p>
                    <Link href="/patient/ask">
                        <Button className="w-full mt-4 bg-yellow-500 text-white font-bold py-2 rounded">
                        Poser ma question
                        </Button>
                    </Link>
                </div>

                {/* Center Section - Medical Questions and Answers */}
                    <div className="col-span-2 space-y-4 h-screen overflow-y-auto">
                        {displayedQuestions.map((q, index) => (<QuestionItem key={index} question={q} />))}
                    

                    {/* Pagination */}
                    <div className="flex justify-center items-center space-x-2 mt-6">
                        <Button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md disabled:opacity-50"
                        >
                        « Précédent
                        </Button>
                        {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 py-1 rounded-md ${
                            currentPage === index + 1
                                ? "text-blue-600 font-bold border-b-2 border-blue-600"
                                : "text-gray-700"
                            }`}
                        >
                            {index + 1}
                        </button>
                        ))}
                        <Button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md disabled:opacity-50"
                      >
                        Suivant »
                      </Button>
                    </div>
                </div> 

                {/* Right Section - Other Suggestions */}
                <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-48 sticky top-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Catégories fréquentes
                    </h2>
                    <ul className="mt-3 space-y-2 text-blue-600">
                    <li className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <Link href="#">Gynécologie</Link>
                    </li>
                    <li className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <Link href="#">Dermatologie</Link>
                    </li>
                    <li className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <Link href="#">Psychiatrie</Link>
                    </li> 
                    </ul>
                </div>
                </div>
            </main>
        </div>
    </div>
  );
}
