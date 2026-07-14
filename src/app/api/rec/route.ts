import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Ingestão das gravações de sessão (rrweb). Recebe um "chunk" de eventos e grava
// em session_recordings. À prova de falhas — nunca deve afetar o site.

export async function POST(req: Request) {
  let body: { session_id?: unknown; page?: unknown; events?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session_id = typeof body.session_id === 'string' ? body.session_id.slice(0, 64) : null;
  const page = typeof body.page === 'string' ? body.page.slice(0, 512) : null;
  const events = Array.isArray(body.events) ? body.events : null;

  if (!session_id || !events || events.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('session_recordings').insert({ session_id, page, events });
  } catch (e) {
    console.error('[rec] insert failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
