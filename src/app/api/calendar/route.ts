import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

function getCalendar(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
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
      const end = new Date(start.getTime() + (task.duration ?? 60) * 60 * 1000);
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: task.name,
          description: task.project ? `#${task.project}` : undefined,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        },
      });
      return NextResponse.json({ id: res.data.id ?? null });
    }

    if (action === 'update') {
      if (!googleEventId || !task.scheduledAt) return NextResponse.json({ ok: true });
      const start = new Date(task.scheduledAt);
      const end = new Date(start.getTime() + (task.duration ?? 60) * 60 * 1000);
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: {
          summary: task.completed ? `✓ ${task.name}` : task.name,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
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
    // Silently swallow calendar errors — task ops still succeed
    console.error('Calendar error:', e);
    return NextResponse.json({ ok: true });
  }
}
