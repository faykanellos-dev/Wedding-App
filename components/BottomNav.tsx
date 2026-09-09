"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconCheckCircle, IconWallet, IconUsers, IconHeart, IconClock } from "@/lib/icons";

const TABS = [
  { href: "/overview", label: "Overview", Icon: IconHome },
  { href: "/checklist", label: "Checklist", Icon: IconCheckCircle },
  { href: "/budget", label: "Budget", Icon: IconWallet },
  { href: "/guests", label: "Guests", Icon: IconUsers },
  { href: "/wishlist", label: "Wishlist", Icon: IconHeart },
  { href: "/timeline", label: "Timeline", Icon: IconClock },
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
              <tab.Icon className="w-5 h-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
