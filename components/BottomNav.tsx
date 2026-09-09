"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/overview", label: "Overview", icon: "🏠" },
  { href: "/checklist", label: "Checklist", icon: "✅" },
  { href: "/budget", label: "Budget", icon: "💰" },
  { href: "/guests", label: "Guests", icon: "👥" },
  { href: "/wishlist", label: "Wishlist", icon: "💌" },
  { href: "/timeline", label: "Timeline", icon: "🕐" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 inset-x-0 bg-background border-t border-border">
      <div className="max-w-md mx-auto grid grid-cols-6">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] px-0.5 ${
                active ? "text-foreground font-medium" : "text-muted"
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
