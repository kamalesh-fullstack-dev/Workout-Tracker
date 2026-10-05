"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createExerciseAction } from "@/actions/exercises";
import {
  createExerciseSchema,
  type CreateExerciseInput,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_TYPES,
  EQUIPMENT_LABELS,
  TRACKING_TYPES,
  TRACKING_TYPE_LABELS,
} from "@/lib/validations/exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function NewExercisePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      name: "",
      category: "STRENGTH",
      muscleGroups: [],
      equipment: "BARBELL",
      trackingType: "WEIGHT_REPS",
    },
  });

  async function onSubmit(values: CreateExerciseInput) {
    setIsSubmitting(true);
    const result = await createExerciseAction(values);
    setIsSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Exercise created");
    router.push("/exercises");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>New exercise</CardTitle>
          <CardDescription>
            Add a custom exercise to your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cable Pullover" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: string) =>
                              value.charAt(0) + value.slice(1).toLowerCase()
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXERCISE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: keyof typeof EQUIPMENT_LABELS) =>
                              EQUIPMENT_LABELS[value]
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {EQUIPMENT_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trackingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How is it tracked?</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: keyof typeof TRACKING_TYPE_LABELS) =>
                              TRACKING_TYPE_LABELS[value]
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRACKING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {TRACKING_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="muscleGroups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muscle groups</FormLabel>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {MUSCLE_GROUPS.map((group) => {
                        const checked = field.value?.includes(group);
                        return (
                          <Label
                            key={group}
                            className="flex items-center gap-2 font-normal"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  isChecked
                                    ? [...current, group]
                                    : current.filter((g) => g !== group)
                                );
                              }}
                            />
                            {MUSCLE_GROUP_LABELS[group]}
                          </Label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create exercise"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
