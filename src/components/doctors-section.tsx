import Image from "next/image";
import { doctors } from "@/lib/doctors";

export function MedSection() {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Rencontrez Nos Médecins
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Des médecins hautement qualifiés sont prêts à vous servir
        </p>
      </div>

      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map((doctor, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center"
          >
            <div className="relative w-full h-40">
              <Image
                src={doctor.image}
                alt={doctor.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <h3 className="text-lg font-semibold mt-4 dark:text-white">
              {doctor.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {doctor.specialty}
            </p>
            
            <div className="flex justify-center items-center mt-2">
              <span className="text-blue-500 text-lg">⭐</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                {doctor.rating}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({doctor.reviews})
              </span>
            </div>

            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700">
              Prendre rendez-vous
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700">
          Voir Plus
        </button>
      </div>
    </section>
  );
}