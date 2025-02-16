import Image from "next/image";

export default function MedicalBanner() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background Image */}
      <Image
        src="/doctors.jpg"
        alt="Doctors"
        width={800}
        height={600}
        className="w-full rounded-lg shadow-lg"
      />

      {/* Top Left - Highly Qualified Doctors */}
      <div className="absolute top-10 left-5 bg-white rounded-xl shadow-md p-3 flex items-center gap-2">
        <span className="text-blue-600 text-lg font-semibold">👨‍⚕️</span>
        <div>
          <p className="text-sm font-semibold">Médecins hautement qualifiés</p>
          <p className="text-xs text-gray-500">Traiter avec soin</p>
        </div>
      </div>

      {/* Bottom Left - Appointment Booking */}
      <div className="absolute bottom-10 left-5 bg-white rounded-xl shadow-md p-3 flex items-center gap-2">
        <span className="text-blue-600 text-lg font-semibold">📅</span>
        <div>
          <p className="text-sm font-semibold">Prendre rendez-vous</p>
          <p className="text-xs text-gray-500">Rendez-vous en ligne</p>
        </div>
      </div>

      {/* Right - Contact Info */}
      <div className="absolute bottom-10 right-5 bg-white rounded-xl shadow-md p-3 flex items-center gap-2">
        <span className="text-blue-600 text-lg font-semibold">📞</span>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <p className="text-xs text-blue-600 font-bold">+223700000</p>
        </div>
      </div>
    </div>
  );
}
