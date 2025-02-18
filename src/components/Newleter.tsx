import React, { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email soumis:", email);
    // Ici, vous pouvez ajouter l'appel API pour gérer l'inscription
  };

  return (
    <div className="p-6 bg-gray-100 flex flex-col items-center">
      <h2 className="text-2xl font-bold">Abonnez-vous à Notre Newsletter</h2>
      <p className="text-gray-500 mb-6">Recevez les dernières nouvelles de notre plateforme</p>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h3 className="text-lg font-semibold mb-3">Pour la Newsletter</h3>
        <form onSubmit={handleSubmit} className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <input
            type="email"
            className="flex-1 p-3 outline-none"
            placeholder="Entrez votre email ici"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700">
            Abonner
          </button>
        </form>
      </div>
    </div>
  );
};

