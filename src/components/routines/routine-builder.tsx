"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { saveRoutineAction } from "@/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ExercisePickerDialog } from "@/components/workout/exercise-picker-dialog";

type TargetSet = {
  targetReps: number | null;
  targetWeightKg: number | null;
};

type RoutineExerciseState = {
  exerciseId: string;
  exerciseName: string;
  restSeconds: number | null;
  targetSets: TargetSet[];
};

export function RoutineBuilder({
  routineId,
  initialName = "",
  initialDescription = "",
  initialExercises = [],
}: {
  routineId?: string;
  initialName?: string;
  initialDescription?: string;
  initialExercises?: RoutineExerciseState[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [exercises, setExercises] = useState<RoutineExerciseState[]>(
    initialExercises
  );
  const [isSaving, setIsSaving] = useState(false);

  function addExercise(exercise: { id: string; name: string }) {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        restSeconds: 90,
        targetSets: [{ targetReps: 8, targetWeightKg: null }],
      },
    ]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExercise(index: number, patch: Partial<RoutineExerciseState>) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex))
    );
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const lastSet = ex.targetSets[ex.targetSets.length - 1];
        return {
          ...ex,
          targetSets: [
            ...ex.targetSets,
            { targetReps: lastSet?.targetReps ?? 8, targetWeightKg: lastSet?.targetWeightKg ?? null },
          ],
        };
      })
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, targetSets: ex.targetSets.filter((_, j) => j !== setIndex) }
          : ex
      )
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<TargetSet>
  ) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              targetSets: ex.targetSets.map((s, j) =>
                j === setIndex ? { ...s, ...patch } : s
              ),
            }
          : ex
      )
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Give your routine a name.");
      return;
    }
    if (exercises.length === 0) {
      toast.error("Add at least one exercise.");
      return;
    }

    setIsSaving(true);
    const result = await saveRoutineAction({
      routineId,
      name,
      description,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        restSeconds: ex.restSeconds,
        targetSets: ex.targetSets,
      })),
    });
    setIsSaving(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Routine saved");
    router.push("/routines");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-24">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="routine-name">Routine name</Label>
          <Input
            id="routine-name"
            placeholder="e.g. Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="routine-description">Description (optional)</Label>
          <Input
            id="routine-description"
            placeholder="e.g. Chest, shoulders, triceps"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {exercises.map((exercise, exerciseIndex) => (
        <Card key={`${exercise.exerciseId}-${exerciseIndex}`} className="gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">{exercise.exerciseName}</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeExercise(exerciseIndex)}
              aria-label={`Remove ${exercise.exerciseName}`}
            >
              <Trash2 />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {exercise.targetSets.map((set, setIndex) => (
              <div key={setIndex} className="flex items-center gap-2">
                <span className="text-muted-foreground w-5 font-mono text-sm">
                  {setIndex + 1}
                </span>
                <Input
                  inputMode="numeric"
                  placeholder="Reps"
                  className="h-10"
                  value={set.targetReps ?? ""}
                  onChange={(e) =>
                    updateSet(exerciseIndex, setIndex, {
                      targetReps: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
                <Input
                  inputMode="decimal"
                  placeholder="kg (optional)"
                  className="h-10"
                  value={set.targetWeightKg ?? ""}
                  onChange={(e) =>
                    updateSet(exerciseIndex, setIndex, {
                      targetWeightKg: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSet(exerciseIndex, setIndex)}
                  aria-label={`Remove set ${setIndex + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSet(exerciseIndex)}
            >
              <Plus /> Add set
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor={`rest-${exerciseIndex}`} className="text-muted-foreground text-xs">
              Rest between sets (seconds)
            </Label>
            <Input
              id={`rest-${exerciseIndex}`}
              inputMode="numeric"
              className="h-9 w-24"
              value={exercise.restSeconds ?? ""}
              onChange={(e) =>
                updateExercise(exerciseIndex, {
                  restSeconds: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </Card>
      ))}

      <ExercisePickerDialog onSelect={addExercise} />

      <div
        className="bg-card/80 border-border fixed inset-x-0 bottom-0 z-20 border-t p-4 shadow-2xl backdrop-blur-xl"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="mx-auto flex max-w-2xl justify-end">
          <Button size="lg" className="h-12" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Saving..." : "Save routine"}
          </Button>
        </div>
      </div>
    </div>
  );
}
