export function generateTimeSlots(
  start: string,
  end: string,
  interval = 30
): string[] {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const slots: string[] = [];
  let hour = startHour;
  let minute = startMinute;

  while (hour < endHour || (hour === endHour && minute < endMinute)) {
    slots.push(
      `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    );
    minute += interval;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
  }

  return slots;
}

export function parseTime(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
