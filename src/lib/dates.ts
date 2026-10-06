/** "5 Oct 2026, Mon" — day-first with the weekday trailing, not locale-ordered. */
export function formatHistoryDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  return `${day} ${month} ${year}, ${weekday}`;
}

/** "1h 12m" / "45m" / "<1m" — the span between a session's start and end. */
export function formatDuration(
  start: Date | string,
  end: Date | string
): string {
  const startMs = typeof start === "string" ? new Date(start).getTime() : start.getTime();
  const endMs = typeof end === "string" ? new Date(end).getTime() : end.getTime();
  const totalMinutes = Math.max(0, Math.round((endMs - startMs) / 60000));

  if (totalMinutes < 1) return "<1m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
