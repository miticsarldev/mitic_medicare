// src/lib/orange.ts (server-only)
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

const ORANGE_CLIENT_ID = process.env.MITIC_ORANGE_MONEY_API_CLIENT_ID!;
const ORANGE_CLIENT_SECRET = process.env.MITIC_ORANGE_MONEY_API_CLIENT_SECRET!;

export async function getOrangeAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 50_000 > now) {
    // 1 min safety
    return cachedToken.accessToken;
  }

  const auth = Buffer.from(
    `${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const json = await res.json();
  if (!res.ok || !json?.access_token) {
    throw new Error("Orange OAuth token fetch failed");
  }

  // Orange returns 'expires_in' (seconds). Cache with a small guard.
  const expiresAt = now + Number(json.expires_in ?? 3600) * 1000;
  cachedToken = { accessToken: json.access_token, expiresAt };
  return json.access_token;
}
