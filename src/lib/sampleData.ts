import type { FixedEvent, Preferences, Task } from "@/types/schedule";
import { getDeepWorkWindows } from "@/lib/deepWork";

export const samplePreferences: Preferences = {
  chronotype: "Neutral",
  sleepStart: "23:00",
  sleepEnd: "07:00",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  slotGranularityMinutes: 15,
  breakRule: { focusMinutes: 50, breakMinutes: 10 },
  deepWorkWindows: getDeepWorkWindows("Neutral"),
};

export const sampleFixedEvents: FixedEvent[] = [
  {
    id: "fixed-standup",
    title: "Team standup",
    dayOfWeek: 0,
    startTime: "09:30",
    endTime: "10:00",
    description: "Weekly status sync",
  },
  {
    id: "fixed-yoga",
    title: "Yoga class",
    dayOfWeek: 2,
    startTime: "18:30",
    endTime: "19:30",
  },
  {
    id: "fixed-dinner",
    title: "Family dinner",
    dayOfWeek: 4,
    startTime: "19:00",
    endTime: "20:30",
  },
];

export const sampleTasks: Task[] = [
  {
    id: "task-proposal",
    title: "Draft project proposal",
    durationMinutes: 120,
    dueDayOfWeek: 1,
    priority: "High",
    energyType: "DeepWork",
    notes: "Aim for 1st draft",
  },
  {
    id: "task-inbox",
    title: "Email triage",
    durationMinutes: 45,
    priority: "Med",
    energyType: "Admin",
  },
  {
    id: "task-creative",
    title: "Brainstorm campaign ideas",
    durationMinutes: 90,
    dueDayOfWeek: 3,
    priority: "Med",
    energyType: "Creative",
  },
  {
    id: "task-errands",
    title: "Grocery + pharmacy",
    durationMinutes: 60,
    priority: "Low",
    energyType: "Errands",
    earliestStart: "16:00",
  },
];
