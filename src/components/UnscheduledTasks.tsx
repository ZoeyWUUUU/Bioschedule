"use client";

import type { UnscheduledTask } from "@/types/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UnscheduledTasks({ value }: { value: UnscheduledTask[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unscheduled Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">All tasks scheduled.</p>
        )}
        {value.map((entry) => (
          <div key={entry.task.id} className="rounded-md border border-border p-3">
            <p className="font-medium">{entry.task.title}</p>
            <p className="text-xs text-muted-foreground">{entry.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
