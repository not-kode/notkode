'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { MODELO_DE_FABRICA, lerClausulas, type Bloco } from '@/app/admin/contrato/modelo';

export type ModeloResultado = { ok: boolean; erro?: string; id?: string };

function revalidar() {
  revalidatePath('/admin/clientes');
}

/** Cria um modelo novo já com as cláusulas do padrão, para só ajustar o que muda. */
export async function criarModelo(formData: FormData): Promise<ModeloResultado> {
  const nome = String(formData.get('nome') ?? '').trim();
  if (!nome) return { ok: false, erro: 'Dê um nome ao modelo.' };

  const db = getSupabaseAdmin();
  const { count } = await db.from('contract_templates').select('id', { count: 'exact', head: true });

  const { data, error } = await db
    .from('contract_templates')
    .insert({
      nome,
      descricao: String(formData.get('descricao') ?? '').trim() || null,
      clausulas: MODELO_DE_FABRICA.clausulas,
      // O primeiro modelo cadastrado vira o padrão: sem isso, ninguém seria.
      padrao: (count ?? 0) === 0,
      ordem: count ?? 0,
    })
    .select('id')
    .single();

  if (error || !data) return { ok: false, erro: `Não deu para criar: ${error?.message ?? 'erro desconhecido'}` };
  revalidar();
  return { ok: true, id: data.id };
}

/** Salva nome, descrição, escopo sugerido e a lista de cláusulas. */
export async function salvarModelo(dados: {
  id: string;
  nome: string;
  descricao: string | null;
  escopo_padrao: string | null;
  clausulas: Bloco[];
}): Promise<ModeloResultado> {
  if (!dados.id) return { ok: false, erro: 'Modelo não informado.' };
  if (!dados.nome.trim()) return { ok: false, erro: 'O modelo precisa de um nome.' };

  const clausulas = lerClausulas(dados.clausulas);
  if (clausulas.length === 0) return { ok: false, erro: 'O modelo precisa de pelo menos uma cláusula.' };

  const { error } = await getSupabaseAdmin()
    .from('contract_templates')
    .update({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      escopo_padrao: dados.escopo_padrao?.trim() || null,
      clausulas,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dados.id);

  if (error) return { ok: false, erro: `Não deu para salvar: ${error.message}` };
  revalidar();
  return { ok: true };
}

/** Marca o modelo que os contratos usam quando não escolhem nenhum. */
export async function definirPadrao(formData: FormData): Promise<ModeloResultado> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, erro: 'Modelo não informado.' };

  const db = getSupabaseAdmin();
  // O índice único exige que o anterior saia do padrão antes.
  await db.from('contract_templates').update({ padrao: false }).eq('padrao', true);
  const { error } = await db.from('contract_templates').update({ padrao: true }).eq('id', id);

  if (error) return { ok: false, erro: `Não deu para marcar: ${error.message}` };
  revalidar();
  return { ok: true };
}

/** Duplica um modelo, para partir de um parecido em vez do zero. */
export async function duplicarModelo(formData: FormData): Promise<ModeloResultado> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, erro: 'Modelo não informado.' };

  const db = getSupabaseAdmin();
  const { data: base } = await db
    .from('contract_templates').select('nome, descricao, escopo_padrao, clausulas').eq('id', id).maybeSingle();
  if (!base) return { ok: false, erro: 'Modelo não encontrado.' };

  const { data, error } = await db
    .from('contract_templates')
    .insert({
      nome: `${base.nome} (cópia)`,
      descricao: base.descricao,
      escopo_padrao: base.escopo_padrao,
      clausulas: base.clausulas,
    })
    .select('id')
    .single();

  if (error || !data) return { ok: false, erro: `Não deu para duplicar: ${error?.message ?? 'erro'}` };
  revalidar();
  return { ok: true, id: data.id };
}

/**
 * Exclui o modelo. Contrato que usava fica com modelo nulo e passa a gerar pelo
 * padrão: documento já assinado não muda, porque foi congelado no envio.
 */
export async function excluirModelo(formData: FormData): Promise<ModeloResultado> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, erro: 'Modelo não informado.' };

  const db = getSupabaseAdmin();
  const { data: alvo } = await db.from('contract_templates').select('padrao').eq('id', id).maybeSingle();
  if (alvo?.padrao) return { ok: false, erro: 'Este é o modelo padrão. Marque outro como padrão antes de excluir.' };

  const { error } = await db.from('contract_templates').delete().eq('id', id);
  if (error) return { ok: false, erro: `Não deu para excluir: ${error.message}` };
  revalidar();
  return { ok: true };
}

/** Escolhe o modelo que um contrato usa (vazio volta para o padrão). */
export async function definirModeloDoContrato(formData: FormData): Promise<ModeloResultado> {
  const engagementId = String(formData.get('engagement_id') ?? '');
  const templateId = String(formData.get('template_id') ?? '');
  if (!engagementId) return { ok: false, erro: 'Contrato não informado.' };

  const { error } = await getSupabaseAdmin()
    .from('engagements')
    .update({ contract_template_id: templateId || null, updated_at: new Date().toISOString() })
    .eq('id', engagementId);

  if (error) return { ok: false, erro: `Não deu para salvar: ${error.message}` };
  revalidar();
  return { ok: true };
}
