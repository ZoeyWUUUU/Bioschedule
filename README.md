# BioSchedule

BioSchedule is a minimal weekly planner that turns fixed events, tasks, and biological preferences into an optimized schedule. Everything runs locally in the browser and can be exported to Google Calendar via .ics.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scheduling logic (high level)

- Build a weekly slot grid using the selected slot granularity.
- Block sleep windows and non-working hours.
- Place fixed events exactly as provided.
- Sort tasks by priority → due day → duration.
- Place each task into contiguous slots, preferring deep-work windows for DeepWork/Creative tasks.
- Insert break blocks when enabled (focus minutes + break minutes).
- Return scheduled blocks and unscheduled tasks with reasons.

Assumptions are documented inline in `src/lib/scheduler.ts`.

## Export to Google Calendar

1. Click **Export .ics** to download the file.
2. Open Google Calendar.
3. Use **Settings → Import & export → Import**, then select the downloaded `.ics` file.

## Known limitations

- Scheduling is deterministic and greedy (no global optimization).
- Tasks with long durations can fail to fit once breaks are inserted.
- Sleep/workday ranges are assumed to be consistent across the week.
- The weekly calendar view uses the chosen slot granularity, so small slots can create a tall grid.
