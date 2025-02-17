import Image from "next/image";

const doctors = [
  {
    name: "Dr. Oumar Diarra",
    specialty: "Cardiologue",
    reviews: 102,
    rating: 4.5,
    image: "/med.png",
  },
  {
    name: "Dr. Aly Koné",
    specialty: "Neurologue",
    reviews: 97,
    rating: 4.7,
    image: "/med.png",
  },
  {
    name: "Dr. Aliou Touré",
    specialty: "Neurologue",
    reviews: 91,
    rating: 4.6,
    image: "/med.png",
  },
  {
    name: "Dr. Sarran Keïta",
    specialty: "Dentiste",
    reviews: 116,
    rating: 4.8,
    image: "/med.png",
  },
  {
    name: "Dr. Kassim",
    specialty: "Spécialiste de l’enfance",
    reviews: 72,
    rating: 4.4,
    image: "/med.png",
  },
  {
    name: "Dr. Abba Ahmed Oumar",
    specialty: "Neurologue",
    reviews: 91,
    rating: 4.6,
    image: "/med.png",
  },
];

export function MedSection () {
  return (
    <section className="bg-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Rencontrez Nos Médecins</h2>
        <p className="text-gray-500 mt-2">Des médecins hautement qualifiés sont prêts à vous servir</p>
      </div>

      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map((doctor, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="relative w-full h-40">
              <Image 
                src={doctor.image} 
                alt={doctor.name} 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg"
              />
            </div>
            <h3 className="text-lg font-semibold mt-4">{doctor.name}</h3>
            <p className="text-gray-500 text-sm">{doctor.specialty}</p>

            {/* Étoiles de notation */}
            <div className="flex justify-center items-center mt-2">
              <span className="text-blue-500 text-lg">⭐</span>
              <span className="text-gray-700 ml-2">{doctor.rating}</span>
              <span className="text-gray-500 ml-1">({doctor.reviews})</span>
            </div>

            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Prendre rendez-vous
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition">
          Voir Plus
        </button>
      </div>
    </section>
  );
};
