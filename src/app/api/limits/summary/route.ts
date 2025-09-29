// app/api/limits/summary/route.ts
import { getLimitSummaryForCurrentUser } from "@/utils/limits";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const summary = await getLimitSummaryForCurrentUser();
    return NextResponse.json(summary);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const msg = e?.message ?? "Internal error";
    const status = msg === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
