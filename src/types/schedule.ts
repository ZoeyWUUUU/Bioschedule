export type Priority = "Low" | "Med" | "High";
export type EnergyType = "DeepWork" | "Admin" | "Creative" | "Exercise" | "Errands";
export type Chronotype = "EarlyBird" | "Neutral" | "NightOwl";

export type FixedEvent = {
  id: string;
  title: string;
  dayOfWeek: number; // 0-6 (Monday=0)
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  description?: string;
};

export type Task = {
  id: string;
  title: string;
  durationMinutes: 15 | 30 | 45 | 60 | 90 | 120;
  dueDayOfWeek?: number; // 0-6 (Monday=0)
  priority: Priority;
  energyType: EnergyType;
  notes?: string;
  earliestStart?: string; // HH:MM
  latestEnd?: string; // HH:MM
};

export type BreakRule = {
  focusMinutes: number;
  breakMinutes: number;
};

export type TimeWindow = {
  start: string; // HH:MM
  end: string; // HH:MM
};

export type Preferences = {
  chronotype: Chronotype;
  sleepStart: string; // HH:MM
  sleepEnd: string; // HH:MM
  workdayStart: string; // HH:MM
  workdayEnd: string; // HH:MM
  slotGranularityMinutes: number;
  breakRule: BreakRule;
  deepWorkWindows: TimeWindow[];
};

export type ScheduledBlock = {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  description?: string;
  blockType: "task" | "fixed" | "break";
  sourceId?: string;
  energyType?: EnergyType;
};

export type UnscheduledTask = {
  task: Task;
  reason: string;
};

export type ScheduleResult = {
  scheduledBlocks: ScheduledBlock[];
  unscheduledTasks: UnscheduledTask[];
};
