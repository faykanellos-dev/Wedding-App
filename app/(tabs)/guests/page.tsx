"use client";

import { useState } from "react";
import { useAppData, guestStats } from "@/lib/store";
import type { Guest } from "@/lib/types";
import { IconUsers } from "@/lib/icons";

export default function GuestsPage() {
  const { data, addGuest, addTable } = useAppData();
  const [view, setView] = useState<"list" | "seating">("list");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const stats = guestStats(data.guests, data.onboarding.guestCountEstimate);
  const dietaryCount = data.guests.filter((g) => g.dietaryTags.length > 0).length;

  return (
    <main className="px-5 pt-8">
      <h1 className="text-xl font-medium mb-4">Guest list</h1>

      <div className="grid grid-cols-2 gap-1 bg-surface border border-border rounded-lg p-1 mb-6">
        {(["list", "seating"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`py-2 rounded-md text-sm font-medium capitalize ${
              view === v ? "bg-foreground text-background" : "text-muted"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <>
          <div className="grid grid-cols-4 gap-2 mb-6 text-center">
            <SummaryStat label="Invited" value={stats.invited} />
            <SummaryStat label="Confirmed" value={stats.confirmed} />
            <SummaryStat label="Pending" value={stats.invited - stats.confirmed} />
            <SummaryStat label="Dietary" value={dietaryCount} />
          </div>

          {data.guests.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-6 text-center">
              <IconUsers className="w-7 h-7 mx-auto mb-2 text-muted" />
              <p className="text-sm font-medium mb-1">No guests added yet</p>
              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => setShowAddGuest(true)}
                  className="bg-foreground text-background rounded-lg py-2.5 px-4 text-sm font-medium"
                >
                  Add a guest
                </button>
                <button
                  disabled
                  title="CSV import isn't scoped yet — see app-spec.md"
                  className="border border-border rounded-lg py-2.5 px-4 text-sm font-medium opacity-40"
                >
                  Import a list
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.guests.map((g) => (
                <li key={g.id} className="bg-surface border border-border rounded-xl p-3.5">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{g.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        g.rsvpStatus === "confirmed" ? "bg-foreground text-background" : "bg-border text-muted"
                      }`}
                    >
                      {g.rsvpStatus}
                    </span>
                  </div>
                  {g.dietaryTags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {g.dietaryTags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-border rounded-full px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {data.guests.length > 0 && (
            <button
              onClick={() => setShowAddGuest(true)}
              className="w-full border border-border rounded-lg py-2.5 text-sm font-medium mt-4"
            >
              Add a guest
            </button>
          )}
        </>
      ) : (
        <SeatingView
          selectedGuestId={selectedGuestId}
          setSelectedGuestId={setSelectedGuestId}
          onAddTable={() => setShowAddTable(true)}
        />
      )}

      {showAddGuest && (
        <AddGuestModal
          onClose={() => setShowAddGuest(false)}
          onSave={(g) => {
            addGuest(g);
            setShowAddGuest(false);
          }}
        />
      )}
      {showAddTable && (
        <AddTableModal
          onClose={() => setShowAddTable(false)}
          onSave={(t) => {
            addTable(t);
            setShowAddTable(false);
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
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function SeatingView({
  selectedGuestId,
  setSelectedGuestId,
  onAddTable,
}: {
  selectedGuestId: string | null;
  setSelectedGuestId: (id: string | null) => void;
  onAddTable: () => void;
}) {
  const { data, seatGuest } = useAppData();
  const unassigned = data.guests.filter((g) => !g.tableId);

  return (
    <div>
      <p className="text-xs text-muted mb-2">
        Tap a guest, then tap a table to seat them. (True drag-and-drop is flagged in the spec as a bigger build —
        this is the simpler v1 interaction.)
      </p>

      <div className="border border-dashed border-border rounded-xl p-3 mb-4">
        <p className="text-xs font-medium text-muted mb-2">Unassigned</p>
        {unassigned.length === 0 ? (
          <p className="text-xs text-muted">Everyone&apos;s seated</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map((g) => (
              <GuestChip
                key={g.id}
                name={g.name}
                selected={selectedGuestId === g.id}
                onClick={() => setSelectedGuestId(selectedGuestId === g.id ? null : g.id)}
              />
            ))}
          </div>
        )}
      </div>

      {data.tables.length === 0 ? (
        <button onClick={onAddTable} className="w-full border border-border rounded-lg py-2.5 text-sm font-medium">
          Add a table
        </button>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {data.tables.map((table) => {
              const seated = data.guests.filter((g) => g.tableId === table.id);
              const shown = seated.slice(0, 4);
              const extra = seated.length - shown.length;
              const assignable = !!selectedGuestId && seated.length < table.capacity;
              return (
                <button
                  key={table.id}
                  disabled={!assignable}
                  onClick={() => {
                    if (!selectedGuestId) return;
                    seatGuest(selectedGuestId, table.id);
                    setSelectedGuestId(null);
                  }}
                  className={`w-full text-left bg-surface border rounded-xl p-3.5 ${
                    assignable ? "border-foreground/40" : "border-border"
                  } ${!assignable && selectedGuestId ? "opacity-50" : ""}`}
                >
                  <div className="flex justify-between items-baseline mb-1.5">
                    <p className="text-sm font-medium">{table.name}</p>
                    <p className="text-xs text-muted">
                      {seated.length}/{table.capacity}
                    </p>
                  </div>
                  {shown.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {shown.map((g) => (
                        <span key={g.id} className="text-[10px] bg-border rounded-full px-2 py-0.5">
                          {g.name}
                        </span>
                      ))}
                      {extra > 0 && <span className="text-[10px] text-muted px-1">+{extra} more</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={onAddTable} className="w-full border border-border rounded-lg py-2.5 text-sm font-medium">
            Add a table
          </button>
        </>
      )}
    </div>
  );
}

function GuestChip({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border ${
        selected ? "bg-foreground text-background border-foreground" : "border-border"
      }`}
    >
      {name}
    </button>
  );
}

function AddGuestModal({ onClose, onSave }: { onClose: () => void; onSave: (g: Omit<Guest, "id">) => void }) {
  const [name, setName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<Guest["rsvpStatus"]>("pending");
  const [dietary, setDietary] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-medium mb-4">Add a guest</p>
        <div className="space-y-3">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </Field>
          <Field label="RSVP status">
            <select
              value={rsvpStatus}
              onChange={(e) => setRsvpStatus(e.target.value as Guest["rsvpStatus"])}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </Field>
          <Field label="Dietary tags (comma separated, optional)">
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Vegetarian, Gluten-free"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <button
            disabled={!name.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                rsvpStatus,
                dietaryTags: dietary
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                tableId: null,
              })
            }
            className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Add guest
          </button>
          <button onClick={onClose} className="text-sm text-muted py-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTableModal({ onClose, onSave }: { onClose: () => void; onSave: (t: { name: string; capacity: number; guestIds: string[] }) => void }) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("8");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-medium mb-4">Add a table</p>
        <div className="space-y-3">
          <Field label="Table name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Table 1"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Capacity">
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <button
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), capacity: Number(capacity) || 1, guestIds: [] })}
            className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Add table
          </button>
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
