"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { deleteExerciseAction } from "@/actions/exercises";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/lib/validations/exercise";

type ExerciseListItem = {
  id: string;
  name: string;
  equipment: keyof typeof EQUIPMENT_LABELS;
  muscleGroups: (keyof typeof MUSCLE_GROUP_LABELS)[];
  isCustom: boolean;
  createdById: string | null;
};

export function ExerciseList({
  exercises,
  currentUserId,
}: {
  exercises: ExerciseListItem[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteExerciseAction(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Exercise deleted");
      }
    });
  }

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No exercises match your filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => {
        const canDelete =
          exercise.isCustom && exercise.createdById === currentUserId;

        return (
          <Card key={exercise.id} className="gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">{exercise.name}</span>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(exercise.id)}
                  aria-label={`Delete ${exercise.name}`}
                >
                  <X />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {exercise.isCustom && (
                <Badge variant="secondary">Custom</Badge>
              )}
              <Badge variant="outline">
                {EQUIPMENT_LABELS[exercise.equipment]}
              </Badge>
              {exercise.muscleGroups.map((group) => (
                <Badge key={group} variant="outline">
                  {MUSCLE_GROUP_LABELS[group]}
                </Badge>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
