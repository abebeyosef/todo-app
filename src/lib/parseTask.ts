/**
 * parseTask — Natural language task input parser
 *
 * Test cases (all must produce the correct output):
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
  let raw = input.trim();

  // Extract #project tag (must be at the start)
  let project: string | undefined;
  const projectMatch = raw.match(/^#(\S+)\s*/);
  if (projectMatch) {
    project = projectMatch[1].toLowerCase();
    raw = raw.slice(projectMatch[0].length);
  }

  // Extract [duration] — e.g. [2hr], [45min], [1.5hr], [30m], [2h]
  let duration: number | undefined;
  const durationMatch = raw.match(/\[(\d+(?:\.\d+)?)\s*(hr?|hour|min?|minutes?)\]/i);
  if (durationMatch) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit.startsWith('h') ? Math.round(value * 60) : Math.round(value);
    raw = raw.replace(durationMatch[0], '').trim();
  }

  // Extract priority: p1, p2, or p3 (case-insensitive, standalone)
  let priority: 'p1' | 'p2' | 'p3' = 'p2';
  const priorityMatch = raw.match(/\b(p[123])\b/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as 'p1' | 'p2' | 'p3';
    raw = raw.replace(priorityMatch[0], '').trim();
  }

  // Strip backlog keywords so they don't end up in the task name
  raw = raw.replace(/\b(someday|eventually|one day)\b/gi, '').replace(/\s{2,}/g, ' ').trim();

  // Extract date/time using chrono-node (handles combined date+time: "tomorrow 12:00", "friday 2:30pm")
  const parsed = chrono.parse(raw, new Date(), { forwardDate: true });
  let scheduledAt: Date | undefined;
  if (parsed.length > 0) {
    scheduledAt = parsed[0].start.date();
    // Remove the matched date text from the name
    raw =
      raw.slice(0, parsed[0].index).trim() +
      ' ' +
      raw.slice(parsed[0].index + parsed[0].text.length).trim();
    raw = raw.trim();
  }

  // Clean up any leftover double spaces
  const name = raw.replace(/\s{2,}/g, ' ').trim();

  return {
    name: name || input.trim(),
    project,
    scheduledAt,
    duration,
    priority,
    isBacklog: !scheduledAt,
  };
}
