/**
 * parseTask — Natural language task input parser
 *
 * Tokens (#project, [duration], p1/p2/p3) can appear ANYWHERE in the input —
 * at the start, middle, or end. Order is completely free.
 *
 * Test cases (all must produce correct output):
 *
 * 1. "#app make an app tomorrow 12:00 [1hr]"
 *    → project: "app", name: "make an app", date: tomorrow 12:00, duration: 60min, priority: p2
 *
 * 2. "#health Morning run today 7am [45min]"
 *    → project: "health", name: "Morning run", date: today 07:00, duration: 45min, priority: p2
 *
 * 3. "#work Call with client friday 2:30pm [30min] p1"
 *    → project: "work", name: "Call with client", date: Friday 14:30, duration: 30min, priority: p1
 *
 * 4. "Buy milk"
 *    → project: undefined, name: "Buy milk", no date, no duration, priority: p2, isBacklog: true
 *
 * 5. "#personal Call dentist someday"
 *    → project: "personal", name: "Call dentist", no date, backlog: true, priority: p2
 *
 * Free-order examples (all three produce identical output):
 *
 * 6. "#App Make an update tomorrow 12:00 [1hr]"
 *    → project: "app", name: "Make an update", date: tomorrow 12:00, duration: 60min, priority: p2
 *
 * 7. "Make an update tomorrow 12pm [1hr] #app"
 *    → project: "app", name: "Make an update", date: tomorrow 12:00, duration: 60min, priority: p2
 *
 * 8. "Make an #app update tomorrow at 12 for [1hr]"
 *    → project: "app", name: "Make an update", date: tomorrow 12:00, duration: 60min, priority: p2
 *
 * 9. "Call dentist friday 3pm [30min] p1 #health"
 *    → project: "health", name: "Call dentist", date: friday 15:00, duration: 30min, priority: p1
 *
 * 10. "[2hr] p2 #work standup tomorrow 9am"
 *     → project: "work", name: "standup", date: tomorrow 09:00, duration: 120min, priority: p2
 */

import * as chrono from 'chrono-node';

export type ParsedTask = {
  name: string;
  project?: string;
  scheduledAt?: Date;
  duration?: number;
  priority: 'p1' | 'p2' | 'p3';
  isBacklog: boolean;
};

export function parseTask(input: string): ParsedTask {
  const raw = input.trim();

  // ── Step 1: Collect token ranges to remove ──────────────────────────────
  const removals: Array<{ start: number; end: number }> = [];

  // Project: first #tag found anywhere (must start with a letter)
  let project: string | undefined;
  const projectRe = /#([a-zA-Z]\w*)/g;
  const projectMatch = projectRe.exec(raw);
  if (projectMatch) {
    project = projectMatch[1].toLowerCase();
    removals.push({ start: projectMatch.index, end: projectMatch.index + projectMatch[0].length });
  }

  // Duration: [2hr], [45min], [1.5hr], [30m], [2h] — anywhere in string
  let duration: number | undefined;
  const durationRe = /\[(\d+(?:\.\d+)?)\s*(hr?|hour|min?|minutes?)\]/i;
  const durationMatch = raw.match(durationRe);
  if (durationMatch && durationMatch.index !== undefined) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit.startsWith('h') ? Math.round(value * 60) : Math.round(value);
    // Extend removal backwards to include "for " immediately before [duration]
    let dStart = durationMatch.index;
    const before = raw.slice(0, dStart);
    const forMatch = before.match(/\bfor\s*$/i);
    if (forMatch) dStart -= forMatch[0].length;
    removals.push({ start: dStart, end: durationMatch.index + durationMatch[0].length });
  }

  // Priority: p1, p2, p3 standalone word — anywhere in string
  let priority: 'p1' | 'p2' | 'p3' = 'p2';
  const priorityRe = /\b(p[123])\b/i;
  const priorityMatch = raw.match(priorityRe);
  if (priorityMatch && priorityMatch.index !== undefined) {
    priority = priorityMatch[1].toLowerCase() as 'p1' | 'p2' | 'p3';
    removals.push({ start: priorityMatch.index, end: priorityMatch.index + priorityMatch[0].length });
  }

  // ── Step 2: Reconstruct remainder with all token ranges removed ──────────
  removals.sort((a, b) => a.start - b.start);
  let remainder = '';
  let pos = 0;
  for (const { start, end } of removals) {
    if (start > pos) remainder += raw.slice(pos, start);
    pos = end;
  }
  remainder += raw.slice(pos);

  // Strip backlog keywords (they never contribute to the name)
  remainder = remainder.replace(/\b(someday|eventually|one day)\b/gi, '');

  // ── Step 3: Run chrono-node on the cleaned remainder ────────────────────
  remainder = remainder.replace(/\s{2,}/g, ' ').trim();
  const parsed = chrono.parse(remainder, new Date(), { forwardDate: true });
  let scheduledAt: Date | undefined;
  if (parsed.length > 0) {
    scheduledAt = parsed[0].start.date();
    remainder =
      remainder.slice(0, parsed[0].index).trim() +
      ' ' +
      remainder.slice(parsed[0].index + parsed[0].text.length).trim();
    remainder = remainder.trim();
  }

  // ── Step 4: Clean up the task name ──────────────────────────────────────
  const name = remainder
    .replace(/\s{2,}/g, ' ')
    .replace(/^(at|for|on|from)\s+/i, '')
    .replace(/\s+(at|for|on)\s*$/i, '')
    .trim();

  return {
    name: name || input.trim(),
    project,
    scheduledAt,
    duration,
    priority,
    isBacklog: !scheduledAt,
  };
}
