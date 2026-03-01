/**
 * Streak calculation logic.
 *
 * A day "counts" if all habits were completed (100%).
 * Current streak: consecutive perfect days counting back from today.
 *   - If today is not yet perfect, we check from yesterday
 *     (streak is not broken until midnight).
 * Best streak: longest ever consecutive run of perfect days.
 */

export type StreakResult = {
  current: number;
  best: number;
};

export function calculateStreaks(
  logs: { completed_on: string }[],
  habitCount: number
): StreakResult {
  if (habitCount === 0) return { current: 0, best: 0 };

  // Count completions per day
  const countByDate = new Map<string, number>();
  for (const log of logs) {
    countByDate.set(log.completed_on, (countByDate.get(log.completed_on) ?? 0) + 1);
  }

  // A day is "perfect" if all habits were completed
  const isPerfect = (date: string) => (countByDate.get(date) ?? 0) >= habitCount;

  // Collect all unique dates, sorted descending
  const allDates = Array.from(new Set(logs.map((l) => l.completed_on))).sort().reverse();
  if (allDates.length === 0) return { current: 0, best: 0 };

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  // Current streak: walk backwards from today (or yesterday if today isn't perfect)
  let current = 0;
  let checkDate = new Date(isPerfect(todayStr) ? todayStr : yesterdayStr);
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (!isPerfect(dateStr)) break;
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Best streak: scan all dates in ascending order
  const sortedDates = Array.from(countByDate.keys()).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sortedDates) {
    if (!isPerfect(d)) { run = 0; prev = null; continue; }
    if (prev === null) {
      run = 1;
    } else {
      // Check if consecutive
      const prevDate = new Date(prev);
      prevDate.setDate(prevDate.getDate() + 1);
      const expected = prevDate.toISOString().slice(0, 10);
      run = d === expected ? run + 1 : 1;
    }
    if (run > best) best = run;
    prev = d;
  }

  return { current, best };
}
