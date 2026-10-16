"use client";

import type { ProgressPoint, OverallProgressPoint } from "@/lib/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";
import { ProgressExplorer } from "@/components/charts/progress-explorer";

export function ProgressTabs({
  overall,
  exercises,
  initialExerciseId,
  initialData,
}: {
  overall: OverallProgressPoint[];
  exercises: { id: string; name: string; sessionCount?: number }[];
  initialExerciseId: string;
  initialData: ProgressPoint[];
}) {
  return (
    <Tabs defaultValue="overall" className="gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
        <TabsList>
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="exercise">By exercise</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overall" className="flex flex-col gap-4">
        <Card className="gap-2 p-4">
          <h2 className="text-sm font-medium">Total sets</h2>
          <TrendChart
            data={overall}
            dataKey="totalSets"
            unit="sets"
            color="var(--chart-3)"
          />
        </Card>
        <Card className="gap-2 p-4">
          <h2 className="text-sm font-medium">Load progression</h2>
          <TrendChart
            data={overall}
            dataKey="totalVolume"
            unit="kg"
            color="var(--chart-4)"
          />
        </Card>
      </TabsContent>

      <TabsContent value="exercise">
        <ProgressExplorer
          exercises={exercises}
          initialExerciseId={initialExerciseId}
          initialData={initialData}
        />
      </TabsContent>
    </Tabs>
  );
}
