import type { Chronotype, TimeWindow } from "@/types/schedule";

export function getDeepWorkWindows(chronotype: Chronotype): TimeWindow[] {
  // Assumption: simple, explainable windows per chronotype.
  switch (chronotype) {
    case "EarlyBird":
      return [
        { start: "08:00", end: "11:00" },
        { start: "14:00", end: "16:00" },
      ];
    case "NightOwl":
      return [
        { start: "13:00", end: "16:00" },
        { start: "19:00", end: "21:00" },
      ];
    case "Neutral":
    default:
      return [
        { start: "10:00", end: "12:00" },
        { start: "15:00", end: "17:00" },
      ];
  }
}
