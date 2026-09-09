"use client";

import { useState } from "react";
import { useAppData, budgetStats } from "@/lib/store";
import { CATEGORY_OPTIONS } from "@/lib/types";
import type { BudgetLine } from "@/lib/types";
import { IconWallet } from "@/lib/icons";

export default function BudgetPage() {
  const { data, upsertBudgetLine } = useAppData();
  const [editing, setEditing] = useState<BudgetLine | "new" | null>(null);

  const { spent, total } = budgetStats(data.budgetLines, data.onboarding.totalBudget);
  const left = total - spent;

  return (
    <main className="px-5 pt-8">
      <h1 className="text-xl font-medium mb-6">Budget tracker</h1>

      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <SummaryStat label="Budget" value={total} />
        <SummaryStat label="Spent" value={spent} />
        <SummaryStat label="Left" value={left} />
      </div>

      {data.budgetLines.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <IconWallet className="w-7 h-7 mx-auto mb-2 text-muted" />
          <p className="text-sm font-medium mb-1">No spending tracked yet</p>
          <button
            onClick={() => setEditing("new")}
            className="mt-3 bg-foreground text-background rounded-lg py-2.5 px-4 text-sm font-medium"
          >
            Add a budget category
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {data.budgetLines.map((line) => (
              <li key={line.id}>
                <button
                  onClick={() => setEditing(line)}
                  className="w-full text-left bg-surface border border-border rounded-xl p-3.5"
                >
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium">{line.vendorName || line.category}</p>
                    <p className="text-sm">${line.paidAmount.toLocaleString()} / ${line.quotedAmount.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{line.category}</p>
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setEditing("new")}
            className="w-full border border-border rounded-lg py-2.5 text-sm font-medium"
          >
            Add a vendor to budget
          </button>
        </>
      )}

      {editing && (
        <BudgetModal
          line={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(line) => {
            upsertBudgetLine(line);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl py-3">
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold">${value.toLocaleString()}</p>
    </div>
  );
}

function BudgetModal({
  line,
  onClose,
  onSave,
}: {
  line: BudgetLine | null;
  onClose: () => void;
  onSave: (line: BudgetLine) => void;
}) {
  const [category, setCategory] = useState(line?.category ?? CATEGORY_OPTIONS[0]);
  const [vendorName, setVendorName] = useState(line?.vendorName ?? "");
  const [quotedAmount, setQuotedAmount] = useState(line ? String(line.quotedAmount) : "");
  const [paidAmount, setPaidAmount] = useState(line ? String(line.paidAmount) : "");

  function save(overridePaid?: number) {
    onSave({
      id: line?.id ?? `budget-${Date.now()}`,
      category,
      vendorName,
      quotedAmount: Number(quotedAmount) || 0,
      paidAmount: overridePaid ?? (Number(paidAmount) || 0),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-medium mb-4">{line ? "Edit vendor" : "Add a vendor to budget"}</p>

        <div className="space-y-3">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vendor name">
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Quoted amount">
            <input
              type="number"
              min={0}
              value={quotedAmount}
              onChange={(e) => setQuotedAmount(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Paid so far">
            <input
              type="number"
              min={0}
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2 mt-5">
          <button onClick={() => save()} className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium">
            Save
          </button>
          {line && (
            <button
              onClick={() => save(Number(quotedAmount) || 0)}
              className="border border-border rounded-lg py-2.5 text-sm font-medium"
            >
              Mark as fully paid
            </button>
          )}
          <button onClick={onClose} className="text-sm text-muted py-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
