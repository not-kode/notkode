import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isBotUA } from '@/lib/bot';
import { isInternalRequest } from '@/lib/internal-ip';

// Tracking próprio, leve e à prova de falhas: grava um evento em `events`.
// Nunca deve quebrar o site — qualquer erro é engolido e respondido com ok:false.

const EVENT_TYPES = new Set(['page_view', 'cta_click', 'form_start', 'form_step', 'form_submit']);
const str = (v: unknown, max = 512): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};

export async function POST(req: Request) {
  // Robô (crawler, preview de link) não vira métrica de visita.
  const ua = req.headers.get('user-agent');
  if (isBotUA(ua)) return NextResponse.json({ ok: true });

  // Tráfego interno da equipe (IP configurado) não vira métrica.
  if (isInternalRequest(req)) return NextResponse.json({ ok: true });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = str(body.type, 32);
  if (!type || !EVENT_TYPES.has(type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const row = {
    ua: ua!.slice(0, 256),
    type,
    page: str(body.page),
    label: str(body.label),
    service_tag: str(body.service_tag, 64),
    session_id: str(body.session_id, 64),
    locale: str(body.locale, 8),
    // Origem de entrada da sessão, enviada pelo cliente (analytics.tsx). NÃO usar
    // o header Referer do beacon como fallback: ele aponta para a própria página
    // que disparou o evento, o que mascarava toda origem externa como interna.
    referrer: str(body.referrer),
    utm_source: str(body.utm_source, 128),
    utm_medium: str(body.utm_medium, 128),
    utm_campaign: str(body.utm_campaign, 128),
    utm_term: str(body.utm_term, 128),
    utm_content: str(body.utm_content, 128),
  };

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('events').insert(row);
  } catch (e) {
    console.error('[track] insert failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
