"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  deleteRoutineAction,
  startWorkoutFromRoutineAction,
} from "@/actions/routines";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type RoutineListItem = {
  id: string;
  name: string;
  description: string | null;
  exerciseNames: string[];
};

export function RoutineList({ routines }: { routines: RoutineListItem[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteRoutineAction(id);
      if ("error" in result) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {routines.map((routine) => (
        <Card key={routine.id} className="gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/routines/${routine.id}`}
                className="font-medium hover:underline"
              >
                {routine.name}
              </Link>
              {routine.description && (
                <p className="text-muted-foreground text-sm">
                  {routine.description}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => handleDelete(routine.id)}
              aria-label={`Delete ${routine.name}`}
            >
              <Trash2 />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {routine.exerciseNames.join(", ")}
          </p>
          <form action={startWorkoutFromRoutineAction.bind(null, routine.id)}>
            <Button type="submit" size="sm" className="mt-1">
              Start workout
            </Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
