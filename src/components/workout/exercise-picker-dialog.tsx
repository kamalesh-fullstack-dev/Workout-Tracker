"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { searchExercisesForPickerAction } from "@/actions/workouts";
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      startTransition(async () => {
        const data = await searchExercisesForPickerAction(query);
        setResults(data);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [query, open]);

  function handleSelect(exercise: PickerExercise) {
    onSelect(exercise);
    setOpen(false);
    setQuery("");
  }

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
          {!isPending && results.length === 0 && (
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
      </DialogContent>
    </Dialog>
  );
}
