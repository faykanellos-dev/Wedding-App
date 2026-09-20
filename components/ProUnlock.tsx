"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";

// Shared "already bought Pro? enter your code" widget, used on both the
// Overview upsell card and the Wishlist ProModal so there's one place to
// unlock from.
export default function ProUnlock() {
  const { redeemProCode } = useAppData();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = redeemProCode(code);
    if (ok) {
      setCode("");
      setOpen(false);
      setStatus("idle");
    } else {
      setStatus("invalid");
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-muted underline underline-offset-2">
        Already purchased? Enter your code
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setStatus("idle");
          }}
          placeholder="Pro code"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          autoFocus
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="bg-foreground text-background rounded-lg px-4 text-sm font-medium disabled:opacity-40"
        >
          Unlock
        </button>
      </div>
      {status === "invalid" && (
        <p className="text-xs text-red-600">That code doesn&apos;t look right — check your confirmation email.</p>
      )}
    </form>
  );
}
