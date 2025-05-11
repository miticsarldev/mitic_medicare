import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { format, isSameDay } from "date-fns"
import { getDoctorSlotsWithTakenStatus } from "@/app/actions/doctor-actions"

type Appointment = {
  id: string
  scheduledAt: string
  status: string
  reason: string
  type: string
  doctor: { id: string; name: string; specialization: string }
  patient: { id: string; name: string }
}

function TimeSlotSelector({
  doctorId,
  selectedAppointment,
  newDate,
  setNewDate,
}: {
  doctorId: string
  selectedAppointment?: Appointment | null
  newDate: Date | null
  setNewDate: (date: Date) => void
}) {
  const [slots, setSlots] = useState<{ all: string[]; taken: string[] }>({ all: [], taken: [] })
  const [loading, setLoading] = useState<boolean>(false)
  const [loadedDay, setLoadedDay] = useState<Date | null>(null)

  const selectedTime =
    selectedAppointment?.scheduledAt &&
    format(new Date(selectedAppointment.scheduledAt), "HH:mm")

  const fetchSlots = useCallback(async (day: Date) => {
    setLoading(true)
    try {
      const res = await getDoctorSlotsWithTakenStatus(doctorId, day)
      if ('all' in res && 'taken' in res) {
        setSlots({ all: res.all as string[], taken: res.taken as string[] })
      } else if (typeof res === 'object') {
        const dayKey = format(day, "yyyy-MM-dd")
        if (res[dayKey]) {
          setSlots({ all: res[dayKey].all, taken: res[dayKey].taken })
        } else {
          setSlots({ all: [], taken: [] })
        }
      } else {
        console.error("Unexpected response structure", res)
      }
      setLoadedDay(new Date(day.getFullYear(), day.getMonth(), day.getDate()))
    } catch (err) {
      console.error("Error fetching slots", err)
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    if (!newDate) return

    const newDay = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())

    if (!loadedDay || !isSameDay(newDay, loadedDay)) {
      fetchSlots(newDay)
    }
  }, [newDate, loadedDay, fetchSlots])

  if (!newDate) return null

  return (
    <div>
      <p className="text-muted-foreground mb-2">Choisir une heure :</p>

      {loading ? (
        <p className="text-sm text-gray-500">Chargement des créneaux...</p>
      ) : slots.all.length === 0 ? (
        <p className="text-sm text-red-500">Aucun créneau disponible ce jour-là.</p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {slots.all.map((time) => {
            const [h, m] = time.split(":").map(Number)
            const slotDate = new Date(newDate)
            slotDate.setHours(h, m, 0, 0)

            const isSelected =
              newDate.getHours() === h && newDate.getMinutes() === m

            const isTaken = slots.taken.includes(time) && time !== selectedTime

            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                disabled={isTaken}
                className={isTaken ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => {
                  if (!isTaken && !isSelected) {
                    setNewDate(slotDate)
                  }
                }}
              >
                {time}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TimeSlotSelector
