"use client";

import { useState } from "react";
import type { Task } from "@/types/schedule";
import { createId } from "@/lib/id";
import { DAY_OPTIONS, DURATION_OPTIONS, ENERGY_TYPES, PRIORITIES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyTask: Omit<Task, "id"> = {
  title: "",
  durationMinutes: 60,
  priority: "Med",
  energyType: "DeepWork",
  notes: "",
};

export function TasksForm({
  value,
  onChange,
}: {
  value: Task[];
  onChange: (next: Task[]) => void;
}) {
  const [draft, setDraft] = useState(emptyTask);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!draft.title.trim()) return "Title is required.";
    return null;
  };

  const handleAdd = () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    onChange([
      ...value,
      {
        id: createId("task"),
        ...draft,
        notes: draft.notes?.trim() || undefined,
        earliestStart: draft.earliestStart || undefined,
        latestEnd: draft.latestEnd || undefined,
        dueDayOfWeek: draft.dueDayOfWeek ?? undefined,
      },
    ]);
    setDraft(emptyTask);
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    onChange(value.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Write blog post"
            />
          </div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={draft.durationMinutes}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  durationMinutes: Number(event.target.value) as Task["durationMinutes"],
                })
              }
            >
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={draft.priority}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  priority: event.target.value as Task["priority"],
                })
              }
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Energy type</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={draft.energyType}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  energyType: event.target.value as Task["energyType"],
                })
              }
            >
              {ENERGY_TYPES.map((energy) => (
                <option key={energy} value={energy}>
                  {energy}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Due day</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={draft.dueDayOfWeek ?? -1}
              onChange={(event) => {
                const next = Number(event.target.value);
                setDraft({
                  ...draft,
                  dueDayOfWeek: next === -1 ? undefined : next,
                });
              }}
            >
              <option value={-1}>None</option>
              {DAY_OPTIONS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Earliest start</Label>
            <Input
              type="time"
              value={draft.earliestStart ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, earliestStart: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Latest end</Label>
            <Input
              type="time"
              value={draft.latestEnd ?? ""}
              onChange={(event) => setDraft({ ...draft, latestEnd: event.target.value })}
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              placeholder="Optional details"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="button" onClick={handleAdd}>
          Add task
        </Button>

        <div className="space-y-3">
          {value.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          )}
          {value.map((task) => (
            <div
              key={task.id}
              className="rounded-md border border-border p-3 grid gap-2 md:grid-cols-6"
            >
              <Input
                className="md:col-span-2"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
              />
              <select
                className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
                value={task.durationMinutes}
                onChange={(e) =>
                  updateTask(task.id, {
                    durationMinutes: Number(e.target.value) as Task["durationMinutes"],
                  })
                }
              >
                {DURATION_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
                value={task.priority}
                onChange={(e) =>
                  updateTask(task.id, { priority: e.target.value as Task["priority"] })
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
                value={task.energyType}
                onChange={(e) =>
                  updateTask(task.id, {
                    energyType: e.target.value as Task["energyType"],
                  })
                }
              >
                {ENERGY_TYPES.map((energy) => (
                  <option key={energy} value={energy}>
                    {energy}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onChange(value.filter((item) => item.id !== task.id))}
                >
                  Delete
                </Button>
              </div>
              <div className="md:col-span-6 grid gap-2 md:grid-cols-4">
                <select
                  className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
                  value={task.dueDayOfWeek ?? -1}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    updateTask(task.id, {
                      dueDayOfWeek: next === -1 ? undefined : next,
                    });
                  }}
                >
                  <option value={-1}>No due day</option>
                  {DAY_OPTIONS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <Input
                  type="time"
                  value={task.earliestStart ?? ""}
                  onChange={(e) => updateTask(task.id, { earliestStart: e.target.value })}
                />
                <Input
                  type="time"
                  value={task.latestEnd ?? ""}
                  onChange={(e) => updateTask(task.id, { latestEnd: e.target.value })}
                />
                <Input
                  value={task.notes ?? ""}
                  onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                  placeholder="Notes"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
