import { Task } from '@/types/task';

type ColumnInfo = { col: number; totalCols: number };

/**
 * Assigns side-by-side columns to timed events that overlap in time.
 *
 * Algorithm:
 * 1. Sort events by start time (ties: longer duration first).
 * 2. Greedy column assignment: for each event, pick the first column whose
 *    last end time is ≤ this event's start time; open a new column if none free.
 * 3. Second pass: find overlapping groups via interval merging and set
 *    totalCols = number of columns used in each group.
 *
 * Events that share only a boundary (A ends exactly when B starts) are NOT
 * considered overlapping (strict < comparison).
 *
 * @param events - Array of timed tasks (must have scheduledAt set).
 * @returns Map from task.id to { col, totalCols }.
 */
export function assignColumns(events: Task[]): Map<string, ColumnInfo> {
  if (events.length === 0) return new Map();

  // Duration in minutes for a task (default 30 min if not set)
  const durationOf = (t: Task) => t.duration ?? 30;

  // Start/end in epoch ms
  const startOf = (t: Task) => t.scheduledAt!.getTime();
  const endOf   = (t: Task) => startOf(t) + durationOf(t) * 60_000;

  // 1. Sort by start time, ties broken by longer duration first
  const sorted = [...events].sort((a, b) => {
    const ds = startOf(a) - startOf(b);
    if (ds !== 0) return ds;
    return durationOf(b) - durationOf(a);
  });

  // 2. Greedy column assignment
  // colEnds[c] = end time of the last event placed in column c
  const colEnds: number[] = [];
  const colAssigned = new Map<string, number>(); // taskId → col index

  for (const event of sorted) {
    const start = startOf(event);
    // Find first column that has ended by this event's start
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= start) {
        colEnds[c] = endOf(event);
        colAssigned.set(event.id, c);
        placed = true;
        break;
      }
    }
    if (!placed) {
      colAssigned.set(event.id, colEnds.length);
      colEnds.push(endOf(event));
    }
  }

  // 3. Find overlapping groups and compute totalCols for each group
  // We need to know, for each event, the maximum column index of all events
  // that temporally overlap with it (directly or transitively).
  // Use interval merging to find contiguous groups of overlapping events.

  // Sort again by start for interval merging
  const byStart = [...sorted];

  // Group events: an event joins the current group if it starts before the group's max end
  const result = new Map<string, ColumnInfo>();

  let groupStart = 0;
  while (groupStart < byStart.length) {
    let groupMaxEnd = endOf(byStart[groupStart]);
    let groupEnd = groupStart + 1;

    // Extend group while next event starts before current group max end
    while (groupEnd < byStart.length && startOf(byStart[groupEnd]) < groupMaxEnd) {
      groupMaxEnd = Math.max(groupMaxEnd, endOf(byStart[groupEnd]));
      groupEnd++;
    }

    // All events in [groupStart, groupEnd) form one overlapping group
    const groupEvents = byStart.slice(groupStart, groupEnd);
    let maxCol = 0;
    for (const e of groupEvents) {
      maxCol = Math.max(maxCol, colAssigned.get(e.id)!);
    }
    const totalCols = maxCol + 1;

    for (const e of groupEvents) {
      result.set(e.id, { col: colAssigned.get(e.id)!, totalCols });
    }

    groupStart = groupEnd;
  }

  return result;
}
