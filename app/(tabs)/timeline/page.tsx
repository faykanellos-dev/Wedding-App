"use client";

import { useState } from "react";
import { useAppData, sortedTimelineEvents } from "@/lib/store";
import { SUGGESTED_TIMELINE } from "@/lib/suggestedTimeline";
import type { TimelineEvent } from "@/lib/types";

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function TimelinePage() {
  const { data, upsertTimelineEvent, bulkAddTimelineEvents, deleteTimelineEvent } = useAppData();
  const [editing, setEditing] = useState<TimelineEvent | "new" | null>(null);

  const events = sortedTimelineEvents(data.timelineEvents);

  return (
    <main className="px-5 pt-8">
      <h1 className="text-xl font-medium mb-1">Day-of timeline</h1>
      <p className="text-xs text-muted mb-6">Your run-sheet for the wedding day itself.</p>

      {events.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">🕐</p>
          <p className="text-sm font-medium mb-1">No run-sheet yet</p>
          <p className="text-xs text-muted mb-5">
            Start from a suggested schedule and adjust the times, or build your own from scratch.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => bulkAddTimelineEvents(SUGGESTED_TIMELINE)}
              className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium"
            >
              Use suggested run-sheet
            </button>
            <button
              onClick={() => setEditing("new")}
              className="border border-border rounded-lg py-2.5 text-sm font-medium"
            >
              Add an event
            </button>
          </div>
        </div>
      ) : (
        <>
          <ol className="relative border-l border-border ml-2 space-y-5 mb-6">
            {events.map((event) => (
              <li key={event.id} className="ml-4">
                <div className="absolute -translate-x-[calc(0.5rem+1px)] w-2.5 h-2.5 rounded-full bg-foreground mt-1.5" />
                <button
                  onClick={() => setEditing(event)}
                  className="w-full text-left bg-surface border border-border rounded-xl p-3.5"
                >
                  <p className="text-xs text-muted tabular-nums mb-0.5">{formatTime(event.time)}</p>
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.notes && <p className="text-xs text-muted mt-0.5">{event.notes}</p>}
                </button>
              </li>
            ))}
          </ol>
          <button
            onClick={() => setEditing("new")}
            className="w-full border border-border rounded-lg py-2.5 text-sm font-medium"
          >
            Add an event
          </button>
        </>
      )}

      {editing && (
        <EventModal
          event={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(event) => {
            upsertTimelineEvent(event);
            setEditing(null);
          }}
          onDelete={
            editing !== "new"
              ? () => {
                  deleteTimelineEvent(editing.id);
                  setEditing(null);
                }
              : undefined
          }
        />
      )}
    </main>
  );
}

function EventModal({
  event,
  onClose,
  onSave,
  onDelete,
}: {
  event: TimelineEvent | null;
  onClose: () => void;
  onSave: (event: TimelineEvent) => void;
  onDelete?: () => void;
}) {
  const [time, setTime] = useState(event?.time ?? "12:00");
  const [title, setTitle] = useState(event?.title ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-medium mb-4">{event ? "Edit event" : "Add an event"}</p>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-xs text-muted mb-1">Time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted mb-1">Event</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ceremony begins"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted mb-1">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 mt-5">
          <button
            disabled={!title.trim()}
            onClick={() => onSave({ id: event?.id ?? "", time, title: title.trim(), notes: notes.trim() })}
            className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Save
          </button>
          {onDelete && (
            <button onClick={onDelete} className="border border-border rounded-lg py-2.5 text-sm font-medium text-red-600">
              Delete event
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
