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

import { FILTERS_BY_TYPE } from "@/config/filters.config";

type AnySortKey =
  | (typeof FILTERS_BY_TYPE)["doctor"]["sortBy"][number]
  | (typeof FILTERS_BY_TYPE)["hospital"]["sortBy"][number]
  | (typeof FILTERS_BY_TYPE)["department"]["sortBy"][number];

/**
 * Friendly label for a given sort key.
 * Falls back to a humanized version if the key isn't in the map.
 */
export function labelForSort(key: AnySortKey | string): string {
  const map: Record<AnySortKey, string> = {
    // Shared
    name_az: "Nom (A → Z)",
    rating_high: "Meilleure note",
    reviews_high: "Plus d’avis",
    recently_added: "Plus récents",

    // Doctors only
    fee_low: "Tarif le plus bas",
    fee_high: "Tarif le plus élevé",
    experience_high: "Plus d’expérience",

    // Hospitals / Departments
    doctors_high: "Plus de médecins",
    departments_high: "Plus de départements",
    hospital_az: "Hôpital (A → Z)",
  };

  // Exact match (typed)
  if (key in map) return map[key as AnySortKey];

  // Fallback: humanize unknown keys (e.g., "custom_key" -> "Custom key")
  const humanized = String(key)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  return humanized;
}
