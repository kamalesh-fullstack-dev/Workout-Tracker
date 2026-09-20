export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Iron Log needs a connection to load your workouts. Reconnect and
        reload — anything you already had open may still work.
      </p>
    </div>
  );
}
