"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store";

export default function RedemptionPage() {
  const router = useRouter();
  const { data, ready, setUnlocked } = useAppData();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already unlocked in a previous visit — skip straight past this gate.
  useEffect(() => {
    if (!ready) return;
    if (data.unlocked && data.onboarded) router.replace("/overview");
    else if (data.unlocked) router.replace("/onboarding");
  }, [ready, data.unlocked, data.onboarded, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json();
      if (!res.ok || !body.valid) {
        setError(body.error ?? "That code doesn't look right.");
        return;
      }
      setUnlocked(true);
      router.replace("/onboarding");
    } catch {
      setError("Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="wordmark text-3xl text-center mb-1">Wedding Planner</p>
        <p className="text-center text-sm text-muted mb-10 tracking-wide uppercase">by Fay K</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Enter your redemption code
            </label>
            <input
              id="code"
              type="text"
              placeholder="FAYK-4821"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-foreground/20"
              autoCapitalize="characters"
              autoComplete="off"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full bg-foreground text-background rounded-lg py-3 font-medium disabled:opacity-40 transition-opacity"
          >
            {submitting ? "Checking…" : "Unlock my planner"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-8">
          Your code was emailed to you when you purchased the Wedding Cheat Sheet planner.
        </p>
      </div>
    </main>
  );
}
