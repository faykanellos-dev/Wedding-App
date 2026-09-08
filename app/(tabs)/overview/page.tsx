"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useAppData,
  daysUntil,
  checklistStats,
  budgetStats,
  guestStats,
  wishlistStats,
  upNextTasks,
} from "@/lib/store";
import StatCard from "@/components/StatCard";

export default function OverviewPage() {
  const { data, toggleTask } = useAppData();
  const [today, setToday] = useState(() => new Date());

  // Recalculate the countdown at each new day without requiring a refresh.
  useEffect(() => {
    const msUntilMidnight =
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() - Date.now();
    const timer = setTimeout(() => setToday(new Date()), msUntilMidnight + 1000);
    return () => clearTimeout(timer);
  }, [today]);

  const days = daysUntil(data.onboarding.weddingDate);
  const checklist = checklistStats(data.tasks);
  const budget = budgetStats(data.budgetLines, data.onboarding.totalBudget);
  const guests = guestStats(data.guests, data.onboarding.guestCountEstimate);
  const wishlist = wishlistStats(data.wishlistCategories);
  const nextTasks = upNextTasks(data.tasks, 2);

  const budgetPct = budget.total > 0 ? budget.spent / budget.total : 0;
  const checklistPct = checklist.total > 0 ? checklist.completed / checklist.total : 0;
  const guestPct = guests.invited > 0 ? guests.confirmed / guests.invited : 0;

  return (
    <main className="px-5 pt-8">
      <header className="mb-6">
        <p className="wordmark text-2xl">Wedding Planner</p>
        <p className="text-xs text-muted uppercase tracking-wide">by Fay K</p>
      </header>

      <section className="text-center bg-foreground text-background rounded-2xl py-8 px-4 mb-6">
        {days === null ? (
          <p className="text-sm">Add your wedding date to start the countdown</p>
        ) : days >= 0 ? (
          <>
            <p className="text-5xl font-semibold tabular-nums">{days}</p>
            <p className="text-sm mt-1 opacity-80">{days === 1 ? "day to go" : "days to go"}</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold">Congratulations!</p>
            <p className="text-sm mt-1 opacity-80">Wishing you a beautiful marriage</p>
          </>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          href="/checklist"
          icon="✅"
          title="Checklist"
          primary={`${checklist.completed}/${checklist.total}`}
          secondary="tasks done"
          progress={checklist.total > 0 ? checklistPct : undefined}
        />
        <StatCard
          href="/budget"
          icon="💰"
          title="Budget"
          primary={budget.total > 0 ? `${Math.round(budgetPct * 100)}%` : "—"}
          secondary={budget.total > 0 ? `$${budget.spent.toLocaleString()} of $${budget.total.toLocaleString()}` : "Set a budget"}
          progress={budget.total > 0 ? budgetPct : undefined}
        />
        <StatCard
          href="/guests"
          icon="👥"
          title="Guests"
          primary={`${guests.confirmed}/${guests.invited || 0}`}
          secondary="confirmed"
          progress={guests.invited > 0 ? guestPct : undefined}
        />
        <StatCard
          href="/wishlist"
          icon="💌"
          title="Wishlist"
          primary={`${wishlist.vendorCount}`}
          secondary={`${wishlist.vendorCount === 1 ? "vendor" : "vendors"} · ${wishlist.categoriesUsed} ${
            wishlist.categoriesUsed === 1 ? "category" : "categories"
          }`}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Up next</p>
          <Link href="/checklist" className="text-xs text-muted">
            See all
          </Link>
        </div>

        {nextTasks.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted">
              {checklist.total === 0 ? "No checklist yet — head to the Checklist tab to get started." : "You're all caught up 🎉"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {nextTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3.5"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as complete`}
                  className="w-5 h-5 shrink-0 rounded-full border-2 border-foreground/40"
                />
                <div className="min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted">{task.milestone}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
