import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { format, isSameDay } from "date-fns"
import { getDoctorSlotsWithTakenStatus } from "@/app/actions/doctor-actions"

type Appointment = {
  id: string
  scheduledAt: string
  status: string
  reason: string
  type: string
  doctor: {
    id: string
    name: string
    specialization: string
  }
  patient: {
    id: string
    name: string
  }
}

type SlotResult = { all: string[]; taken: string[] }
type SlotResultByWeek = { [day: string]: SlotResult }

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
  const [allSlots, setAllSlots] = useState<string[]>([])
  const [takenSlots, setTakenSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const selectedDayKey = useMemo(() => {
    return newDate ? format(newDate, "yyyy-MM-dd") : null
  }, [newDate])

  function isSlotResultPerDate(
    res: SlotResult | SlotResultByWeek
  ): res is SlotResult {
    return (
      typeof res === 'object' &&
      res !== null &&
      'all' in res &&
      Array.isArray((res as SlotResult).all)
    )
  }

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !newDate) return
      setLoading(true)
  
      const res = await getDoctorSlotsWithTakenStatus(doctorId, newDate)
  
      if (isSlotResultPerDate(res)) {
        setAllSlots(res.all)
        setTakenSlots(res.taken)
      } else {
        console.error("Unexpected slot result structure", res)
      }
  
      setLoading(false)
    }
  
    fetchSlots()
  }, [doctorId, selectedDayKey])
  


  if (!newDate) return null

  const selectedTime =
    selectedAppointment?.scheduledAt &&
    format(new Date(selectedAppointment.scheduledAt), "HH:mm")

  return (
    <div>
      <p className="text-muted-foreground mb-2">Choisir une heure :</p>

      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {allSlots.map((time) => {
            const [h, m] = time.split(":").map(Number)
            const fullDate = new Date(newDate)
            fullDate.setHours(h, m, 0, 0)

            const isSelected =
              newDate.getHours() === h && newDate.getMinutes() === m

            const isTaken = takenSlots.includes(time) && time !== selectedTime

            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                disabled={isTaken}
                className={isTaken ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => {
                  if (isTaken) return
                  setNewDate(fullDate)
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
