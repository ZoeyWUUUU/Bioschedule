import type { FixedEvent, Preferences, Task } from "@/types/schedule";

export type StoredData = {
  fixedEvents: FixedEvent[];
  tasks: Task[];
  preferences: Preferences;
};

const STORAGE_KEY = "bioschedule.v1";

export function loadStoredData(): StoredData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredData;
  } catch {
    return null;
  }
}

export function saveStoredData(data: StoredData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
