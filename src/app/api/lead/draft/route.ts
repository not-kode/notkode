import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Captura progressiva de formulário: grava o que a pessoa já preencheu (com algum
// contato) antes de enviar. Upsert por session_id. À prova de falhas — nunca quebra o site.

const str = (v: unknown, max = 512): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session_id = str(body.session_id, 64);
  if (!session_id) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Envio confirmado: só carimba a hora e sai (o lead real já foi para lead_submissions).
  if (body.submitted === true) {
    try {
      await supabase
        .from('lead_drafts')
        .upsert(
          { session_id, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { onConflict: 'session_id' },
        );
    } catch {
      /* engole */
    }
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name, 200);
  const email = str(body.email, 200);
  const whatsapp = str(body.whatsapp, 40);
  const needs = Array.isArray(body.needs)
    ? (body.needs.filter((n) => typeof n === 'string').slice(0, 30) as string[])
    : null;
  const timing = str(body.timing, 120);
  const description = str(body.description, 2000);

  // Registra assim que a pessoa escolhe/preenche QUALQUER coisa (necessidade, prazo,
  // descrição ou contato) — mesmo antes de se identificar. Só ignora o rascunho
  // totalmente vazio. Upsert por session_id, então não duplica: atualiza o mesmo.
  const hasAnything = !!(name || email || whatsapp || (needs && needs.length) || timing || description);
  if (!hasAnything) return NextResponse.json({ ok: true });

  const row = {
    session_id,
    service_tag: str(body.service_tag, 64),
    kind: str(body.kind, 32),
    name,
    company: str(body.company, 200),
    email,
    whatsapp,
    needs,
    timing,
    description,
    last_step: str(body.last_step, 120),
    utm_source: str(body.utm_source, 128),
    utm_medium: str(body.utm_medium, 128),
    utm_campaign: str(body.utm_campaign, 128),
    updated_at: new Date().toISOString(),
  };

  try {
    await supabase.from('lead_drafts').upsert(row, { onConflict: 'session_id' });
  } catch (e) {
    console.error('[lead/draft] upsert failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
