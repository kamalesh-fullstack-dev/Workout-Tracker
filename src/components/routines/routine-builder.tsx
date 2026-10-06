"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Link2, Link2Off, Plus, Trash2 } from "lucide-react";
import { saveRoutineAction } from "@/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExercisePickerDialog } from "@/components/workout/exercise-picker-dialog";

type TargetSet = {
  targetReps: number | null;
  targetWeightKg: number | null;
  isDropSet: boolean;
};

type RoutineExerciseState = {
  exerciseId: string;
  exerciseName: string;
  restSeconds: number | null;
  groupId: string | null;
  targetSets: TargetSet[];
};

type RenderUnit =
  | { kind: "single"; exercise: RoutineExerciseState; index: number }
  | {
      kind: "group";
      groupId: string;
      members: { exercise: RoutineExerciseState; index: number }[];
    };

function buildRenderUnits(exercises: RoutineExerciseState[]): RenderUnit[] {
  const units: RenderUnit[] = [];
  const groupUnitIndex = new Map<string, number>();

  exercises.forEach((exercise, index) => {
    if (exercise.groupId) {
      const existingIdx = groupUnitIndex.get(exercise.groupId);
      if (existingIdx !== undefined) {
        const unit = units[existingIdx];
        if (unit.kind === "group") unit.members.push({ exercise, index });
      } else {
        groupUnitIndex.set(exercise.groupId, units.length);
        units.push({
          kind: "group",
          groupId: exercise.groupId,
          members: [{ exercise, index }],
        });
      }
    } else {
      units.push({ kind: "single", exercise, index });
    }
  });

  return units;
}

function GroupExercisesDialog({
  exercises,
  onGroup,
}: {
  exercises: RoutineExerciseState[];
  onGroup: (indexes: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const groupable = exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise }) => !exercise.groupId);

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function confirm() {
    if (selected.size < 2) {
      toast.error("Pick at least two exercises to group.");
      return;
    }
    onGroup(Array.from(selected));
    setSelected(new Set());
    setOpen(false);
  }

  if (groupable.length < 2) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelected(new Set());
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="lg" className="w-full">
            <Link2 />
            Group as superset/circuit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Group exercises</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Pick two or more exercises to do back-to-back when this routine is
          started.
        </p>
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {groupable.map(({ exercise, index }) => (
            <Label
              key={index}
              className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-2 font-normal"
            >
              <Checkbox
                checked={selected.has(index)}
                onCheckedChange={() => toggle(index)}
              />
              {exercise.exerciseName}
            </Label>
          ))}
        </div>
        <Button type="button" size="lg" disabled={selected.size < 2} onClick={confirm}>
          Group {selected.size > 0 ? `${selected.size} exercises` : ""}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ExerciseCard({
  exercise,
  exerciseIndex,
  onRemoveExercise,
  onUpdateExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: {
  exercise: RoutineExerciseState;
  exerciseIndex: number;
  onRemoveExercise: (index: number) => void;
  onUpdateExercise: (index: number, patch: Partial<RoutineExerciseState>) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<TargetSet>
  ) => void;
}) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{exercise.exerciseName}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemoveExercise(exerciseIndex)}
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
                onUpdateSet(exerciseIndex, setIndex, {
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
                onUpdateSet(exerciseIndex, setIndex, {
                  targetWeightKg: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <Button
              type="button"
              variant={set.isDropSet ? "default" : "outline"}
              size="xs"
              className="shrink-0"
              onClick={() =>
                onUpdateSet(exerciseIndex, setIndex, { isDropSet: !set.isDropSet })
              }
            >
              Drop
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemoveSet(exerciseIndex, setIndex)}
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
          onClick={() => onAddSet(exerciseIndex)}
        >
          <Plus /> Add set
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Label
          htmlFor={`rest-${exerciseIndex}`}
          className="text-muted-foreground text-xs"
        >
          Rest between sets (seconds)
        </Label>
        <Input
          id={`rest-${exerciseIndex}`}
          inputMode="numeric"
          className="h-9 w-24"
          value={exercise.restSeconds ?? ""}
          onChange={(e) =>
            onUpdateExercise(exerciseIndex, {
              restSeconds: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>
    </Card>
  );
}

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
        groupId: null,
        targetSets: [{ targetReps: 8, targetWeightKg: null, isDropSet: false }],
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
            {
              targetReps: lastSet?.targetReps ?? 8,
              targetWeightKg: lastSet?.targetWeightKg ?? null,
              isDropSet: false,
            },
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

  function groupExercises(indexes: number[]) {
    const groupId = crypto.randomUUID();
    setExercises((prev) =>
      prev.map((ex, i) => (indexes.includes(i) ? { ...ex, groupId } : ex))
    );
  }

  function ungroupExercise(index: number) {
    const groupId = exercises[index]?.groupId;
    if (!groupId) return;
    setExercises((prev) =>
      prev.map((ex) => (ex.groupId === groupId ? { ...ex, groupId: null } : ex))
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
        groupId: ex.groupId,
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

  const renderUnits = buildRenderUnits(exercises);

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

      {renderUnits.map((unit) =>
        unit.kind === "single" ? (
          <ExerciseCard
            key={`${unit.exercise.exerciseId}-${unit.index}`}
            exercise={unit.exercise}
            exerciseIndex={unit.index}
            onRemoveExercise={removeExercise}
            onUpdateExercise={updateExercise}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onUpdateSet={updateSet}
          />
        ) : (
          <div
            key={unit.groupId}
            className="border-primary/40 bg-primary/5 flex flex-col gap-3 rounded-xl border border-dashed p-3"
          >
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                <Link2 className="size-3.5" />
                {unit.members.length > 2 ? "Circuit" : "Superset"} ·{" "}
                {unit.members.length} exercises
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => ungroupExercise(unit.members[0].index)}
              >
                <Link2Off />
                Ungroup
              </Button>
            </div>
            {unit.members.map(({ exercise, index }) => (
              <ExerciseCard
                key={`${exercise.exerciseId}-${index}`}
                exercise={exercise}
                exerciseIndex={index}
                onRemoveExercise={removeExercise}
                onUpdateExercise={updateExercise}
                onAddSet={addSet}
                onRemoveSet={removeSet}
                onUpdateSet={updateSet}
              />
            ))}
          </div>
        )
      )}

      <ExercisePickerDialog onSelect={addExercise} />

      <GroupExercisesDialog exercises={exercises} onGroup={groupExercises} />

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
