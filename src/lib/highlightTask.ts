/**
 * highlightTask — builds highlighted HTML for the InlineTaskForm mirror div.
 *
 * Detects tokens (project, date/time, duration, priority) in the raw input string
 * and wraps them in coloured <span> elements. The mirror div is rendered behind
 * a transparent <input> so the highlights show through the user's typing.
 */

import * as chrono from 'chrono-node';

type TokenType = 'project' | 'date' | 'duration' | 'p1' | 'p2' | 'p3';

type TokenRange = {
  start: number;
  end: number;
  type: TokenType;
};

const TOKEN_STYLES: Record<TokenType, string> = {
  project:  'background:#FFEED9;color:#B45309;border-radius:4px;padding:0 2px;',
  date:     'background:#E8F4FD;color:#1D6FA4;border-radius:4px;padding:0 2px;',
  duration: 'background:#F0F0F0;color:#555555;border-radius:4px;padding:0 2px;',
  p1:       'background:#FDECEA;color:#DB4035;border-radius:4px;padding:0 2px;',
  p2:       'background:#FFF3E0;color:#D97706;border-radius:4px;padding:0 2px;',
  p3:       'background:#F5F5F5;color:#888888;border-radius:4px;padding:0 2px;',
};

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getTokenRanges(text: string, projectNames: string[]): TokenRange[] {
  const ranges: TokenRange[] = [];

  // #project — highlight anywhere it appears, if it matches a known project
  const projectRe = /#([a-zA-Z]\w*)/g;
  const projectMatch = projectRe.exec(text);
  if (projectMatch) {
    const name = projectMatch[1].toLowerCase();
    if (projectNames.some((p) => p.toLowerCase() === name)) {
      ranges.push({ start: projectMatch.index, end: projectMatch.index + projectMatch[0].length, type: 'project' });
    }
  }

  // [duration] — e.g. [1hr], [45min], [1.5hr]
  const durationMatch = text.match(/\[(\d+(?:\.\d+)?)\s*(hr?|hour|min?|minutes?)\]/i);
  if (durationMatch && durationMatch.index !== undefined) {
    ranges.push({
      start: durationMatch.index,
      end: durationMatch.index + durationMatch[0].length,
      type: 'duration',
    });
  }

  // Priority: p1, p2, p3 (standalone word)
  const priorityMatch = text.match(/\b(p[123])\b/i);
  if (priorityMatch && priorityMatch.index !== undefined) {
    const type = priorityMatch[1].toLowerCase() as 'p1' | 'p2' | 'p3';
    ranges.push({
      start: priorityMatch.index,
      end: priorityMatch.index + priorityMatch[0].length,
      type,
    });
  }

  // Date/time using chrono-node
  const chronoParsed = chrono.parse(text, new Date(), { forwardDate: true });
  for (const result of chronoParsed) {
    ranges.push({
      start: result.index,
      end: result.index + result.text.length,
      type: 'date',
    });
  }

  return ranges;
}

/**
 * Returns an HTML string with detected tokens wrapped in coloured <span> elements.
 * Safe to pass to dangerouslySetInnerHTML — all non-token text is HTML-escaped.
 */
export function buildHighlightedHTML(text: string, projectNames: string[]): string {
  if (!text) return '';

  const ranges = getTokenRanges(text, projectNames);

  // Sort by start index, remove overlapping ranges
  const sorted = ranges.sort((a, b) => a.start - b.start);
  const nonOverlapping: TokenRange[] = [];
  let lastEnd = 0;
  for (const r of sorted) {
    if (r.start >= lastEnd) {
      nonOverlapping.push(r);
      lastEnd = r.end;
    }
  }

  let html = '';
  let pos = 0;
  for (const range of nonOverlapping) {
    if (range.start > pos) {
      html += escapeHTML(text.slice(pos, range.start));
    }
    const tokenText = escapeHTML(text.slice(range.start, range.end));
    html += `<span style="${TOKEN_STYLES[range.type]}">${tokenText}</span>`;
    pos = range.end;
  }
  if (pos < text.length) {
    html += escapeHTML(text.slice(pos));
  }

  return html;
}
