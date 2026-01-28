import type { ScheduleResult } from "@/types/schedule";
import { addDays, getWeekStart, setTimeOnDate } from "@/lib/time";

function formatDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function escapeText(value?: string) {
  if (!value) return "";
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
}

export function generateIcs(
  schedule: ScheduleResult,
  referenceDate = new Date()
) {
  const weekStart = getWeekStart(referenceDate);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BioSchedule//EN",
    "CALSCALE:GREGORIAN",
  ];

  schedule.scheduledBlocks
    .filter((block) => block.blockType !== "break")
    .forEach((block) => {
      const dayDate = addDays(weekStart, block.dayOfWeek);
      const start = setTimeOnDate(dayDate, block.startTime);
      const end = setTimeOnDate(dayDate, block.endTime);
      const uid = `bioschedule-${block.sourceId}-${formatDateTime(start)}`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${formatDateTime(new Date())}`);
      lines.push(`DTSTART;TZID=${timeZone}:${formatDateTime(start)}`);
      lines.push(`DTEND;TZID=${timeZone}:${formatDateTime(end)}`);
      lines.push(`SUMMARY:${escapeText(block.title)}`);
      if (block.description) {
        lines.push(`DESCRIPTION:${escapeText(block.description)}`);
      }
      lines.push("END:VEVENT");
    });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
