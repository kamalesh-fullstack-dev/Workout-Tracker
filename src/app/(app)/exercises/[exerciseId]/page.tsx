import { notFound } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { getExerciseProgressData } from "@/lib/progress";
import { PR_TYPES, PR_TYPE_LABELS, type PRType } from "@/lib/pr-types";
import {
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/lib/validations/exercise";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";

function formatPRValue(type: PRType, value: number) {
  return type === "MAX_REPS" ? `${value} reps` : `${value} kg`;
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const user = await requireUser();
  const { exerciseId } = await params;

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (
    !exercise ||
    (exercise.isCustom && exercise.createdById !== user.id)
  ) {
    notFound();
  }

  const [records, progress] = await Promise.all([
    db.personalRecord.findMany({ where: { userId: user.id, exerciseId } }),
    getExerciseProgressData(user.id, exerciseId),
  ]);
  const recordsByType = new Map(records.map((r) => [r.type, r]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {exercise.name}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="border-primary/50 text-primary">
            {EQUIPMENT_LABELS[exercise.equipment]}
          </Badge>
          {exercise.muscleGroups.map((group) => (
            <Badge
              key={group}
              variant="outline"
              className="border-primary/50 text-primary"
            >
              {MUSCLE_GROUP_LABELS[group]}
            </Badge>
          ))}
        </div>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PR_TYPES.map((type) => {
            const record = recordsByType.get(type);
            if (!record) return null;
            return (
              <Card key={type} className="gap-1 p-3">
                <p className="text-muted-foreground text-xs">
                  {PR_TYPE_LABELS[type]}
                </p>
                <p className="text-lg font-semibold">
                  {formatPRValue(type, Number(record.value))}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {progress.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No completed sets for this exercise yet.
        </p>
      ) : (
        <>
          <Card className="gap-2 p-4">
            <h2 className="text-sm font-medium">Estimated 1RM</h2>
            <TrendChart data={progress} dataKey="bestE1RM" unit="kg" />
          </Card>
          <Card className="gap-2 p-4">
            <h2 className="text-sm font-medium">Session volume</h2>
            <TrendChart
              data={progress}
              dataKey="volume"
              unit="kg"
              color="var(--chart-2)"
            />
          </Card>
        </>
      )}
    </div>
  );
}
