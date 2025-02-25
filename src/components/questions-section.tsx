import React from "react";

export function QuestionsSection() {
  return (
    <div className="p-6 bg-blue-100 dark:bg-gray-900">
      {/* Nos Actes Médicaux */}
      <div className="bg-blue-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Nos Actes Médicaux</h2>
        <div className="flex flex-wrap gap-3">
          {Array(8)
            .fill("Blanchissement Dentaire")
            .map((item, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white"
              >
                {item}
              </button>
            ))}
        </div>
      </div>

      {/* Questions Médicales */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Questions médicales</h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              Posez ma question
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
              Trouver une réponse
            </button>
          </div>
        </div>

        {/* Sélections médicales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8)
            .fill("Médecine Dentaire")
            .map((item, index) => (
              <select
                key={index}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option>{item}</option>
              </select>
            ))}
        </div>
      </div>
    </div>
  );
}