import { startWorkoutAction } from "@/actions/workouts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StartWorkoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Start a workout</CardTitle>
          <CardDescription>
            Routines and templates are coming soon. For now, start a blank
            session and add exercises as you go.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={startWorkoutAction}>
            <Button type="submit" size="lg" className="w-full">
              Start empty workout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
