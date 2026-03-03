import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

function getCalendar(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

function isAllDay(scheduledAt: Date): boolean {
  return scheduledAt.getHours() === 0 && scheduledAt.getMinutes() === 0;
}

function buildEventTimes(scheduledAt: Date, durationMinutes?: number) {
  if (isAllDay(scheduledAt)) {
    const dateStr = scheduledAt.toISOString().split('T')[0];
    return {
      start: { date: dateStr },
      end: { date: dateStr },
    };
  }
  const end = new Date(scheduledAt.getTime() + (durationMinutes ?? 60) * 60 * 1000);
  return {
    start: { dateTime: scheduledAt.toISOString() },
    end: { dateTime: end.toISOString() },
  };
}

export async function POST(req: NextRequest) {
  const { action, accessToken, task, googleEventId } = await req.json();

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  const calendar = getCalendar(accessToken);

  try {
    if (action === 'create') {
      if (!task.scheduledAt) return NextResponse.json({ id: null });
      const start = new Date(task.scheduledAt);
      const times = buildEventTimes(start, task.duration);
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: task.name,
          description: task.project ? `#${task.project}` : undefined,
          ...times,
        },
      });
      return NextResponse.json({ id: res.data.id ?? null });
    }

    if (action === 'update') {
      if (!googleEventId || !task.scheduledAt) return NextResponse.json({ ok: true });
      const start = new Date(task.scheduledAt);
      const times = buildEventTimes(start, task.duration);
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: {
          summary: task.completed ? `✓ ${task.name}` : task.name,
          ...times,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete') {
      if (!googleEventId) return NextResponse.json({ ok: true });
      await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('Calendar error:', e);
    return NextResponse.json({ error: 'calendar_failed' }, { status: 500 });
  }
}
