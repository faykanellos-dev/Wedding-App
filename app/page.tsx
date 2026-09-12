"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store";

export default function WelcomePage() {
  const router = useRouter();
  const { data, ready } = useAppData();

  useEffect(() => {
    if (!ready) return;
    if (data.onboarded) router.replace("/overview");
  }, [ready, data.onboarded, router]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <p className="wordmark text-3xl mb-3">Welcome to The Wedding Cheat Sheet</p>
        <p className="text-muted mb-10 leading-relaxed">
          Everything you need to plan your wedding, all in one place.
        </p>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full bg-foreground text-background rounded-lg py-3 font-medium"
        >
          Get started
        </button>
      </div>
    </main>
  );
}
