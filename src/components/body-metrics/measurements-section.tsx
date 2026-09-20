"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  deleteMeasurementAction,
  logMeasurementAction,
} from "@/actions/body-metrics";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_LABELS,
} from "@/lib/validations/body-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MeasurementEntry = {
  id: string;
  date: string;
  type: (typeof MEASUREMENT_TYPES)[number];
  valueCm: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function MeasurementsSection({
  entries,
}: {
  entries: MeasurementEntry[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<(typeof MEASUREMENT_TYPES)[number]>("WAIST");
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valueNum = Number(value);
    if (!Number.isFinite(valueNum) || valueNum <= 0) return;

    startTransition(async () => {
      const result = await logMeasurementAction({ date, type, valueCm: valueNum });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Measurement logged");
        setValue("");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteMeasurementAction(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Card className="gap-4 p-4">
      <h2 className="font-medium">Measurements</h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-xs">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="h-10 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEASUREMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {MEASUREMENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="m-date" className="text-muted-foreground text-xs">
            Date
          </Label>
          <Input
            id="m-date"
            type="date"
            className="h-10"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="m-value" className="text-muted-foreground text-xs">
            Value (cm)
          </Label>
          <Input
            id="m-value"
            inputMode="decimal"
            className="h-10 w-24"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending} className="h-10">
          Log
        </Button>
      </form>

      {entries.length > 0 && (
        <div className="flex flex-col gap-1">
          {entries.slice(0, 8).map((entry) => (
            <div
              key={entry.id}
              className="text-muted-foreground flex items-center justify-between text-sm"
            >
              <span>
                {MEASUREMENT_TYPE_LABELS[entry.type]} — {entry.valueCm} cm ·{" "}
                {new Date(entry.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleDelete(entry.id)}
                aria-label="Delete measurement"
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
