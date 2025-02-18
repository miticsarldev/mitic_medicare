import React from "react";
import Image from "next/image";

export function CareGiver() {
  return (
    <div className="p-6 bg-gray-200 dark:bg-gray-800 flex flex-col items-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center max-w-6xl w-full">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <Image
            src="/montre.png"
            alt="Soignant"
            width={300}
            height={200}
            className="rounded-lg"
          />
        </div>

        <div className="w-full md:w-2/3 md:pl-6">
          <h2 className="text-2xl font-bold text-center md:text-left dark:text-white">
            Vous êtes Soignant ?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center md:text-left">
            Découvrez MediCare pour les soignants et améliorez votre quotidien
          </p>
          <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
            <li>✅ Dispensez les meilleurs soins possibles à vos patients</li>
            <li>✅ Profitez d’une meilleure qualité de vie au travail</li>
            <li>✅ Augmentez les revenus de votre activité</li>
            <li>✅ Adoptez les solutions utilisées par plus de 410 000 soignants</li>
          </ul>

          <div className="mt-6 flex justify-center md:justify-start">
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              En savoir plus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}