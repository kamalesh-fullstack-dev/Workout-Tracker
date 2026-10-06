"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Link2, Link2Off } from "lucide-react";
import {
  addExerciseToSessionAction,
  deleteSetAction,
  finishWorkoutAction,
  groupExercisesAction,
  logSetAction,
  removeExerciseFromSessionAction,
  ungroupExercisesAction,
  updateSetAction,
} from "@/actions/workouts";
import type { Suggestion } from "@/lib/suggestions";
import type { LastSessionSet } from "@/lib/progress";
import { PR_TYPE_LABELS, type NewPR } from "@/lib/pr-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExercisePickerDialog } from "@/components/workout/exercise-picker-dialog";
import { ExerciseBlock, type SetItem } from "@/components/workout/exercise-block";
import { RestTimer, type RestTimerHandle } from "@/components/workout/rest-timer";

const DEFAULT_REST_SECONDS = 90;

export type ExerciseBlockData = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  restSeconds: number | null;
  sets: SetItem[];
  suggestion?: Suggestion | null;
  lastSessionSets?: LastSessionSet[];
  groupId?: string | null;
  pending?: boolean;
};

type OptimisticAction =
  | { type: "add-exercise"; exercise: ExerciseBlockData }
  | { type: "confirm-exercise"; tempId: string; realId: string }
  | { type: "remove-exercise"; sessionExerciseId: string }
  | { type: "add-set"; sessionExerciseId: string; set: SetItem }
  | { type: "remove-set"; setId: string }
  | {
      type: "update-set";
      setId: string;
      data: { weightKg: number; reps: number; rpe: number | null };
    }
  | { type: "set-group"; sessionExerciseIds: string[]; groupId: string | null };

function reducer(
  state: ExerciseBlockData[],
  action: OptimisticAction
): ExerciseBlockData[] {
  switch (action.type) {
    case "add-exercise":
      return [...state, action.exercise];
    case "confirm-exercise":
      return state.map((e) =>
        e.id === action.tempId
          ? { ...e, id: action.realId, pending: false }
          : e
      );
    case "remove-exercise":
      return state.filter((e) => e.id !== action.sessionExerciseId);
    case "add-set":
      return state.map((e) =>
        e.id === action.sessionExerciseId
          ? { ...e, sets: [...e.sets, action.set] }
          : e
      );
    case "remove-set":
      return state.map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.id !== action.setId),
      }));
    case "update-set":
      return state.map((e) => ({
        ...e,
        sets: e.sets.map((s) =>
          s.id === action.setId ? { ...s, ...action.data, pending: true } : s
        ),
      }));
    case "set-group":
      return state.map((e) =>
        action.sessionExerciseIds.includes(e.id)
          ? { ...e, groupId: action.groupId }
          : e
      );
    default:
      return state;
  }
}

type RenderUnit =
  | { kind: "single"; exercise: ExerciseBlockData; index: number }
  | {
      kind: "group";
      groupId: string;
      members: { exercise: ExerciseBlockData; index: number }[];
    };

function buildRenderUnits(exercises: ExerciseBlockData[]): RenderUnit[] {
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
  exercises: ExerciseBlockData[];
  onGroup: (sessionExerciseIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const groupable = exercises.filter(
    (e) => !e.id.startsWith("temp-") && !e.groupId
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
          Pick two or more exercises to do back-to-back. The rest timer only
          starts after the last one in the group.
        </p>
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {groupable.map((exercise) => (
            <Label
              key={exercise.id}
              className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-2 font-normal"
            >
              <Checkbox
                checked={selected.has(exercise.id)}
                onCheckedChange={() => toggle(exercise.id)}
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

export function ActiveWorkout({
  sessionId,
  initialExercises,
  isCompleted = false,
}: {
  sessionId: string;
  initialExercises: ExerciseBlockData[];
  isCompleted?: boolean;
}) {
  const router = useRouter();
  const [exercises, applyOptimistic] = useOptimistic(
    initialExercises,
    reducer
  );
  const [, startTransition] = useTransition();
  const [isFinishing, setIsFinishing] = useState(false);
  const restTimerRef = useRef<RestTimerHandle>(null);

  // Tracks which exercises currently have an in-flight server action, so
  // only that exercise's "Log set" gets disabled — adding a new exercise or
  // logging a set elsewhere shouldn't block sets being logged on other
  // exercises while their own requests are still in flight.
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  function withBusy(id: string, fn: () => Promise<void>) {
    setBusyIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      try {
        await fn();
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  }

  // Only one exercise's log form is open at a time, by position — not id —
  // so this survives an optimistic temp-id being replaced by the real one.
  // Defaults to the most recently added exercise and auto-advances there
  // whenever the list grows, so logging a set on an earlier exercise never
  // stays "live" once you've moved on (that was causing mis-taps).
  const [openIndex, setOpenIndex] = useState<number | null>(
    exercises.length > 0 ? exercises.length - 1 : null
  );
  const prevLengthRef = useRef(exercises.length);
  useEffect(() => {
    if (exercises.length > prevLengthRef.current) {
      setOpenIndex(exercises.length - 1);
    } else if (exercises.length < prevLengthRef.current) {
      setOpenIndex((idx) =>
        idx !== null && idx < exercises.length ? idx : exercises.length - 1
      );
    }
    prevLengthRef.current = exercises.length;
  }, [exercises.length]);

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

  function showNewPRToast(newPRs: NewPR[]) {
    if (newPRs.length === 0) return;
    const summary = newPRs
      .map((pr) => `${PR_TYPE_LABELS[pr.type]}: ${pr.value}`)
      .join(" · ");
    toast.success(`🏁 New PR! ${summary}`);
  }

  function handleAddExercise(exercise: { id: string; name: string }) {
    const tempId = `temp-${exercise.id}-${Date.now()}`;
    startTransition(async () => {
      applyOptimistic({
        type: "add-exercise",
        exercise: {
          id: tempId,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          restSeconds: null,
          sets: [],
          suggestion: null,
          groupId: null,
          pending: true,
        },
      });
      const result = await addExerciseToSessionAction(sessionId, exercise.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      // Swap in the real id as soon as the row exists so sets can be logged
      // right away — the suggestion/last-session hints below still arrive
      // via the refresh, but logging a set was never waiting on them.
      applyOptimistic({
        type: "confirm-exercise",
        tempId,
        realId: result.sessionExerciseId,
      });
      router.refresh();
    });
  }

  function handleRemoveExercise(sessionExerciseId: string) {
    withBusy(sessionExerciseId, async () => {
      applyOptimistic({ type: "remove-exercise", sessionExerciseId });
      const result = await removeExerciseFromSessionAction(sessionExerciseId);
      if ("error" in result) toast.error(result.error);
      router.refresh();
    });
  }

  function handleGroup(sessionExerciseIds: string[]) {
    const optimisticGroupId = `temp-group-${Date.now()}`;
    startTransition(async () => {
      applyOptimistic({
        type: "set-group",
        sessionExerciseIds,
        groupId: optimisticGroupId,
      });
      const result = await groupExercisesAction(sessionExerciseIds);
      if ("error" in result) toast.error(result.error);
      router.refresh();
    });
  }

  function handleUngroup(sessionExerciseId: string) {
    const groupId = exercises.find((e) => e.id === sessionExerciseId)?.groupId;
    const memberIds = groupId
      ? exercises.filter((e) => e.groupId === groupId).map((e) => e.id)
      : [sessionExerciseId];
    startTransition(async () => {
      applyOptimistic({
        type: "set-group",
        sessionExerciseIds: memberIds,
        groupId: null,
      });
      const result = await ungroupExercisesAction(sessionExerciseId);
      if ("error" in result) toast.error(result.error);
      router.refresh();
    });
  }

  function handleLogSet(
    sessionExerciseId: string,
    data: {
      weightKg: number;
      reps: number;
      rpe: number | null;
      isWarmup: boolean;
      isDropSet: boolean;
    }
  ) {
    const exercise = exercises.find((e) => e.id === sessionExerciseId);
    const setNumber = (exercise?.sets.length ?? 0) + 1;

    withBusy(sessionExerciseId, async () => {
      applyOptimistic({
        type: "add-set",
        sessionExerciseId,
        set: {
          id: `temp-set-${Date.now()}`,
          setNumber,
          weightKg: data.weightKg,
          reps: data.reps,
          rpe: data.rpe,
          isWarmup: data.isWarmup,
          isDropSet: data.isDropSet,
          pending: true,
        },
      });
      const result = await logSetAction({ sessionExerciseId, ...data });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        showNewPRToast(result.newPRs);
      }
      router.refresh();
    });

    // In a superset/circuit, rest only happens after the last exercise in
    // the group — logging a set on an earlier member should move straight
    // to the next one, not start a rest countdown.
    const isLastInGroup = !exercise?.groupId
      ? true
      : (() => {
          const members = exercises.filter((e) => e.groupId === exercise.groupId);
          return members[members.length - 1]?.id === sessionExerciseId;
        })();

    if (!data.isWarmup && !data.isDropSet && !isCompleted && isLastInGroup) {
      restTimerRef.current?.start(exercise?.restSeconds ?? DEFAULT_REST_SECONDS);
    }
  }

  function handleDeleteSet(setId: string) {
    const sessionExerciseId =
      exercises.find((e) => e.sets.some((s) => s.id === setId))?.id ?? setId;
    withBusy(sessionExerciseId, async () => {
      applyOptimistic({ type: "remove-set", setId });
      const result = await deleteSetAction(setId);
      if ("error" in result) toast.error(result.error);
      router.refresh();
    });
  }

  function handleUpdateSet(
    setId: string,
    data: { weightKg: number; reps: number; rpe: number | null }
  ) {
    const sessionExerciseId =
      exercises.find((e) => e.sets.some((s) => s.id === setId))?.id ?? setId;
    withBusy(sessionExerciseId, async () => {
      applyOptimistic({ type: "update-set", setId, data });
      const result = await updateSetAction({ setId, ...data });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        showNewPRToast(result.newPRs);
      }
      router.refresh();
    });
  }

  function handleFinish() {
    setIsFinishing(true);
    startTransition(async () => {
      await finishWorkoutAction(sessionId);
    });
  }

  const renderUnits = buildRenderUnits(exercises);

  return (
    <div className="flex flex-col gap-4 pb-24">
      {renderUnits.map((unit) =>
        unit.kind === "single" ? (
          <ExerciseBlock
            key={unit.exercise.id}
            exerciseName={unit.exercise.exerciseName}
            sets={unit.exercise.sets}
            suggestion={unit.exercise.suggestion}
            lastSessionSets={unit.exercise.lastSessionSets}
            disabled={
              unit.exercise.id.startsWith("temp-") || busyIds.has(unit.exercise.id)
            }
            isOpen={unit.index === openIndex}
            onToggleOpen={() =>
              setOpenIndex((current) => (current === unit.index ? null : unit.index))
            }
            onLogSet={(data) => handleLogSet(unit.exercise.id, data)}
            onDeleteSet={handleDeleteSet}
            onUpdateSet={handleUpdateSet}
            onRemoveExercise={() => handleRemoveExercise(unit.exercise.id)}
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
                onClick={() => handleUngroup(unit.members[0].exercise.id)}
              >
                <Link2Off />
                Ungroup
              </Button>
            </div>
            {unit.members.map(({ exercise, index }) => (
              <ExerciseBlock
                key={exercise.id}
                exerciseName={exercise.exerciseName}
                sets={exercise.sets}
                suggestion={exercise.suggestion}
                lastSessionSets={exercise.lastSessionSets}
                disabled={exercise.id.startsWith("temp-") || busyIds.has(exercise.id)}
                isOpen={index === openIndex}
                onToggleOpen={() =>
                  setOpenIndex((current) => (current === index ? null : index))
                }
                onLogSet={(data) => handleLogSet(exercise.id, data)}
                onDeleteSet={handleDeleteSet}
                onUpdateSet={handleUpdateSet}
                onRemoveExercise={() => handleRemoveExercise(exercise.id)}
              />
            ))}
          </div>
        )
      )}

      <ExercisePickerDialog
        onSelect={(exercise) => handleAddExercise(exercise)}
      />

      <GroupExercisesDialog exercises={exercises} onGroup={handleGroup} />

      {!isCompleted && <RestTimer ref={restTimerRef} />}

      <div
        className="bg-card/80 border-border fixed inset-x-0 bottom-0 z-20 border-t p-4 shadow-2xl backdrop-blur-xl"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm">
            {exercises.length} exercise{exercises.length === 1 ? "" : "s"} ·{" "}
            {totalSets} set{totalSets === 1 ? "" : "s"}
          </span>
          {isCompleted ? (
            <Button
              size="lg"
              className="h-12"
              nativeButton={false}
              render={<Link href="/history">Done</Link>}
            />
          ) : (
            <Button
              size="lg"
              className="h-12"
              disabled={totalSets === 0 || isFinishing}
              onClick={handleFinish}
            >
              {isFinishing ? "Finishing..." : "Finish workout"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
