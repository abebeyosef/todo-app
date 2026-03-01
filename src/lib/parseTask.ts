/**
 * parseTask — Natural language task input parser
 *
 * Test inputs:
 *   "#app Make a new app tomorrow 1pm [2hr] p1"
 *     → project: "app", name: "Make a new app", scheduledAt: tomorrow 13:00, duration: 120, priority: "p1"
 *
 *   "#health Morning run today 7am [45min]"
 *     → project: "health", name: "Morning run", scheduledAt: today 07:00, duration: 45, priority: "p2"
 *
 *   "#personal Call dentist someday"
 *     → project: "personal", name: "Call dentist someday", scheduledAt: undefined, priority: "p2", isBacklog: true
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

  // Extract date/time using chrono-node
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
