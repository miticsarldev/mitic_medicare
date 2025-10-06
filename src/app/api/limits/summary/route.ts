export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getLimitSummaryForCurrentUser } from "@/lib/limits";

export async function GET() {
  try {
    const summary = await getLimitSummaryForCurrentUser();
    return NextResponse.json(summary, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const msg = e?.message ?? "Internal error";
    const status = msg === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
