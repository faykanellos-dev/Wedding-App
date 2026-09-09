"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function StatCard({
  href,
  icon,
  title,
  primary,
  secondary,
  progress,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  primary: string;
  secondary?: string;
  /** 0–1, renders a thin progress bar when provided */
  progress?: number;
}) {
  return (
    <Link
      href={href}
      className="block bg-surface border border-border rounded-xl p-4 hover:border-foreground/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span aria-hidden>{icon}</span>
        <span className="text-muted text-sm">›</span>
      </div>
      <p className="text-xs text-muted mb-1">{title}</p>
      <p className="text-lg font-semibold leading-tight">{primary}</p>
      {secondary && <p className="text-xs text-muted mt-0.5">{secondary}</p>}
      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="progress-bar-fill h-full bg-foreground rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
          />
        </div>
      )}
    </Link>
  );
}
