"use client";

import type { Preferences, ScheduleResult, ScheduledBlock } from "@/types/schedule";
import { DAYS } from "@/lib/constants";
import { parseTimeToMinutes, minutesToTime } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function getDisplayRange(preferences: Preferences, blocks: ScheduledBlock[]) {
  const workStart = parseTimeToMinutes(preferences.workdayStart);
  const workEnd = parseTimeToMinutes(preferences.workdayEnd);

  let min = workStart;
  let max = workEnd;

  blocks.forEach((block) => {
    const start = parseTimeToMinutes(block.startTime);
    const end = parseTimeToMinutes(block.endTime);
    min = Math.min(min, start);
    max = Math.max(max, end);
  });

  return { start: min, end: max };
}

export function ScheduleView({
  schedule,
  preferences,
}: {
  schedule: ScheduleResult;
  preferences: Preferences;
}) {
  const granularity = preferences.slotGranularityMinutes;
  const { start, end } = getDisplayRange(preferences, schedule.scheduledBlocks);
  const totalSlots = Math.ceil((end - start) / granularity);
  const blocksByDay = DAYS.map((_, dayIndex) =>
    schedule.scheduledBlocks.filter((block) => block.dayOfWeek === dayIndex)
  );

  const occupancy = blocksByDay.map((dayBlocks) => {
    const cells = Array.from({ length: totalSlots }, () => "");
    dayBlocks.forEach((block) => {
      const blockStart = parseTimeToMinutes(block.startTime);
      const blockEnd = parseTimeToMinutes(block.endTime);
      const startSlot = Math.max(0, Math.floor((blockStart - start) / granularity));
      const lengthSlots = Math.ceil((blockEnd - blockStart) / granularity);
      for (let i = 0; i < lengthSlots; i += 1) {
        const idx = startSlot + i;
        if (cells[idx] === "") {
          cells[idx] = block.id;
        }
      }
    });
    return cells;
  });

  const blockLookup = new Map(
    schedule.scheduledBlocks.map((block) => [block.id, block])
  );

  const getRowSpan = (dayIndex: number, slotIndex: number) => {
    const id = occupancy[dayIndex][slotIndex];
    if (!id) return 1;
    let span = 1;
    for (let i = slotIndex + 1; i < occupancy[dayIndex].length; i += 1) {
      if (occupancy[dayIndex][i] !== id) break;
      span += 1;
    }
    return span;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="w-20 border-b border-border p-2">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="border-b border-border p-2">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalSlots }, (_, slotIndex) => {
                const timeLabel = minutesToTime(start + slotIndex * granularity);
                return (
                  <tr key={`slot-${slotIndex}`} className="border-b border-border">
                    <td className="p-2 text-xs text-muted-foreground">{timeLabel}</td>
                    {DAYS.map((_, dayIndex) => {
                      const id = occupancy[dayIndex][slotIndex];
                      if (!id) {
                        return <td key={`empty-${dayIndex}-${slotIndex}`} className="p-2" />;
                      }
                      if (
                        slotIndex > 0 &&
                        occupancy[dayIndex][slotIndex - 1] === id
                      ) {
                        return null;
                      }
                      const block = blockLookup.get(id);
                      if (!block) return <td key={`missing-${dayIndex}-${slotIndex}`} />;
                      const span = getRowSpan(dayIndex, slotIndex);
                      return (
                        <td
                          key={`block-${dayIndex}-${slotIndex}`}
                          rowSpan={span}
                          className="p-2 align-top"
                        >
                          <div className="rounded-md border border-border bg-white p-2 shadow-sm">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{block.title}</p>
                              <Badge variant="outline">{block.blockType}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {block.startTime} - {block.endTime}
                            </p>
                            {block.energyType && (
                              <p className="text-xs text-muted-foreground">
                                {block.energyType}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Chronological list</h3>
          <div className="space-y-2">
            {schedule.scheduledBlocks.length === 0 && (
              <p className="text-sm text-muted-foreground">No blocks scheduled.</p>
            )}
            {schedule.scheduledBlocks.map((block) => (
              <div key={`list-${block.id}`} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {DAYS[block.dayOfWeek]} • {block.title}
                  </p>
                  <Badge variant="outline">{block.blockType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {block.startTime} - {block.endTime}
                </p>
                {block.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {block.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
