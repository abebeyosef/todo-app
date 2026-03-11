import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase admin client.
 * Uses the service role key so it bypasses RLS — safe because it only runs
 * in Next.js API routes (server-side), never in the browser.
 *
 * NEVER import this in client components ('use client' files).
 *
 * Setup: add SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables
 * and to .env.local. Get the key from Supabase Dashboard → Settings → API →
 * Service Role Key (secret).
 *
 * Falls back to the anon key if the service role key is not yet configured —
 * this maintains existing behaviour but RLS-protected deletes will not work
 * until the service role key is added.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPA_SERVICE_KEY ||          // name used in Vercel env vars
  process.env.SUPABASE_SERVICE_ROLE_KEY ||  // fallback for standard naming
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // last resort — no RLS bypass

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
