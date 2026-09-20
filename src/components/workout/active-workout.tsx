"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  addExerciseToSessionAction,
  deleteSetAction,
  finishWorkoutAction,
  logSetAction,
  removeExerciseFromSessionAction,
  updateSetAction,
} from "@/actions/workouts";
import type { Suggestion } from "@/lib/suggestions";
import { PR_TYPE_LABELS, type NewPR } from "@/lib/pr-types";
import { Button } from "@/components/ui/button";
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
  pending?: boolean;
};

type OptimisticAction =
  | { type: "add-exercise"; exercise: ExerciseBlockData }
  | { type: "remove-exercise"; sessionExerciseId: string }
  | { type: "add-set"; sessionExerciseId: string; set: SetItem }
  | { type: "remove-set"; setId: string }
  | {
      type: "update-set";
      setId: string;
      data: { weightKg: number; reps: number; rpe: number | null };
    };

function reducer(
  state: ExerciseBlockData[],
  action: OptimisticAction
): ExerciseBlockData[] {
  switch (action.type) {
    case "add-exercise":
      return [...state, action.exercise];
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
    default:
      return state;
  }
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
  const [isPending, startTransition] = useTransition();
  const [isFinishing, setIsFinishing] = useState(false);
  const restTimerRef = useRef<RestTimerHandle>(null);

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

  function showNewPRToast(newPRs: NewPR[]) {
    if (newPRs.length === 0) return;
    const summary = newPRs
      .map((pr) => `${PR_TYPE_LABELS[pr.type]}: ${pr.value}`)
      .join(" · ");
    toast.success(`New PR! ${summary}`);
  }

  function handleAddExercise(exercise: { id: string; name: string }) {
    startTransition(async () => {
      applyOptimistic({
        type: "add-exercise",
        exercise: {
          id: `temp-${exercise.id}-${Date.now()}`,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          restSeconds: null,
          sets: [],
          suggestion: null,
          pending: true,
        },
      });
      const result = await addExerciseToSessionAction(sessionId, exercise.id);
      if ("error" in result) toast.error(result.error);
      router.refresh();
    });
  }

  function handleRemoveExercise(sessionExerciseId: string) {
    startTransition(async () => {
      applyOptimistic({ type: "remove-exercise", sessionExerciseId });
      const result = await removeExerciseFromSessionAction(sessionExerciseId);
      if ("error" in result) toast.error(result.error);
      router.refresh();
    });
  }

  function handleLogSet(
    sessionExerciseId: string,
    data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean }
  ) {
    const exercise = exercises.find((e) => e.id === sessionExerciseId);
    const setNumber = (exercise?.sets.length ?? 0) + 1;

    startTransition(async () => {
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

    if (!data.isWarmup && !isCompleted) {
      restTimerRef.current?.start(exercise?.restSeconds ?? DEFAULT_REST_SECONDS);
    }
  }

  function handleDeleteSet(setId: string) {
    startTransition(async () => {
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
    startTransition(async () => {
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

  return (
    <div className="flex flex-col gap-4 pb-24">
      {exercises.map((exercise) => (
        <ExerciseBlock
          key={exercise.id}
          exerciseName={exercise.exerciseName}
          sets={exercise.sets}
          suggestion={exercise.suggestion}
          disabled={isPending || exercise.id.startsWith("temp-")}
          onLogSet={(data) => handleLogSet(exercise.id, data)}
          onDeleteSet={handleDeleteSet}
          onUpdateSet={handleUpdateSet}
          onRemoveExercise={() => handleRemoveExercise(exercise.id)}
        />
      ))}

      <ExercisePickerDialog
        onSelect={(exercise) => handleAddExercise(exercise)}
      />

      {!isCompleted && <RestTimer ref={restTimerRef} />}

      <div className="bg-card/80 border-border fixed inset-x-0 bottom-0 z-20 border-t p-4 shadow-2xl backdrop-blur-xl">
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
