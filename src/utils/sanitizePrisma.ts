import { Decimal } from "@prisma/client/runtime/library";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizePrisma(obj: any): any {
  if (obj instanceof Decimal) return obj.toNumber();
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(sanitizePrisma);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, sanitizePrisma(val)])
    );
  }
  return obj;
}
