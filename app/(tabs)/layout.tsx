"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, ready } = useAppData();

  useEffect(() => {
    if (!ready) return;
    if (!data.unlocked) router.replace("/");
    else if (!data.onboarded) router.replace("/onboarding");
  }, [ready, data.unlocked, data.onboarded, router]);

  if (!ready || !data.unlocked || !data.onboarded) {
    return <div className="flex-1" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 max-w-md w-full mx-auto pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}
