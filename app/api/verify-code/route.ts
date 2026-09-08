import { NextRequest, NextResponse } from "next/server";
import { isValidCode } from "@/lib/codes";

export async function POST(req: NextRequest) {
  let code = "";
  try {
    const body = await req.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ valid: false, error: "Malformed request" }, { status: 400 });
  }

  if (!code.trim()) {
    return NextResponse.json({ valid: false, error: "Enter your code" }, { status: 400 });
  }

  const valid = isValidCode(code);

  if (!valid) {
    return NextResponse.json(
      { valid: false, error: "That code doesn't look right — check your confirmation email and try again." },
      { status: 401 }
    );
  }

  return NextResponse.json({ valid: true });
}
