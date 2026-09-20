// Simple shared-code Pro unlock — the same pattern as the old redemption
// codes, just for the Pro tier instead of the whole app. Not
// cryptographically secure (the code lives in this public repo), but
// that's an acceptable tradeoff for a low-stakes $29 unlock — worst case
// someone unlocks Pro for free, which isn't a big deal at this stage.
//
// To change or add codes, edit VALID_CODES below and redeploy. Whatever
// code(s) are listed here need to reach buyers after they purchase —
// e.g. via the Squarespace order confirmation email or a "digital
// content" attachment on the Pro product.

const VALID_CODES = ["FAYKPRO26"];

export function isValidProCode(input: string): boolean {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return false;
  return VALID_CODES.some((code) => code.toUpperCase() === normalized);
}
