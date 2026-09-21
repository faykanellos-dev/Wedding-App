import { clientIp, matchProCode, proCookieHeader, signProToken } from "@/lib/proServer";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Slow down code guessing: 10 attempts per IP per 10 minutes.
  if (!rateLimit(`redeem:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
    return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let code = "";
  try {
    const body = await request.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const fp = matchProCode(code);
  const token = fp ? signProToken(fp) : null;
  if (!token) {
    return Response.json({ error: "That code doesn't look right." }, { status: 401 });
  }

  return new Response(JSON.stringify({ pro: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": proCookieHeader(token),
    },
  });
}
