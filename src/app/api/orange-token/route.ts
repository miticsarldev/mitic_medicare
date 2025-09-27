import { TokenData } from "@/types";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const auth = Buffer.from(
      `${process.env.EXPO_PUBLIC_ORANGE_MONEY_API_CLIENT_ID}:${process.env.EXPO_PUBLIC_ORANGE_MONEY_API_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post<TokenData>(
      "https://api.orange.com/oauth/v3/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erreur token Orange :", error.message);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du token Orange" },
      { status: 500 }
    );
  }
}
