"use client";

import type { Preferences } from "@/types/schedule";
import { getDeepWorkWindows } from "@/lib/deepWork";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const chronotypeOptions: Preferences["chronotype"][] = [
  "EarlyBird",
  "Neutral",
  "NightOwl",
];

export function PreferencesForm({
  value,
  onChange,
}: {
  value: Preferences;
  onChange: (next: Preferences) => void;
}) {
  const update = (patch: Partial<Preferences>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biological Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Chronotype</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={value.chronotype}
              onChange={(event) => {
                const chronotype = event.target.value as Preferences["chronotype"];
                update({
                  chronotype,
                  deepWorkWindows: getDeepWorkWindows(chronotype),
                });
              }}
            >
              {chronotypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Sleep start</Label>
            <Input
              type="time"
              value={value.sleepStart}
              onChange={(event) => update({ sleepStart: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sleep end</Label>
            <Input
              type="time"
              value={value.sleepEnd}
              onChange={(event) => update({ sleepEnd: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Workday start</Label>
            <Input
              type="time"
              value={value.workdayStart}
              onChange={(event) => update({ workdayStart: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Workday end</Label>
            <Input
              type="time"
              value={value.workdayEnd}
              onChange={(event) => update({ workdayEnd: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Slot granularity</Label>
            <select
              className="h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              value={value.slotGranularityMinutes}
              onChange={(event) =>
                update({ slotGranularityMinutes: Number(event.target.value) })
              }
            >
              {[15, 30, 60].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Focus minutes</Label>
            <Input
              type="number"
              min={15}
              max={120}
              value={value.breakRule.focusMinutes}
              onChange={(event) =>
                update({
                  breakRule: {
                    ...value.breakRule,
                    focusMinutes: Number(event.target.value),
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Break minutes</Label>
            <Input
              type="number"
              min={5}
              max={30}
              value={value.breakRule.breakMinutes}
              onChange={(event) =>
                update({
                  breakRule: {
                    ...value.breakRule,
                    breakMinutes: Number(event.target.value),
                  },
                })
              }
            />
          </div>
        </div>
        <div className="rounded-md border border-border p-3 text-sm">
          <p className="font-medium">Derived deep work windows</p>
          <ul className="mt-2 grid gap-1 text-muted-foreground">
            {value.deepWorkWindows.map((window, index) => (
              <li key={`${window.start}-${window.end}-${index}`}>
                {window.start} - {window.end}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
