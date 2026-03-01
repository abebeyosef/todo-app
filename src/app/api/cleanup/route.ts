import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const { error, count } = await supabase
    .from('tasks')
    .delete({ count: 'exact' })
    .eq('completed', true)
    .lt('completed_at', cutoff.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: count });
}
