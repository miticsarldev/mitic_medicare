import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import Link from "next/link";
import React from "react";

export default function SearchDoctor() {
  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto"></div>
    <Navbar />
    <div className="bg-blue-100 min-h-screen p-6">
      {/* En-tête */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Trouvez un Médecin au Mali</h1>
        <p className="text-gray-600">
          Des médecins hautement qualifiés sont prêts à vous servir
        </p>
      </div>

      {/* Contenu Principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-bold text-lg mb-4">Filtrer par</h2>
          <input
            type="text"
            placeholder="Nom du professionnel de santé"
            className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          />
          <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4">
            OK
          </button>
          <select className="w-full p-2 border border-gray-300 rounded-lg mb-2">
            <option>Spécialité</option>
          </select>
          <select className="w-full p-2 border border-gray-300 rounded-lg mb-2">
            <option>Ville</option>
          </select>
          <select className="w-full p-2 border border-gray-300 rounded-lg mb-2">
            <option>Genre</option>
          </select>
          <select className="w-full p-2 border border-gray-300 rounded-lg mb-2">
            <option>Langue parlée</option>
          </select>
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" id="domicile" />
            <label htmlFor="domicile">Visite à domicile</label>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="garde" />
            <label htmlFor="garde">Services de garde 24/7</label>
          </div>
          <button className="w-full bg-yellow-500 text-white py-2 rounded-lg">
            RECHERCHER
          </button>
        </div>

        {/* Liste des Médecins */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="bg-white px-4 py-2 rounded-lg shadow-md">Bamako</button>
            <button className="bg-white px-4 py-2 rounded-lg shadow-md">Kayes</button>
            <button className="bg-white px-4 py-2 rounded-lg shadow-md">Mopti</button>
            <button className="bg-white px-4 py-2 rounded-lg shadow-md">Voir plus</button>
          </div>

          {/* Carte Médecin */}
          {Array(3).fill(null).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-600">Dr Amed Kouakou</h3>
                <p className="text-gray-600">Généraliste</p>
                <p className="text-gray-500">Bamako-coura, Bamako Mali</p>
              </div>
              <Link href="/Details">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
                  Voir Fiche
                </button>
              </Link>
            </div>
          ))}

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">
            Voir Plus
          </button>
        </div>

        {/* Questions Médicales */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-bold text-lg mb-4">Questions médicales</h2>
          <p className="text-gray-600">
            <strong>Appétit</strong><br />
            Mon bébé de 14 mois après une grippe de 7 jours manque d’appétit, il dort beaucoup.
          </p>
          <div className="flex items-center gap-2 my-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <p className="text-blue-600 font-bold">Pr Abderraouf Chabchoub</p>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
            Voir la réponse
          </button>
          <ul className="mt-4">
            {Array(6).fill("Solutions pour le fétichisme de pieds").map((item, index) => (
              <li key={index} className="text-gray-500 border-b py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
    </div>
    <Footer />
    </div>
  );
}
