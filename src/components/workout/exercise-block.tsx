"use client";

import { useState } from "react";
import { Check, Pencil, Sparkles, Trash2, Trophy, X } from "lucide-react";
import type { Suggestion } from "@/lib/suggestions";
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

function SetRow({
  set,
  disabled,
  onDelete,
  onUpdate,
}: {
  set: SetItem;
  disabled?: boolean;
  onDelete: () => void;
  onUpdate: (data: { weightKg: number; reps: number; rpe: number | null }) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(String(set.weightKg));
  const [reps, setReps] = useState(String(set.reps));
  const [rpe, setRpe] = useState(set.rpe != null ? String(set.rpe) : "");

  function startEdit() {
    setWeight(String(set.weightKg));
    setReps(String(set.reps));
    setRpe(set.rpe != null ? String(set.rpe) : "");
    setIsEditing(true);
  }

  function save() {
    const weightNum = Number(weight);
    const repsNum = Number(reps);
    if (Number.isNaN(weightNum) || weightNum < 0) return;
    if (!Number.isFinite(repsNum) || repsNum < 1) return;
    onUpdate({ weightKg: weightNum, reps: repsNum, rpe: rpe ? Number(rpe) : null });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="bg-muted/50 flex items-center gap-1.5 rounded-md px-2 py-1.5">
        <span className="text-muted-foreground w-6 shrink-0 font-mono text-sm">
          {set.setNumber}
        </span>
        <Input
          inputMode="decimal"
          className="h-9"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <Input
          inputMode="numeric"
          className="h-9"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <Input
          inputMode="decimal"
          placeholder="RPE"
          className="h-9"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={save}
          aria-label={`Save set ${set.setNumber}`}
        >
          <Check />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsEditing(false)}
          aria-label="Cancel edit"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 text-sm"
      style={{ opacity: set.pending ? 0.6 : 1 }}
    >
      <span className="text-muted-foreground w-6 font-mono">{set.setNumber}</span>
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
        onClick={startEdit}
        aria-label={`Edit set ${set.setNumber}`}
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || set.pending}
        onClick={onDelete}
        aria-label={`Delete set ${set.setNumber}`}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export function ExerciseBlock({
  exerciseName,
  sets,
  suggestion,
  disabled,
  onLogSet,
  onDeleteSet,
  onUpdateSet,
  onRemoveExercise,
}: {
  exerciseName: string;
  sets: SetItem[];
  suggestion?: Suggestion | null;
  disabled?: boolean;
  onLogSet: (data: {
    weightKg: number;
    reps: number;
    rpe: number | null;
    isWarmup: boolean;
  }) => void;
  onDeleteSet: (setId: string) => void;
  onUpdateSet: (
    setId: string,
    data: { weightKg: number; reps: number; rpe: number | null }
  ) => void;
  onRemoveExercise: () => void;
}) {
  const lastSet = sets[sets.length - 1];
  const [weight, setWeight] = useState(
    lastSet
      ? String(lastSet.weightKg)
      : suggestion?.suggestedWeightKg != null
        ? String(suggestion.suggestedWeightKg)
        : ""
  );
  const [reps, setReps] = useState(
    lastSet
      ? String(lastSet.reps)
      : suggestion?.suggestedReps != null
        ? String(suggestion.suggestedReps)
        : ""
  );
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

      {sets.length === 0 && suggestion && suggestion.source !== "none" && (
        <div className="bg-primary/10 text-primary flex items-start gap-2 rounded-lg px-3 py-2 text-xs">
          <Sparkles className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {suggestion.rationale}
            {suggestion.wouldBePR && (
              <Badge variant="secondary" className="ml-2 align-middle">
                <Trophy className="size-3" /> Potential PR
              </Badge>
            )}
          </span>
        </div>
      )}

      {sets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              disabled={disabled}
              onDelete={() => onDeleteSet(set.id)}
              onUpdate={(data) => onUpdateSet(set.id, data)}
            />
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
