
import React from "react";

export function Questions() {
  return (
    <div className="p-6 bg-blue-100">
      {/* Nos Actes Médicaux */}
      <div className="bg-blue-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Nos Actes Médicaux</h2>
        <div className="flex flex-wrap gap-3">
          {Array(8)
            .fill("Blanchissement Dentaire")
            .map((item, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200"
              >
                {item}
              </button>
            ))}
        </div>
      </div>

      {/* Questions Médicales */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-bold mb-4">Questions médicales</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8)
            .fill("Médecine Dentaire")
            .map((item, index) => (
              <select
                key={index}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>{item}</option>
              </select>
            ))}
        </div>

        {/* Boutons */}
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Posez ma question
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Trouver une réponse
          </button>
        </div>
      </div>
    </div>
  );
};


