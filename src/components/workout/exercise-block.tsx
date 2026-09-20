"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SetItem = {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  pending?: boolean;
};

export function ExerciseBlock({
  exerciseName,
  sets,
  disabled,
  onLogSet,
  onDeleteSet,
  onRemoveExercise,
}: {
  exerciseName: string;
  sets: SetItem[];
  disabled?: boolean;
  onLogSet: (data: {
    weightKg: number;
    reps: number;
    rpe: number | null;
    isWarmup: boolean;
  }) => void;
  onDeleteSet: (setId: string) => void;
  onRemoveExercise: () => void;
}) {
  const lastSet = sets[sets.length - 1];
  const [weight, setWeight] = useState(lastSet ? String(lastSet.weightKg) : "");
  const [reps, setReps] = useState(lastSet ? String(lastSet.reps) : "");
  const [rpe, setRpe] = useState("");
  const [isWarmup, setIsWarmup] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const weightNum = Number(weight);
    const repsNum = Number(reps);
    if (Number.isNaN(weightNum) || weightNum < 0) return;
    if (!Number.isFinite(repsNum) || repsNum < 1) return;

    onLogSet({
      weightKg: weightNum,
      reps: repsNum,
      rpe: rpe ? Number(rpe) : null,
      isWarmup,
    });
    setIsWarmup(false);
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{exerciseName}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={onRemoveExercise}
          aria-label={`Remove ${exerciseName}`}
        >
          <X />
        </Button>
      </div>

      {sets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {sets.map((set) => (
            <div
              key={set.id}
              className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 text-sm"
              style={{ opacity: set.pending ? 0.6 : 1 }}
            >
              <span className="text-muted-foreground w-6 font-mono">
                {set.setNumber}
              </span>
              <span className="flex-1">
                {set.weightKg} kg × {set.reps}
                {set.rpe ? ` @ RPE ${set.rpe}` : ""}
                {set.isWarmup ? (
                  <Badge variant="outline" className="ml-2">
                    Warmup
                  </Badge>
                ) : null}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled || set.pending}
                onClick={() => onDeleteSet(set.id)}
                aria-label={`Delete set ${set.setNumber}`}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`weight-${exerciseName}`} className="text-muted-foreground text-xs">
              Weight (kg)
            </Label>
            <Input
              id={`weight-${exerciseName}`}
              inputMode="decimal"
              className="h-12 text-lg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`reps-${exerciseName}`} className="text-muted-foreground text-xs">
              Reps
            </Label>
            <Input
              id={`reps-${exerciseName}`}
              inputMode="numeric"
              className="h-12 text-lg"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`rpe-${exerciseName}`} className="text-muted-foreground text-xs">
              RPE
            </Label>
            <Input
              id={`rpe-${exerciseName}`}
              inputMode="decimal"
              placeholder="opt."
              className="h-12 text-lg"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Label className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={isWarmup}
              onCheckedChange={(checked) => setIsWarmup(checked === true)}
              disabled={disabled}
            />
            Warmup set
          </Label>
          <Button type="submit" size="lg" className="h-12 flex-1" disabled={disabled}>
            Log set
          </Button>
        </div>
      </form>
    </Card>
  );
}
