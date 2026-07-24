import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isBotUA } from '@/lib/bot';
import { isInternalRequest } from '@/lib/internal-ip';

// Ingestão das gravações de sessão (rrweb). Recebe um "chunk" de eventos e grava
// em session_recordings. À prova de falhas — nunca deve afetar o site.

export async function POST(req: Request) {
  // Robô (crawler, preview de link) não vira gravação de sessão.
  const ua = req.headers.get('user-agent');
  if (isBotUA(ua)) return NextResponse.json({ ok: true });

  // Tráfego interno da equipe (IP configurado) não vira gravação.
  if (isInternalRequest(req)) return NextResponse.json({ ok: true });

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
    await supabase.from('session_recordings').insert({ session_id, page, events, ua: ua!.slice(0, 256) });
  } catch (e) {
    console.error('[rec] insert failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
