import { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELED: "Annulé",
  NO_SHOW: "Absent",
};

const statusClasses: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-700",
};

export function RenderAppointmentStatus({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-6 items-center rounded-full px-2 text-xs font-medium",
        statusClasses[status],
        className
      )}
    >
      {statusLabels[status]}
    </div>
  );
}
