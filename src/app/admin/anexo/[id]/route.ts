import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Download de anexo de tarefa. O bucket é privado: aqui o link assinado é criado
// na hora e vale um minuto, o suficiente para o navegador buscar o arquivo.
//
// Quem chega aqui já passou pelo middleware do /admin, que exige sessão — é o
// que mantém o anexo interno, fora do link de acompanhamento do cliente.
//
// O arquivo sai sempre como download, nunca renderizado: um .html ou .svg aberto
// no navegador rodaria script no domínio do Storage.

const BUCKET = 'task-attachments';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ erro: 'Anexo inválido.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('task_attachments')
    .select('storage_path, file_name')
    .eq('id', id)
    .maybeSingle();

  const anexo = data as { storage_path: string; file_name: string } | null;
  if (!anexo) return NextResponse.json({ erro: 'Anexo não encontrado.' }, { status: 404 });

  const { data: assinado, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(anexo.storage_path, 60, { download: anexo.file_name });

  if (error || !assinado) {
    return NextResponse.json({ erro: 'Não deu para abrir o arquivo.' }, { status: 500 });
  }
  return NextResponse.redirect(assinado.signedUrl);
}
