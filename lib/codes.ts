// Redemption code validation (app-spec.md §1).
//
// PRODUCTION NOTE: the original app checks codes against Vercel KV, populated
// by a Squarespace purchase-confirmation webhook/email flow. This fresh copy
// has no KV binding, so it validates against this in-memory list instead —
// swap `isValidCode` for a `kv.get(...)` lookup once a real KV store is wired
// up (see https://vercel.com/docs/storage/vercel-kv).
const VALID_CODES = new Set(["FAYK-4821", "FAYK-DEMO"]);

export function isValidCode(code: string): boolean {
  return VALID_CODES.has(code.trim().toUpperCase());
}
