export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Iron Log</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Workout tracking, PRs, and smart set suggestions. Auth and the
        dashboard are coming in the next phase.
      </p>
    </div>
  );
}
