// app/doctor/availabilities/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CalendarDays, Clock } from "lucide-react";

const DAYS = [
  { name: "Dimanche", short: "Dim" },
  { name: "Lundi", short: "Lun" },
  { name: "Mardi", short: "Mar" },
  { name: "Mercredi", short: "Mer" },
  { name: "Jeudi", short: "Jeu" },
  { name: "Vendredi", short: "Ven" },
  { name: "Samedi", short: "Sam" },
];

export default async function DoctorAvailabilitiesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div className="p-6 text-red-500">Non autorisé</div>;
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctor) {
    return <div className="p-6 text-red-500">Médecin non trouvé</div>;
  }

  const availabilities = await prisma.doctorAvailability.findMany({
    where: {
      doctorId: doctor.id,
      isActive: true,
    },
    orderBy: { dayOfWeek: "asc" },
  });

  // Organiser les disponibilités par jour
  const availabilitiesByDay = DAYS.map((day, dayIndex) => {
    const dayAvailabilities = availabilities.filter(
      (avail) => avail.dayOfWeek === dayIndex
    );
    return {
      ...day,
      dayIndex,
      availabilities: dayAvailabilities,
    };
  });

  // Trouver le jour actuel
  const currentDay = new Date().getDay();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Mes disponibilités</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availabilitiesByDay.map((day) => (
          <div 
            key={day.dayIndex}
            className={`
              border rounded-xl p-4 transition-all
              ${day.dayIndex === currentDay 
                ? "border-primary bg-primary/10 dark:bg-primary/20" 
                : "border-border bg-card dark:bg-card-dark"}
              shadow-sm hover:shadow-md
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                {day.name}
                {day.dayIndex === currentDay && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Aujourd&apos;hui
                  </span>
                )}
              </h2>
              <span className="text-sm text-muted-foreground">{day.short}</span>
            </div>
            
            {day.availabilities.length > 0 ? (
              <ul className="space-y-2">
                {day.availabilities.map((availability) => (
                  <li 
                    key={availability.id}
                    className={`
                      p-3 rounded-lg flex items-center justify-between
                      bg-background dark:bg-background-dark
                      border border-border dark:border-border-dark
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {availability.startTime} - {availability.endTime}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {availability.slotDuration} min
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground italic text-sm">
                  Pas de disponibilité
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}