import type { TimeWindow } from "@/types/schedule";

export function parseTimeToMinutes(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return hh * 60 + mm;
}

export function minutesToTime(minutes: number) {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function isTimeInWindow(timeMinutes: number, window: TimeWindow) {
  const start = parseTimeToMinutes(window.start);
  const end = parseTimeToMinutes(window.end);
  return timeMinutes >= start && timeMinutes < end;
}

export function isTimeInAnyWindow(timeMinutes: number, windows: TimeWindow[]) {
  return windows.some((window) => isTimeInWindow(timeMinutes, window));
}

export function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = (date.getDay() + 6) % 7; // Monday=0
  result.setDate(date.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function setTimeOnDate(date: Date, time: string) {
  const result = new Date(date);
  const [hh, mm] = time.split(":").map(Number);
  result.setHours(hh, mm, 0, 0);
  return result;
}
