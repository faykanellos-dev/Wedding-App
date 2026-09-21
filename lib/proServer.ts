// Server-side Pro entitlement. This file must only ever be imported from
// route handlers (app/api/**) — never from client components — because it
// reads secrets from environment variables.
//
// How it works:
//   1. Buyers get a Pro code after paying (e.g. in the Squarespace order
//      confirmation). The valid codes live ONLY in the PRO_CODES environment
//      variable on the server — not in this repo and not in the browser.
//   2. POST /api/pro/redeem checks the code on the server and, if valid,
//      sets a signed, HttpOnly cookie (JavaScript on the page can't read or
//      forge it, and editing localStorage/devtools can't grant Pro).
//   3. Anything that costs money or is a paid feature (currently
//      /api/review-vendor) re-checks that cookie on every request.
//   4. Revoking a code (removing it from PRO_CODES and redeploying)
//      invalidates every cookie that was issued from it.
//
// Required environment variables:
//   PRO_CODES         comma- or newline-separated list of valid Pro codes
//                     (each at least 8 characters, case-insensitive)
//   PRO_TOKEN_SECRET  a long random string (32+ chars) used to sign cookies
//
// If either is missing, Pro simply stays locked for everyone (fails closed).

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const PRO_COOKIE = "pro_token";
export const PRO_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365; // 1 year

function getSecret(): string | null {
  const s = process.env.PRO_TOKEN_SECRET;
  return s && s.length >= 32 ? s : null;
}

function getConfiguredCodes(): string[] {
  return (process.env.PRO_CODES ?? "")
    .split(/[\s,]+/)
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c.length >= 8);
}

// Short stable id for a code, so cookies can be tied to (and revoked with)
// the code they were issued from without storing the code itself.
function fingerprint(code: string, secret: string): string {
  return createHmac("sha256", secret).update(`pro-code:${code}`).digest("hex").slice(0, 16);
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// Returns the code's fingerprint if `input` is a currently valid Pro code.
export function matchProCode(input: string): string | null {
  const secret = getSecret();
  if (!secret) {
    console.error("Pro is disabled: PRO_TOKEN_SECRET is missing or shorter than 32 characters.");
    return null;
  }
  const normalized = input.trim().toUpperCase();
  if (!normalized || normalized.length > 64) return null;

  let match: string | null = null;
  for (const code of getConfiguredCodes()) {
    if (safeEqual(code, normalized)) match = fingerprint(code, secret);
  }
  return match;
}

export function signProToken(fp: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({ fp, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const sig = createHmac("sha256", secret).update(`pro-token:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyProToken(token: string): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;

  const expected = createHmac("sha256", secret).update(`pro-token:${payload}`).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  let parsed: { fp?: unknown; iat?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed.fp !== "string" || typeof parsed.iat !== "number") return null;

  const age = Math.floor(Date.now() / 1000) - parsed.iat;
  if (age < 0 || age > PRO_COOKIE_MAX_AGE_S) return null;

  // Revocation: the code this cookie came from must still be valid.
  const stillValid = getConfiguredCodes().some((code) => fingerprint(code, secret) === parsed.fp);
  return stillValid ? parsed.fp : null;
}

// Returns the fingerprint of the code behind this request's Pro cookie, or
// null if the request isn't (or is no longer) entitled to Pro.
export function getProEntitlement(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === PRO_COOKIE) {
      return verifyProToken(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export function proCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PRO_COOKIE}=${token}; Path=/; Max-Age=${PRO_COOKIE_MAX_AGE_S}; HttpOnly; SameSite=Lax${secure}`;
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
