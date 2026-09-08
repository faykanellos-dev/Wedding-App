"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store";

const STEPS = ["welcome", "date", "budget", "guests", "confirm"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const { data, ready, completeOnboarding } = useAppData();
  const [stepIndex, setStepIndex] = useState(0);
  const [weddingDate, setWeddingDate] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [guestCount, setGuestCount] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!data.unlocked) router.replace("/");
    else if (data.onboarded) router.replace("/overview");
  }, [ready, data.unlocked, data.onboarded, router]);

  const step: Step = STEPS[stepIndex];

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function finish() {
    completeOnboarding({
      weddingDate: weddingDate || null,
      totalBudget: totalBudget ? Number(totalBudget) : null,
      guestCountEstimate: guestCount ? Number(guestCount) : null,
    });
    router.replace("/overview");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {step !== "welcome" && (
          <div className="flex gap-1.5 mb-10">
            {STEPS.slice(1).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  i <= stepIndex - 1 ? "bg-foreground" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {step === "welcome" && (
          <div className="text-center">
            <p className="wordmark text-3xl mb-3">Welcome</p>
            <p className="text-muted mb-10 leading-relaxed">
              A few quick questions to set up your planner — this takes less than a minute.
            </p>
            <button onClick={next} className="w-full bg-foreground text-background rounded-lg py-3 font-medium">
              Let&apos;s get started
            </button>
          </div>
        )}

        {step === "date" && (
          <StepShell title="When's the big day?" onBack={back}>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <PrimaryButton onClick={next} disabled={!weddingDate}>
              Continue
            </PrimaryButton>
          </StepShell>
        )}

        {step === "budget" && (
          <StepShell title="What's your total budget?" onBack={back}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="20,000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full border border-border rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <PrimaryButton onClick={next} disabled={!totalBudget}>
              Continue
            </PrimaryButton>
          </StepShell>
        )}

        {step === "guests" && (
          <StepShell title="Roughly how many guests?" onBack={back}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="120"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <p className="text-xs text-muted mt-2">
              Just an estimate for now — you&apos;ll build your actual guest list in the app.
            </p>
            <PrimaryButton onClick={next} disabled={!guestCount}>
              Continue
            </PrimaryButton>
          </StepShell>
        )}

        {step === "confirm" && (
          <div className="text-center">
            <p className="wordmark text-3xl mb-3">You&apos;re all set</p>
            <div className="text-left bg-surface border border-border rounded-lg p-4 mb-8 space-y-2 text-sm">
              <Row label="Wedding date" value={weddingDate || "—"} />
              <Row label="Budget" value={totalBudget ? `$${Number(totalBudget).toLocaleString()}` : "—"} />
              <Row label="Guests" value={guestCount || "—"} />
            </div>
            <button onClick={finish} className="w-full bg-foreground text-background rounded-lg py-3 font-medium">
              Go to my planner
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function StepShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-muted mb-4">
        ← Back
      </button>
      <p className="text-xl font-medium mb-6">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-foreground text-background rounded-lg py-3 font-medium disabled:opacity-40 transition-opacity"
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
