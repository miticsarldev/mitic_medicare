"use client";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import Link from "next/link";
import React from "react";
import { Pagination } from "@/components/pagination";
import { doctors } from "@/components/doctor-data"; 
import { Calendar, NotepadText } from "lucide-react";
import {  Doctor } from "@/types"; 

export default function SearchDoctor() {
  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <div className="bg-blue-100 dark:bg-gray-800 min-h-screen p-6">
          {/* En-tête */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">Trouvez un Médecin au Mali</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Des médecins hautement qualifiés sont prêts à vous servir
            </p>
          </div>

          {/* Contenu Principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Filtres */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4">
              <h2 className="font-bold text-lg mb-4 dark:text-white">Filtrer par</h2>
              <input
                type="text"
                placeholder="Nom du professionnel de santé"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
              />
              <button className="w-full bg-yellow-500 text-white py-2 rounded-lg">
                OK
              </button>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white">
                <option>Spécialité</option>
              </select>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white">
                <option>Ville</option>
              </select>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white">
                <option>Ville</option>
              </select>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white">
                <option>Genre</option>
              </select>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white">
                <option>Langue parlée</option>
              </select>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="domicile" className="dark:bg-gray-600" />
                <label htmlFor="domicile" className="dark:text-white">Visite à domicile</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="garde" className="dark:bg-gray-600" />
                <label htmlFor="garde" className="dark:text-white">Services de garde 24/7</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="garde" className="dark:bg-gray-600" />
                <label htmlFor="garde" className="dark:text-white">Carte Amo</label>
              </div>
              <button className="w-full bg-yellow-500 text-white py-2 rounded-lg">
                RECHERCHER
              </button>
            </div>

            {/* Liste des Médecins */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Bamako</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Kayes</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Mopti</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Segou</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Kidal</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Koulikoro</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Toumbouctou</button>
                <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md dark:text-white">Voir plus</button>
              </div>

              {/* Carte Médecin */}
              {doctors.map((doctor: Doctor) => (
                <div key={doctor.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md mb-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{doctor.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                    <p className="text-gray-500 dark:text-gray-400">{doctor.location}</p>
                  </div>
                  <Link href={`/details/${doctor.id}`}>
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Prendre rendez-vous</span>
                  </button>
                  </Link>
                </div>
              ))}
              <Pagination totalPages={0} currentPage={0} onPageChange={function (): void {
                throw new Error("Function not implemented.");
              } } />
              
            </div>

            {/* Questions Médicales */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h2 className="font-bold text-lg mb-4 dark:text-white">Questions médicales</h2>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Appétit</strong><br />
                Mon bébé de 14 mois après une grippe de 7 jours manque d’appétit, il dort beaucoup.
              </p>
              <div className="flex items-center gap-2 my-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <p className="text-blue-600 dark:text-blue-400 font-bold">Pr Abderraouf Chabchoub</p>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                Voir la réponse
              </button>
              <ul className="mt-4">
                {Array(10).fill("Solutions pour le fétichisme de pieds").map((item, index) => (
                  <li key={index} className="text-gray-500 dark:text-gray-400 border-b py-2 flex items-center gap-2">
                    <NotepadText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}