import type {
  FixedEvent,
  Preferences,
  ScheduleResult,
  ScheduledBlock,
  Task,
  TimeWindow,
} from "@/types/schedule";
import { getDeepWorkWindows } from "@/lib/deepWork";
import { minutesToTime, parseTimeToMinutes } from "@/lib/time";

const priorityRank = { High: 0, Med: 1, Low: 2 } as const;

type Slot = {
  status: "free" | "blocked" | "fixed" | "task" | "break";
  blockId?: string;
};

type SegmentPlan = {
  type: "task" | "break";
  lengthSlots: number;
};

function buildSegmentPlan(
  taskSlots: number,
  focusSlots: number,
  breakSlots: number
): SegmentPlan[] {
  if (focusSlots <= 0 || breakSlots <= 0) {
    return [{ type: "task", lengthSlots: taskSlots }];
  }

  const segments: SegmentPlan[] = [];
  let remaining = taskSlots;

  while (remaining > 0) {
    const chunk = Math.min(remaining, focusSlots);
    segments.push({ type: "task", lengthSlots: chunk });
    remaining -= chunk;
    if (remaining > 0) {
      segments.push({ type: "break", lengthSlots: breakSlots });
    }
  }

  return segments;
}

function isWithinWindow(timeMinutes: number, window: TimeWindow) {
  const start = parseTimeToMinutes(window.start);
  const end = parseTimeToMinutes(window.end);
  return timeMinutes >= start && timeMinutes < end;
}

function isWithinAnyWindow(timeMinutes: number, windows: TimeWindow[]) {
  return windows.some((window) => isWithinWindow(timeMinutes, window));
}

export function buildSchedule(
  fixedEvents: FixedEvent[],
  tasks: Task[],
  preferences: Preferences
): ScheduleResult {
  const granularity = preferences.slotGranularityMinutes;
  const slotsPerDay = Math.floor((24 * 60) / granularity);
  const grid: Slot[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: slotsPerDay }, () => ({ status: "free" }))
  );

  const scheduledBlocks: ScheduledBlock[] = [];
  const unscheduledTasks: ScheduleResult["unscheduledTasks"] = [];

  const workStart = parseTimeToMinutes(preferences.workdayStart);
  const workEnd = parseTimeToMinutes(preferences.workdayEnd);
  const sleepStart = parseTimeToMinutes(preferences.sleepStart);
  const sleepEnd = parseTimeToMinutes(preferences.sleepEnd);

  const deepWorkWindows =
    preferences.deepWorkWindows.length > 0
      ? preferences.deepWorkWindows
      : getDeepWorkWindows(preferences.chronotype);

  const isTimeWithinSleep = (minutes: number) => {
    if (sleepStart === sleepEnd) return false;
    if (sleepStart < sleepEnd) {
      return minutes >= sleepStart && minutes < sleepEnd;
    }
    return minutes >= sleepStart || minutes < sleepEnd;
  };

  const isWithinWorkday = (minutes: number) => {
    if (workStart === workEnd) return false;
    if (workStart < workEnd) {
      return minutes >= workStart && minutes < workEnd;
    }
    return minutes >= workStart || minutes < workEnd;
  };

  // Block non-working hours and sleep windows.
  for (let day = 0; day < 7; day += 1) {
    for (let slot = 0; slot < slotsPerDay; slot += 1) {
      const minutes = slot * granularity;
      if (!isWithinWorkday(minutes) || isTimeWithinSleep(minutes)) {
        grid[day][slot] = { status: "blocked" };
      }
    }
  }

  // Place fixed events.
  fixedEvents.forEach((event) => {
    const start = parseTimeToMinutes(event.startTime);
    const end = parseTimeToMinutes(event.endTime);
    const startSlot = Math.floor(start / granularity);
    const endSlot = Math.ceil(end / granularity);

    for (let slot = startSlot; slot < endSlot; slot += 1) {
      if (grid[event.dayOfWeek]?.[slot]) {
        grid[event.dayOfWeek][slot] = {
          status: "fixed",
          blockId: event.id,
        };
      }
    }

    scheduledBlocks.push({
      id: event.id,
      title: event.title,
      dayOfWeek: event.dayOfWeek,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      blockType: "fixed",
      sourceId: event.id,
    });
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    const priority = priorityRank[a.priority] - priorityRank[b.priority];
    if (priority !== 0) return priority;
    const dueA = a.dueDayOfWeek ?? 99;
    const dueB = b.dueDayOfWeek ?? 99;
    if (dueA !== dueB) return dueA - dueB;
    return b.durationMinutes - a.durationMinutes;
  });

  const focusSlots = Math.ceil(preferences.breakRule.focusMinutes / granularity);
  const breakSlots = Math.ceil(preferences.breakRule.breakMinutes / granularity);

  const tryPlaceTask = (task: Task, requireDeepWork: boolean) => {
    const taskSlots = Math.ceil(task.durationMinutes / granularity);
    const segments = buildSegmentPlan(taskSlots, focusSlots, breakSlots);
    const totalSlots = segments.reduce((sum, segment) => sum + segment.lengthSlots, 0);

    const earliestStart = task.earliestStart
      ? parseTimeToMinutes(task.earliestStart)
      : null;
    const latestEnd = task.latestEnd ? parseTimeToMinutes(task.latestEnd) : null;

    // Assumption: dueDayOfWeek means the latest acceptable day (search Mon..dueDay).
    const dayLimit = task.dueDayOfWeek ?? 6;

    for (let day = 0; day <= dayLimit; day += 1) {
      for (let startSlot = 0; startSlot <= slotsPerDay - totalSlots; startSlot += 1) {
        const startMinutes = startSlot * granularity;
        const endMinutes = (startSlot + totalSlots) * granularity;

        if (earliestStart !== null && startMinutes < earliestStart) continue;
        if (latestEnd !== null && endMinutes > latestEnd) continue;

        if (
          requireDeepWork &&
          (task.energyType === "DeepWork" || task.energyType === "Creative") &&
          !isWithinAnyWindow(startMinutes, deepWorkWindows)
        ) {
          continue;
        }

        let cursor = startSlot;
        let canFit = true;

        for (const segment of segments) {
          for (let offset = 0; offset < segment.lengthSlots; offset += 1) {
            const slot = cursor + offset;
            if (!grid[day][slot] || grid[day][slot].status !== "free") {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
          cursor += segment.lengthSlots;
        }

        if (!canFit) continue;

        // Commit placement.
        cursor = startSlot;
        let segmentIndex = 0;
        for (const segment of segments) {
          const segStart = cursor * granularity;
          const segEnd = (cursor + segment.lengthSlots) * granularity;
          const blockId = `${task.id}-${segment.type}-${segmentIndex}`;

          for (let offset = 0; offset < segment.lengthSlots; offset += 1) {
            const slot = cursor + offset;
            grid[day][slot] = {
              status: segment.type === "task" ? "task" : "break",
              blockId,
            };
          }

          scheduledBlocks.push({
            id: blockId,
            title: segment.type === "break" ? "Break" : task.title,
            dayOfWeek: day,
            startTime: minutesToTime(segStart),
            endTime: minutesToTime(segEnd),
            description: segment.type === "break" ? "" : task.notes,
            blockType: segment.type === "break" ? "break" : "task",
            sourceId: task.id,
            energyType: task.energyType,
          });

          cursor += segment.lengthSlots;
          segmentIndex += 1;
        }

        return true;
      }
    }

    return false;
  };

  for (const task of sortedTasks) {
    const placed =
      tryPlaceTask(task, true) ||
      // Fallback without deep-work preference.
      tryPlaceTask(task, false);

    if (!placed) {
      unscheduledTasks.push({
        task,
        reason:
          "No contiguous slot available within workday/sleep constraints and existing events.",
      });
    }
  }

  scheduledBlocks.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  return { scheduledBlocks, unscheduledTasks };
}
