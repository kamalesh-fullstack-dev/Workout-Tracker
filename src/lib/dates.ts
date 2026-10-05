/** "5 Oct 2026, Mon" — day-first with the weekday trailing, not locale-ordered. */
export function formatHistoryDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  return `${day} ${month} ${year}, ${weekday}`;
}
