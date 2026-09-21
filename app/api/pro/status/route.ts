import { getProEntitlement } from "@/lib/proServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json({ pro: getProEntitlement(request) !== null }, { headers: { "Cache-Control": "no-store" } });
}
