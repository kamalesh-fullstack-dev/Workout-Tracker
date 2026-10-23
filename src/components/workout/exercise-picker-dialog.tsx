"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { searchExercisesForPickerAction } from "@/actions/workouts";
import { quickCreateExerciseAction } from "@/actions/exercises";
import { EQUIPMENT_LABELS } from "@/lib/validations/exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PickerExercise = {
  id: string;
  name: string;
  equipment: keyof typeof EQUIPMENT_LABELS;
};

export function ExercisePickerDialog({
  onSelect,
}: {
  onSelect: (exercise: PickerExercise) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickerExercise[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Responses can arrive out of order — e.g. the empty-query search fired
    // on open can still be in flight (slower, since it fetches the default
    // unfiltered list) when a subsequent real query's response comes back
    // first. Without this guard, the late empty-query response would
    // silently overwrite the correct, already-rendered results.
    let ignore = false;
    const handle = setTimeout(async () => {
      setIsPending(true);
      const data = await searchExercisesForPickerAction(query);
      if (!ignore) {
        setResults(data);
        setIsPending(false);
      }
    }, 200);
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query, open]);

  function handleSelect(exercise: PickerExercise) {
    onSelect(exercise);
    setOpen(false);
    setQuery("");
  }

  async function handleQuickCreate() {
    setIsCreating(true);
    const result = await quickCreateExerciseAction(query);
    setIsCreating(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.existed
        ? `"${result.exercise.name}" already exists — added it`
        : `Added "${result.exercise.name}" to your library`
    );
    handleSelect({
      ...result.exercise,
      equipment: result.exercise.equipment as PickerExercise["equipment"],
    });
  }

  const hasExactMatch = results.some(
    (r) => r.name.trim().toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full">
            <Plus />
            Add exercise
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an exercise</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-80 overflow-y-auto">
          {isPending && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Searching...
            </p>
          )}
          {!isPending && results.length === 0 && query.trim().length < 2 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No exercises found.
            </p>
          )}
          <ul className="flex flex-col">
            {results.map((exercise) => (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(exercise)}
                  className="hover:bg-muted flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm"
                >
                  <span>{exercise.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {EQUIPMENT_LABELS[exercise.equipment]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {!isPending && query.trim().length >= 2 && !hasExactMatch && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isCreating}
            onClick={handleQuickCreate}
          >
            <Plus />
            {isCreating
              ? "Adding..."
              : `Add "${query.trim()}" as a new exercise`}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
