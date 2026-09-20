import { RoutineBuilder } from "@/components/routines/routine-builder";

export default function NewRoutinePage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        New routine
      </h1>
      <RoutineBuilder />
    </div>
  );
}
