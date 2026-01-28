"use client";

import { useEffect, useMemo, useState } from "react";
import type { FixedEvent, Preferences, Task } from "@/types/schedule";
import { buildSchedule } from "@/lib/scheduler";
import { generateIcs } from "@/lib/ics";
import { getDeepWorkWindows } from "@/lib/deepWork";
import { loadStoredData, saveStoredData } from "@/lib/storage";
import { sampleFixedEvents, samplePreferences, sampleTasks } from "@/lib/sampleData";
import { FixedEventsForm } from "@/components/FixedEventsForm";
import { TasksForm } from "@/components/TasksForm";
import { PreferencesForm } from "@/components/PreferencesForm";
import { ScheduleView } from "@/components/ScheduleView";
import { UnscheduledTasks } from "@/components/UnscheduledTasks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const defaultPreferences: Preferences = {
  chronotype: "Neutral",
  sleepStart: "23:00",
  sleepEnd: "07:00",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  slotGranularityMinutes: 15,
  breakRule: { focusMinutes: 50, breakMinutes: 10 },
  deepWorkWindows: getDeepWorkWindows("Neutral"),
};

export default function HomePage() {
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const stored = loadStoredData();
    if (stored) {
      setFixedEvents(stored.fixedEvents || []);
      setTasks(stored.tasks || []);
      const pref = stored.preferences || defaultPreferences;
      setPreferences({
        ...pref,
        deepWorkWindows: pref.deepWorkWindows?.length
          ? pref.deepWorkWindows
          : getDeepWorkWindows(pref.chronotype),
      });
    }
  }, []);

  useEffect(() => {
    saveStoredData({ fixedEvents, tasks, preferences });
  }, [fixedEvents, tasks, preferences]);

  const schedule = useMemo(
    () => buildSchedule(fixedEvents, tasks, preferences),
    [fixedEvents, tasks, preferences]
  );

  const handleLoadSample = () => {
    setFixedEvents(sampleFixedEvents);
    setTasks(sampleTasks);
    setPreferences(samplePreferences);
  };

  const handleExport = () => {
    const ics = generateIcs(schedule, new Date());
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bioschedule-${new Date().toISOString().slice(0, 10)}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">BioSchedule</h1>
              <p className="text-sm text-muted-foreground">
                Build a weekly plan that respects your energy cycles.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleLoadSample}>
                Load sample data
              </Button>
              <Button onClick={handleExport}>Export .ics</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Data is stored locally in your browser and never leaves this device.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <FixedEventsForm value={fixedEvents} onChange={setFixedEvents} />
            <TasksForm value={tasks} onChange={setTasks} />
          </div>
          <div className="space-y-6">
            <PreferencesForm value={preferences} onChange={setPreferences} />
            <UnscheduledTasks value={schedule.unscheduledTasks} />
          </div>
        </div>

        <Separator />

        <ScheduleView schedule={schedule} preferences={preferences} />
      </div>
    </main>
  );
}
