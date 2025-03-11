"use client";

import React, { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email soumis:", email);
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      <h2 className="text-2xl font-bold dark:text-white">
        Abonnez-vous à Notre Newsletter
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Recevez les dernières nouvelles de notre plateforme
      </p>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">
          Pour la Newsletter
        </h3>
        <form
          onSubmit={handleSubmit}
          className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
        >
          <input
            type="email"
            className="flex-1 p-3 outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Entrez votre email ici"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Abonner
          </button>
        </form>
      </div>
    </div>
  );
}
