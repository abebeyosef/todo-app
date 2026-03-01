import { google } from 'googleapis';
import { Task } from '@/types/task';

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

export async function createEvent(
  task: Task,
  accessToken: string
): Promise<string | null> {
  if (!task.scheduledAt) return null;
  try {
    const calendar = getCalendarClient(accessToken);
    const start = task.scheduledAt;
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
    return res.data.id ?? null;
  } catch {
    return null;
  }
}

export async function updateEvent(
  task: Task,
  googleEventId: string,
  accessToken: string
): Promise<void> {
  if (!task.scheduledAt) return;
  try {
    const calendar = getCalendarClient(accessToken);
    const start = task.scheduledAt;
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
  } catch {
    // Silently ignore — calendar event may have been deleted manually
  }
}

export async function deleteEvent(
  googleEventId: string,
  accessToken: string
): Promise<void> {
  try {
    const calendar = getCalendarClient(accessToken);
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    });
  } catch {
    // Silently ignore
  }
}
