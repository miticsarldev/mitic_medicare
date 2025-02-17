import Image from "next/image";

export function LastItemSection() {
  return (
    <section className="bg-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Nos Derniers Articles</h2>
        <p className="text-gray-500 mt-2">Rédigé par nos experts de santé</p>
      </div>

      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Article 1 */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="relative w-full h-48">
            <Image 
              src="/ballon.png" 
              alt="Bien-être" 
              layout="fill" 
              objectFit="cover" 
              className="rounded-lg"
            />
          </div>
          <h3 className="text-lg font-semibold mt-4">Bien-être</h3>
          <p className="text-gray-500 text-sm mt-2">
            Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <a href="#" className="text-blue-500 font-semibold mt-2 inline-block">Voir Plus.</a>
        </div>

        {/* Article 2 */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="relative w-full h-48">
            <Image 
              src="/orange.png" 
              alt="Vitamines" 
              layout="fill" 
              objectFit="cover" 
              className="rounded-lg"
            />
          </div>
          <h3 className="text-lg font-semibold mt-4">Vitamines</h3>
          <p className="text-gray-500 text-sm mt-2">
            Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <a href="#" className="text-blue-500 font-semibold mt-2 inline-block">Voir Plus.</a>
        </div>

        {/* Article 3 */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="relative w-full h-48">
            <Image 
              src="/montre.png" 
              alt="Cardio" 
              layout="fill" 
              objectFit="cover" 
              className="rounded-lg"
            />
          </div>
          <h3 className="text-lg font-semibold mt-4">Cardio</h3>
          <p className="text-gray-500 text-sm mt-2">
            Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <a href="#" className="text-blue-500 font-semibold mt-2 inline-block">Voir Plus.</a>
        </div>
      </div>
    </section>
  );
};
