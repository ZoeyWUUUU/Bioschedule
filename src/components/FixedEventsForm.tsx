"use client";

import { useState } from "react";
import type { FixedEvent } from "@/types/schedule";
import { createId } from "@/lib/id";
import { DAY_OPTIONS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyEvent: Omit<FixedEvent, "id"> = {
  title: "",
  dayOfWeek: 0,
  startTime: "09:00",
  endTime: "10:00",
  description: "",
};

export function FixedEventsForm({
  value,
  onChange,
}: {
  value: FixedEvent[];
  onChange: (next: FixedEvent[]) => void;
}) {
  const [draft, setDraft] = useState(emptyEvent);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!draft.title.trim()) return "Title is required.";
    if (draft.startTime >= draft.endTime) return "Start time must be before end time.";
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
        id: createId("fixed"),
        ...draft,
        description: draft.description?.trim() || undefined,
      },
    ]);
    setDraft(emptyEvent);
  };

  const updateEvent = (id: string, patch: Partial<FixedEvent>) => {
    onChange(value.map((event) => (event.id === id ? { ...event, ...patch } : event)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Standup"
            />
          </div>
          <div className="space-y-2">
            <Label>Day</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={draft.dayOfWeek}
              onChange={(event) =>
                setDraft({ ...draft, dayOfWeek: Number(event.target.value) })
              }
            >
              {DAY_OPTIONS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Start</Label>
            <Input
              type="time"
              value={draft.startTime}
              onChange={(event) =>
                setDraft({ ...draft, startTime: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input
              type="time"
              value={draft.endTime}
              onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              placeholder="Optional notes"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="button" onClick={handleAdd}>
          Add event
        </Button>

        <div className="space-y-3">
          {value.length === 0 && (
            <p className="text-sm text-muted-foreground">No fixed events yet.</p>
          )}
          {value.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-border p-3 grid gap-2 md:grid-cols-6"
            >
              <Input
                className="md:col-span-2"
                value={event.title}
                onChange={(e) => updateEvent(event.id, { title: e.target.value })}
              />
              <select
                className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
                value={event.dayOfWeek}
                onChange={(e) =>
                  updateEvent(event.id, { dayOfWeek: Number(e.target.value) })
                }
              >
                {DAY_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <Input
                type="time"
                value={event.startTime}
                onChange={(e) => updateEvent(event.id, { startTime: e.target.value })}
              />
              <Input
                type="time"
                value={event.endTime}
                onChange={(e) => updateEvent(event.id, { endTime: e.target.value })}
              />
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onChange(value.filter((item) => item.id !== event.id))}
                >
                  Delete
                </Button>
              </div>
              <Textarea
                className="md:col-span-6"
                value={event.description ?? ""}
                onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
