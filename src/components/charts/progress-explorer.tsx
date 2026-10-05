"use client";

import { useState, useTransition } from "react";
import { getExerciseProgressAction } from "@/actions/progress";
import type { ProgressPoint } from "@/lib/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";

export function ProgressExplorer({
  exercises,
  initialExerciseId,
  initialData,
}: {
  exercises: { id: string; name: string; sessionCount?: number }[];
  initialExerciseId: string;
  initialData: ProgressPoint[];
}) {
  const [exerciseId, setExerciseId] = useState(initialExerciseId);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function handleChange(id: string | null) {
    if (!id) return;
    setExerciseId(id);
    startTransition(async () => {
      const result = await getExerciseProgressAction(id);
      setData(result);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Select value={exerciseId} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {exercises.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              {exercise.name}
              {exercise.sessionCount != null && (
                <span className="text-muted-foreground">
                  {" "}
                  · {exercise.sessionCount} session{exercise.sessionCount === 1 ? "" : "s"}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div style={{ opacity: isPending ? 0.6 : 1 }} className="flex flex-col gap-4">
        <Card className="gap-2 p-4">
          <h2 className="text-sm font-medium">Estimated 1RM</h2>
          <TrendChart data={data} dataKey="bestE1RM" unit="kg" />
        </Card>
        <Card className="gap-2 p-4">
          <h2 className="text-sm font-medium">Session volume</h2>
          <TrendChart data={data} dataKey="volume" unit="kg" color="var(--chart-2)" />
        </Card>
      </div>
    </div>
  );
}
