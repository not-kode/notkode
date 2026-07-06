import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Upload de anexo do briefing (ex.: estudo de público).
// O cliente envia o arquivo via multipart; o servidor grava no bucket privado
// `onboarding` com service-role. Retorna o path guardado nas respostas.
export const runtime = 'nodejs';

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form' }, { status: 400 });
  }

  const token = String(form.get('token') ?? '');
  const file = form.get('file');

  if (!token || !(file instanceof File)) {
    return NextResponse.json({ error: 'token e file são obrigatórios' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'arquivo acima de 15 MB' }, { status: 413 });
  }

  const supabase = getSupabaseAdmin();

  // Valida que o token existe (evita upload para briefing inexistente).
  const { data: briefing } = await supabase
    .from('onboarding_briefings')
    .select('id')
    .eq('token', token)
    .maybeSingle();
  if (!briefing) {
    return NextResponse.json({ error: 'briefing não encontrado' }, { status: 404 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const path = `${token}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('onboarding')
    .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });

  if (error) {
    console.error('[onboarding] upload:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path, name: file.name });
}
