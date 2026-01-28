export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DAY_OPTIONS = DAYS.map((label, index) => ({ label, value: index }));

export const PRIORITIES = ["High", "Med", "Low"] as const;
export const ENERGY_TYPES = [
  "DeepWork",
  "Admin",
  "Creative",
  "Exercise",
  "Errands",
] as const;

export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;
