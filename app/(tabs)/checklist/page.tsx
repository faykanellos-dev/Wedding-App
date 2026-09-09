"use client";

import { useAppData } from "@/lib/store";
import { SUGGESTED_MILESTONES } from "@/lib/types";
import { SUGGESTED_CHECKLIST } from "@/lib/suggestedChecklist";
import { IconClipboard } from "@/lib/icons";
import { useState } from "react";

export default function ChecklistPage() {
  const { data, toggleTask, bulkAddTasks, addTask } = useAppData();
  const [newTitle, setNewTitle] = useState("");
  const [newMilestone, setNewMilestone] = useState<string>(SUGGESTED_MILESTONES[0]);

  const grouped = SUGGESTED_MILESTONES.map((milestone) => ({
    milestone,
    tasks: data.tasks.filter((t) => t.milestone === milestone),
  })).filter((g) => g.tasks.length > 0);

  const ungroupedMilestones = Array.from(
    new Set(data.tasks.map((t) => t.milestone).filter((m) => !SUGGESTED_MILESTONES.includes(m as never)))
  );

  function handleAdd() {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle.trim(), milestone: newMilestone });
    setNewTitle("");
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="text-xl font-medium mb-6">Checklist</h1>

      {data.tasks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <IconClipboard className="w-7 h-7 mx-auto mb-2 text-muted" />
          <p className="text-sm font-medium mb-1">Nothing on your list yet</p>
          <p className="text-xs text-muted mb-5">Start from our suggested checklist, or add your own tasks.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => bulkAddTasks(SUGGESTED_CHECKLIST)}
              className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium"
            >
              Use suggested checklist
            </button>
            <AddTaskInline
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newMilestone={newMilestone}
              setNewMilestone={setNewMilestone}
              onAdd={handleAdd}
              compact
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.milestone}>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">{g.milestone}</p>
              <ul className="space-y-2">
                {g.tasks.map((task) => (
                  <TaskRow key={task.id} title={task.title} completed={task.completed} onToggle={() => toggleTask(task.id)} />
                ))}
              </ul>
            </div>
          ))}
          {ungroupedMilestones.map((milestone) => (
            <div key={milestone}>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">{milestone}</p>
              <ul className="space-y-2">
                {data.tasks
                  .filter((t) => t.milestone === milestone)
                  .map((task) => (
                    <TaskRow key={task.id} title={task.title} completed={task.completed} onToggle={() => toggleTask(task.id)} />
                  ))}
              </ul>
            </div>
          ))}

          <AddTaskInline
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newMilestone={newMilestone}
            setNewMilestone={setNewMilestone}
            onAdd={handleAdd}
          />
        </div>
      )}
    </main>
  );
}

function TaskRow({ title, completed, onToggle }: { title: string; completed: boolean; onToggle: () => void }) {
  return (
    <li className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3.5">
      <button
        onClick={onToggle}
        aria-label={completed ? `Mark "${title}" as not done` : `Mark "${title}" as done`}
        className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] ${
          completed ? "bg-foreground border-foreground text-background" : "border-foreground/40"
        }`}
      >
        {completed && "✓"}
      </button>
      <p className={`text-sm ${completed ? "line-through text-muted" : ""}`}>{title}</p>
    </li>
  );
}

function AddTaskInline({
  newTitle,
  setNewTitle,
  newMilestone,
  setNewMilestone,
  onAdd,
  compact,
}: {
  newTitle: string;
  setNewTitle: (v: string) => void;
  newMilestone: string;
  setNewMilestone: (v: string) => void;
  onAdd: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "bg-surface border border-border rounded-xl p-3.5"}>
      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <select
          value={newMilestone}
          onChange={(e) => setNewMilestone(e.target.value)}
          className="border border-border rounded-lg px-2 py-2 text-sm max-w-[40%]"
        >
          {SUGGESTED_MILESTONES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onAdd}
        disabled={!newTitle.trim()}
        className="mt-2 w-full border border-border rounded-lg py-2 text-sm font-medium disabled:opacity-40"
      >
        Add task
      </button>
    </div>
  );
}
