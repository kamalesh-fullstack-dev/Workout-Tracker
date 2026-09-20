"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  deleteBodyWeightAction,
  logBodyWeightAction,
} from "@/actions/body-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";

export type BodyWeightEntry = {
  id: string;
  date: string;
  weightKg: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BodyWeightSection({
  entries,
}: {
  entries: BodyWeightEntry[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const weightNum = Number(weight);
    if (!Number.isFinite(weightNum) || weightNum <= 0) return;

    startTransition(async () => {
      const result = await logBodyWeightAction({ date, weightKg: weightNum });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Weight logged");
        setWeight("");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteBodyWeightAction(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  const chartData = entries
    .slice()
    .reverse()
    .map((e) => ({ date: e.date, weightKg: e.weightKg }));

  return (
    <Card className="gap-4 p-4">
      <h2 className="font-medium">Body weight</h2>

      <TrendChart data={chartData} dataKey="weightKg" unit="kg" />

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="bw-date" className="text-muted-foreground text-xs">
            Date
          </Label>
          <Input
            id="bw-date"
            type="date"
            className="h-10"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="bw-weight" className="text-muted-foreground text-xs">
            Weight (kg)
          </Label>
          <Input
            id="bw-weight"
            inputMode="decimal"
            className="h-10"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending} className="h-10">
          Log
        </Button>
      </form>

      {entries.length > 0 && (
        <div className="flex flex-col gap-1">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="text-muted-foreground flex items-center justify-between text-sm"
            >
              <span>
                {new Date(entry.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                — {entry.weightKg} kg
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleDelete(entry.id)}
                aria-label="Delete entry"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
