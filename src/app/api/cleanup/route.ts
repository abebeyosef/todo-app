import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  // Protect against unauthorised callers.
  // Vercel cron jobs automatically send: Authorization: Bearer {CRON_SECRET}
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  // Uses the service role key so this works even with RLS enabled on the tasks table.
  const { error, count } = await supabaseAdmin
    .from('tasks')
    .delete({ count: 'exact' })
    .eq('completed', true)
    .lt('completed_at', cutoff.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: count });
}
